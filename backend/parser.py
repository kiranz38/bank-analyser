"""CSV parsing with heuristic column detection for bank statements."""

import io
import re
from typing import Optional
import pandas as pd


# Column name patterns for heuristic detection (Western + Indian banks)
DATE_PATTERNS = ["date", "posted", "transaction date", "trans date", "posting date",
                 "txn date", "txn. date", "value date", "val date"]
DESCRIPTION_PATTERNS = ["description", "merchant", "payee", "memo", "narrative", "details",
                        "particulars", "narration", "remarks", "transaction particulars"]
AMOUNT_PATTERNS = ["amount", "value", "sum", "total", "txn amount"]
DEBIT_PATTERNS = ["debit", "withdrawal", "out", "dr", "dr.", "debit amount", "withdrawal amt"]
CREDIT_PATTERNS = ["credit", "deposit", "in", "cr", "cr.", "credit amount", "deposit amt"]


def find_column(columns: list[str], patterns: list[str]) -> Optional[str]:
    """Find a column matching any of the given patterns (case-insensitive)."""
    columns_lower = {col.lower().strip(): col for col in columns}
    for pattern in patterns:
        for col_lower, col_original in columns_lower.items():
            if pattern in col_lower:
                return col_original
    return None


def normalize_merchant(merchant: str) -> str:
    """Normalize merchant names for consistent matching."""
    # Remove common suffixes and prefixes
    merchant = merchant.upper().strip()
    # Remove card numbers, reference numbers, dates
    merchant = re.sub(r'\d{4,}', '', merchant)
    merchant = re.sub(r'\s+', ' ', merchant)
    # Remove common payment processor prefixes
    for prefix in ['SQ *', 'SP ', 'PAYPAL *', 'STRIPE *', 'PP*']:
        if merchant.startswith(prefix):
            merchant = merchant[len(prefix):]
    return merchant.strip()


def parse_amount(value: str) -> Optional[float]:
    """Parse amount string to float, handling various formats.

    Supports:
    - Western: $1,234.56 or 1,234.56
    - Indian: ₹1,23,456.78 or 1,23,456.78 (lakhs format)
    - UK: £1,234.56
    - Negative: -$50.00 or (50.00)
    """
    if pd.isna(value) or value == '':
        return None
    if isinstance(value, (int, float)):
        return float(value)
    # Remove currency symbols (including Indian Rupee) and whitespace
    cleaned = re.sub(r'[£$€₹,\s]', '', str(value))
    # Handle parentheses for negative numbers
    if cleaned.startswith('(') and cleaned.endswith(')'):
        cleaned = '-' + cleaned[1:-1]
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_space_separated(content: str) -> list[dict]:
    """
    Parse space-separated bank statement text (like Westpac format).

    Handles multi-line descriptions where amounts appear on continuation lines.
    Format: DATE DESCRIPTION DEBIT CREDIT BALANCE
    """
    transactions = []
    date_pattern = r'^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+'

    lines = content.strip().split('\n')

    # First pass: identify transaction blocks (date line + continuation lines)
    tx_blocks = []
    current_block = None

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        date_match = re.match(date_pattern, line_stripped)

        if date_match:
            # Save previous block
            if current_block:
                tx_blocks.append(current_block)
            # Start new block
            current_block = {
                'date': date_match.group(1),
                'lines': [line_stripped[date_match.end():].strip()]
            }
        elif current_block:
            # Continuation line
            current_block['lines'].append(line_stripped)

    # Don't forget the last block
    if current_block:
        tx_blocks.append(current_block)

    # Second pass: parse each block
    for block in tx_blocks:
        full_text = ' '.join(block['lines'])
        full_text_upper = full_text.upper()

        # Skip header/balance/deposit lines
        if any(skip in full_text_upper for skip in ['OPENING BALANCE', 'CLOSING BALANCE', 'STATEMENT',
                                                     'DEPOSIT', 'TRANSFER IN', 'PAYMENT RECEIVED',
                                                     'OSKO PAYMENT', 'DIRECT CREDIT']):
            continue

        # Find amounts - look for rightmost numbers on the last line with amounts
        amounts_found = []
        description_parts = []

        # Check all lines for amounts (right to left, last line first)
        for line in reversed(block['lines']):
            parts = line.split()
            line_amounts = []
            line_desc = []

            # Scan from right - only count significant amounts (>= 1.00) as column amounts
            found_non_numeric = False
            for part in reversed(parts):
                cleaned = part.replace(',', '').replace('$', '')
                try:
                    val = float(cleaned)
                    # Only consider amounts >= 1.00 as column amounts (debit/credit/balance)
                    # Smaller amounts like $0.50 fee are part of description
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

        # Extract transaction amount (exclude balance which is usually last)
        amount = None
        if len(amounts_found) >= 2:
            for amt in amounts_found[:-1]:
                if amt > 0:
                    amount = amt
                    break
        elif len(amounts_found) == 1:
            amount = amounts_found[0]

        if amount and amount > 0:
            transactions.append({
                "date": block['date'],
                "merchant": normalize_merchant(description),
                "original_merchant": description,
                "amount": amount
            })

    return transactions


