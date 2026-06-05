"""Smart CSV parsing with auto-detection for bank statements.

Self-healing heuristics:
- Skips metadata rows before the actual CSV header
- Auto-detects sign convention (negative=debit vs positive=debit)
- Detects and excludes balance/running-balance columns
- Filters income rows (salary, deposits, transfers in) by description
- Handles Unicode minus sign and parentheses negatives
- Supports single-amount, debit-only, and split debit/credit column layouts
"""

import io
import math
import re
import hashlib
from typing import Optional
import pandas as pd
from column_classifier import classify_all_columns, LABELS


# ─── Column name patterns ────────────────────────────────────────────────────

DATE_PATTERNS = [
    "date", "posted", "transaction date", "trans date", "posting date",
    "txn date", "txn. date", "value date", "val date",
]
DESCRIPTION_PATTERNS = [
    "description", "merchant", "payee", "memo", "narrative", "details",
    "particulars", "narration", "remarks", "transaction particulars",
    "transaction description", "trans description",
]
AMOUNT_PATTERNS = ["amount", "value", "sum", "total", "txn amount"]
DEBIT_PATTERNS = [
    "debit", "withdrawal", "out", "dr", "dr.", "debit amount", "withdrawal amt",
    "debit amt",
]
CREDIT_PATTERNS = [
    "credit", "deposit", "in", "cr", "cr.", "credit amount", "deposit amt",
    "credit amt",
]
BALANCE_PATTERNS = [
    "balance", "running bal", "running balance", "bal.", "avail balance",
    "available balance", "ledger balance", "closing balance",
]

# Description keywords that indicate income / credit transactions to skip
INCOME_KEYWORDS = [
    "PAYROLL", "SALARY", "DIRECT DEPOSIT", "DIRECT CREDIT", "PAY CREDIT",
    "WAGES", "STIPEND", "PENSION", "BENEFITS", "EMPLOYER",
    "INTEREST EARNED", "INTEREST CREDIT", "INTEREST PAYMENT",
    "TAX REFUND", "TAX RETURN",
    "TRANSFER IN", "FUNDS TRANSFER IN", "INWARD TRANSFER",
    "PAYMENT RECEIVED", "PAYMENT FROM",
    "OSKO PAYMENT", "OSKO CREDIT",
    "ACH CREDIT", "ACH DEPOSIT",
    "WIRE IN", "WIRE CREDIT", "WIRE TRANSFER IN",
    "OPENING BALANCE", "CLOSING BALANCE", "STATEMENT BALANCE",
    "REVERSAL", "REFUND",  # merchant refunds are credits; skip for leak detection
    "DIVIDEND", "CASHBACK", "CASH BACK", "REWARD",
]

# Regex patterns for income that need context (e.g. "ZELLE FROM" not "ZELLE TO")
INCOME_REGEX = [
    r"ZELLE\s+(FROM|RECEIVED|CREDIT)",
    r"VENMO\s+(CREDIT|FROM|RECEIVED)",
    r"CASH\s*APP\s+(CREDIT|RECEIVED|FROM)",
    r"PAYPAL\s+(CREDIT|FROM|RECEIVED)",
]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def find_column(columns: list[str], patterns: list[str]) -> Optional[str]:
    """Return the first column whose name contains any of the patterns (case-insensitive)."""
    columns_lower = {col.lower().strip(): col for col in columns}
    for pattern in patterns:
        for col_lower, col_original in columns_lower.items():
            if pattern in col_lower:
                return col_original
    return None


def normalize_merchant(merchant: str) -> str:
    """Normalize merchant names for consistent matching."""
    merchant = merchant.upper().strip()
    merchant = re.sub(r'\d{4,}', '', merchant)       # strip card/ref numbers
    merchant = re.sub(r'\s+', ' ', merchant)
    for prefix in ['SQ *', 'SP ', 'PAYPAL *', 'STRIPE *', 'PP*']:
        if merchant.startswith(prefix):
            merchant = merchant[len(prefix):]
    return merchant.strip()


def parse_amount(value) -> Optional[float]:
    """Parse amount string to float.

    Handles:
    - Currency symbols: $ £ € ₹ ¥
    - Unicode minus sign (U+2212) in addition to hyphen-minus
    - Indian lakh comma format: 1,23,456.78
    - Parentheses negatives: (50.00) → -50.00
    - Already-numeric values
    """
    if pd.isna(value) or value == '':
        return None
    if isinstance(value, (int, float)):
        result = float(value)
        return None if math.isnan(result) else result

    s = str(value).strip()
    # Replace Unicode minus sign (−, U+2212) with hyphen-minus
    s = s.replace('−', '-')
    # Remove currency symbols and commas/whitespace
    s = re.sub(r'[£$€₹¥,\s]', '', s)
    # Parentheses → negative
    if s.startswith('(') and s.endswith(')'):
        s = '-' + s[1:-1]
    try:
        return float(s)
    except ValueError:
        return None


def is_income_row(description: str) -> bool:
    """Return True if the description looks like income / credit (should be skipped)."""
    upper = description.upper().strip()
    for kw in INCOME_KEYWORDS:
        if kw in upper:
            return True
    for pattern in INCOME_REGEX:
        if re.search(pattern, upper):
            return True
    return False


def detect_sign_convention(series: pd.Series) -> str:
    """Auto-detect whether negative or positive values represent spending.

    Returns 'negative_debit' (most common: ANZ, NAB, CommBank, Barclays)
    or 'positive_debit' (Chase, BoA — all amounts shown as positive).
    """
    numeric = pd.to_numeric(series, errors='coerce').dropna()
    if numeric.empty:
        return 'negative_debit'
    neg_count = (numeric < 0).sum()
    pos_count = (numeric > 0).sum()
    # If ≥30 % of transactions are negative → sign encodes direction
    if neg_count >= pos_count * 0.3:
        return 'negative_debit'
    return 'positive_debit'


_DATE_FIELD_RE = re.compile(
    r'^\s*\d{1,2}[/\-.]\d{1,2}([/\-.]\d{2,4})?\s*$'
)


def detect_header_row(lines: list[str]) -> int:
    """Find the index of the actual CSV header row, skipping bank metadata.

    Some banks prepend account number, export date, etc. before the real header.
    Strategy:
    1. A row where the first comma-separated field looks like a date is data, not a header.
    2. Among the remaining rows, pick the one whose fields match the most column-name
       keywords (using word-boundary matching to avoid matching "credit" inside data text).
    3. If no row scores above 0, return -1 so the caller knows there is no header.
    """
    all_patterns = (
        DATE_PATTERNS + DESCRIPTION_PATTERNS + AMOUNT_PATTERNS +
        DEBIT_PATTERNS + CREDIT_PATTERNS + BALANCE_PATTERNS
    )
    best_row = -1
    best_score = 0
    for i, line in enumerate(lines[:20]):
        fields = line.split(',')
        first_field = fields[0].strip()
        # If the first field is date-shaped, this is a data row — skip
        if _DATE_FIELD_RE.match(first_field):
            continue
        score = 0
        lower = line.lower()
        for pattern in all_patterns:
            # Use word-boundary matching so "credit" inside "DIRECT CREDIT" data doesn't score
            if re.search(r'(?<![a-z])' + re.escape(pattern) + r'(?![a-z])', lower):
                score += 1
        if score > best_score:
            best_score = score
            best_row = i
    return best_row


# ─── Space-separated parser (Westpac / PNC style) ────────────────────────────

def parse_space_separated(content: str) -> list[dict]:
    """Parse space-separated bank statement text.

    Format: DATE DESCRIPTION DEBIT CREDIT BALANCE
    Handles multi-line descriptions where amounts appear on continuation lines.
    """
    transactions = []
    date_pattern = r'^(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+'
    lines = content.strip().split('\n')

    tx_blocks: list[dict] = []
    current_block: Optional[dict] = None

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        date_match = re.match(date_pattern, line_stripped)
        if date_match:
            if current_block:
                tx_blocks.append(current_block)
            current_block = {
                'date': date_match.group(1),
                'lines': [line_stripped[date_match.end():].strip()]
            }
        elif current_block:
            current_block['lines'].append(line_stripped)

    if current_block:
        tx_blocks.append(current_block)

    for block in tx_blocks:
        full_text = ' '.join(block['lines'])

        if is_income_row(full_text):
            continue
        # Legacy guard for ACH Deposit pattern
        upper = full_text.upper()
        if 'ACH DEPOSIT' in upper or ('DEPOSIT' in upper and 'ACH DEBIT' not in upper):
            continue

        amounts_found = []
        description_parts = []

        for line in reversed(block['lines']):
            parts = line.split()
            line_amounts = []
            line_desc = []
            found_non_numeric = False
            for part in reversed(parts):
                cleaned = part.replace(',', '').replace('$', '')
                try:
                    val = float(cleaned)
                    if not found_non_numeric and val >= 1.0:
                        line_amounts.insert(0, val)
                    else:
                        found_non_numeric = True
                        line_desc.insert(0, part)
                except ValueError:
                    found_non_numeric = True
                    line_desc.insert(0, part)

            if line_amounts and not amounts_found:
                amounts_found = line_amounts
                if line_desc:
                    description_parts = line_desc + description_parts
            else:
                description_parts = parts + description_parts

        if not amounts_found:
            continue

        description = ' '.join(description_parts).strip()
        if not description:
            continue

        amount = None
        if len(amounts_found) >= 2:
            for amt in amounts_found[:-1]:
                if amt > 0:
                    amount = amt
                    break
        elif len(amounts_found) == 1:
            amount = amounts_found[0]

        if amount and amount > 0 and not math.isnan(amount):
            transactions.append({
                "date": block['date'],
                "merchant": normalize_merchant(description),
                "original_merchant": description,
                "amount": amount,
            })

    return transactions