def parse_csv(content: str) -> list[dict]:
    """
    Parse CSV content and return normalized transaction data.

    Returns list of dicts: [{date, merchant, amount}]
    Includes all transactions (both debits and credits are captured).
    """
    # First try space-separated format (Westpac style)
    space_result = parse_space_separated(content)
    if space_result:
        return space_result

    # Try to parse CSV
    try:
        df = pd.read_csv(io.StringIO(content))
    except Exception:
        # Try with different separators
        for sep in [';', '\t', '|']:
            try:
                df = pd.read_csv(io.StringIO(content), sep=sep)
                break
            except Exception:
                continue
        else:
            raise ValueError("Could not parse CSV content")

    if df.empty:
        return []

    columns = df.columns.tolist()

    # Find date column
    date_col = find_column(columns, DATE_PATTERNS)
    if not date_col and columns:
        # Assume first column is date if no match
        date_col = columns[0]

    # Find description column
    desc_col = find_column(columns, DESCRIPTION_PATTERNS)
    if not desc_col:
        # Try to find a text-heavy column
        for col in columns:
            if col != date_col and df[col].dtype == object:
                desc_col = col
                break

    # Find amount column(s)
    amount_col = find_column(columns, AMOUNT_PATTERNS)
    debit_col = find_column(columns, DEBIT_PATTERNS)
    credit_col = find_column(columns, CREDIT_PATTERNS)

    transactions = []

    for _, row in df.iterrows():
        # Get date
        date_val = str(row.get(date_col, '')) if date_col else ''

        # Get merchant/description
        merchant = str(row.get(desc_col, '')) if desc_col else ''
        if not merchant or merchant == 'nan':
            continue

        amount = None

        # Calculate amount
        if debit_col and credit_col:
            # Separate debit/credit columns
            debit = parse_amount(row.get(debit_col, 0)) or 0
            credit = parse_amount(row.get(credit_col, 0)) or 0
            # We want debits (spending)
            if abs(debit) > 0:
                amount = abs(debit)
            elif abs(credit) > 0:
                # Skip credits/deposits
                continue
        elif debit_col:
            # Only debit column - all values are spending
            amount = parse_amount(row.get(debit_col))
            if amount is not None:
                amount = abs(amount)
        elif amount_col:
            # Single amount column - negative = debit, positive = credit
            amount = parse_amount(row.get(amount_col))
            if amount is None:
                continue
            # Negative amounts are debits (spending)
            # Positive amounts could be credits OR debits depending on bank format
            # We'll include all non-zero amounts and let user filter
            if amount == 0:
                continue
            # If negative, it's definitely a debit
            # If positive, we still include it (many banks show debits as positive)
            amount = abs(amount)
        else:
            # Try to find any numeric column
            for col in columns:
                if col not in [date_col, desc_col]:
                    amount = parse_amount(row.get(col))
                    if amount is not None and amount != 0:
                        amount = abs(amount)
                        break
            else:
                continue

        if amount is None or amount == 0:
            continue

        transactions.append({
            "date": date_val,
            "merchant": normalize_merchant(merchant),
            "original_merchant": merchant.strip(),
            "amount": amount
        })

    return transactions