# ─── CSV parser ──────────────────────────────────────────────────────────────

def parse_csv(content: str) -> list[dict]:
    """Parse CSV bank statement and return normalised debit transactions.

    Returns list of dicts: [{date, merchant, original_merchant, amount}]
    Only spending rows are returned — income/credit rows are filtered out.
    """
    # ── Try space-separated (Westpac / fixed-width) first ──
    space_result = parse_space_separated(content)
    if space_result:
        return space_result

    # ── Load CSV, skipping bank metadata before the real header ──
    lines = content.splitlines()
    header_idx = detect_header_row(lines)

    df = None
    if header_idx >= 0:
        # Normal case: a header row was found
        trimmed = '\n'.join(lines[header_idx:])
        for sep in [',', ';', '\t', '|']:
            try:
                candidate = pd.read_csv(io.StringIO(trimmed), sep=sep)
                if len(candidate.columns) >= 2:
                    df = candidate
                    break
            except Exception:
                continue
    else:
        # No header row detected (e.g. real CommBank export) — use all rows as data
        full = '\n'.join(lines)
        for sep in [',', ';', '\t', '|']:
            try:
                candidate = pd.read_csv(io.StringIO(full), sep=sep, header=None)
                if len(candidate.columns) >= 2:
                    # Rename integer columns to strings so downstream code works
                    candidate.columns = [str(c) for c in candidate.columns]
                    df = candidate
                    break
            except Exception:
                continue

    if df is None or df.empty:
        return []

    columns = df.columns.tolist()

    # ── Identify column roles via ML classifier ──────────────────────────────
    # classify_all_columns uses the Random Forest model (if trained) or the
    # hand-crafted rule scorer as fallback.  Results: {col_name → type_label}
    col_types = classify_all_columns(df, sample_rows=50)

    def _first_col_of_type(type_label: str) -> Optional[str]:
        for col in columns:
            if col_types.get(col) == type_label:
                return col
        return None

    def _best_description_col() -> Optional[str]:
        """Among all description-typed columns, prefer the one with the most
        unique values — merchant names are more diverse than payment type codes."""
        desc_cols = [c for c in columns if col_types.get(c) == "description"]
        if not desc_cols:
            return None
        if len(desc_cols) == 1:
            return desc_cols[0]
        # Pick the column with highest unique-value ratio
        best, best_ratio = desc_cols[0], 0.0
        for c in desc_cols:
            vals = df[c].dropna().astype(str)
            ratio = vals.nunique() / max(1, len(vals))
            if ratio > best_ratio:
                best_ratio = ratio
                best = c
        return best

    date_col    = _first_col_of_type("date")
    desc_col    = _best_description_col()
    debit_col   = _first_col_of_type("debit")
    credit_col  = _first_col_of_type("credit")
    amount_col  = _first_col_of_type("amount")
    balance_col = _first_col_of_type("balance")

    # ── Rule-based fallbacks for columns the classifier missed ───────────────
    # (keeps backwards-compat for edge-case CSVs)
    if not date_col:
        date_col = find_column(columns, DATE_PATTERNS) or (columns[0] if columns else None)
    if not desc_col:
        desc_col = find_column(columns, DESCRIPTION_PATTERNS)
        if not desc_col:
            for col in columns:
                if col not in (date_col, balance_col) and df[col].dtype == object:
                    desc_col = col
                    break
    if not debit_col and not amount_col:
        debit_col  = find_column(columns, DEBIT_PATTERNS)
        credit_col = find_column(columns, CREDIT_PATTERNS)
        amount_col = find_column(columns, AMOUNT_PATTERNS)
    if not balance_col:
        balance_col = find_column(columns, BALANCE_PATTERNS)

    # If the classifier labelled the same column as both amount and balance, trust balance
    if amount_col and amount_col == balance_col:
        amount_col = None

    # ── Sign convention for single-amount-column files ──
    sign_convention = 'negative_debit'
    if amount_col and not debit_col:
        sign_convention = detect_sign_convention(df[amount_col])

    # ── Row iteration ──
    transactions = []

    for _, row in df.iterrows():
        date_val = str(row[date_col]).strip() if date_col else ''

        merchant_raw = str(row[desc_col]).strip() if desc_col else ''
        if not merchant_raw or merchant_raw.lower() == 'nan':
            continue

        # Skip income / credit rows
        if is_income_row(merchant_raw):
            continue

        amount: Optional[float] = None

        # ── Case 1: Separate debit + credit columns ──
        if debit_col and credit_col:
            debit  = parse_amount(row.get(debit_col, '')) or 0
            credit = parse_amount(row.get(credit_col, '')) or 0
            if abs(debit) > 0:
                amount = abs(debit)
            else:
                continue   # it's a credit — skip

        # ── Case 2: Debit-only column ──
        elif debit_col:
            raw = parse_amount(row.get(debit_col))
            if raw is None or raw == 0:
                continue
            amount = abs(raw)

        # ── Case 3: Single amount column ──
        elif amount_col:
            raw = parse_amount(row.get(amount_col))
            if raw is None or raw == 0:
                continue

            if sign_convention == 'negative_debit':
                # Negative values are spending; positive values are income/credits
                if raw > 0:
                    continue   # income row
                amount = abs(raw)
            else:
                # All values are positive; every row is a debit
                amount = abs(raw)

        # ── Case 4: Fallback — scan remaining numeric columns ──
        else:
            excluded = {date_col, desc_col, balance_col}
            for col in columns:
                if col in excluded:
                    continue
                raw = parse_amount(row.get(col))
                if raw is not None and raw != 0:
                    amount = abs(raw)
                    break
            if amount is None:
                continue

        if amount is None or amount == 0 or math.isnan(amount):
            continue

        transactions.append({
            "date": date_val,
            "merchant": normalize_merchant(merchant_raw),
            "original_merchant": merchant_raw,
            "amount": amount,
        })

    return transactions


# ─── Deduplication & merging ─────────────────────────────────────────────────

def transaction_hash(tx: dict) -> str:
    """Stable hash for deduplication: date + normalised merchant + amount."""
    key = f"{tx.get('date', '')}|{tx.get('merchant', '')}|{tx.get('amount', 0):.2f}"
    return hashlib.md5(key.encode()).hexdigest()


def merge_transactions(transactions: list[dict]) -> list[dict]:
    """Deduplicate and sort transactions (most recent first)."""
    seen: set[str] = set()
    unique: list[dict] = []
    for tx in transactions:
        h = transaction_hash(tx)
        if h not in seen:
            seen.add(h)
            unique.append(tx)

    def parse_date_for_sort(date_str: str) -> tuple:
        if not date_str:
            return (0, 0, 0)
        date_str = str(date_str).strip()
        if ' ' in date_str:
            date_str = date_str.split()[0]
        for sep in ['/', '-', '.']:
            if sep in date_str:
                parts = date_str.split(sep)
                if len(parts) >= 2:
                    try:
                        if len(parts[0]) == 4:              # YYYY-MM-DD
                            return (int(parts[0]), int(parts[1]), int(parts[2]) if len(parts) > 2 else 1)
                        elif len(parts[-1]) == 4:           # DD/MM/YYYY or MM/DD/YYYY
                            year = int(parts[-1])
                            return (year, int(parts[1]) if len(parts) > 2 else int(parts[0]), int(parts[0]))
                        elif len(parts[-1]) == 2:           # DD/MM/YY
                            year = 2000 + int(parts[-1])
                            return (year, int(parts[1]) if len(parts) > 2 else int(parts[0]), int(parts[0]))
                        else:                               # MM/DD (no year)
                            return (9999, int(parts[0]), int(parts[1]))
                    except (ValueError, IndexError):
                        pass
        return (0, 0, 0)

    unique.sort(key=lambda x: parse_date_for_sort(x.get('date', '')), reverse=True)
    return unique
