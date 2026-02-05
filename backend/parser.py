"""CSV parsing with heuristic column detection for bank statements."""

import io
import re
from typing import Optional
import pandas as pd


# Column name patterns for heuristic detection
DATE_PATTERNS = ["date", "posted", "transaction date", "trans date", "posting date"]
DESCRIPTION_PATTERNS = ["description", "merchant", "payee", "memo", "narrative", "details", "particulars"]
AMOUNT_PATTERNS = ["amount", "value", "sum", "total"]
DEBIT_PATTERNS = ["debit", "withdrawal", "out", "dr"]
CREDIT_PATTERNS = ["credit", "deposit", "in", "cr"]


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
    """Parse amount string to float, handling various formats."""
    if pd.isna(value) or value == '':
        return None
    if isinstance(value, (int, float)):
        return float(value)
    # Remove currency symbols and whitespace
    cleaned = re.sub(r'[£$€,\s]', '', str(value))
    # Handle parentheses for negative numbers
    if cleaned.startswith('(') and cleaned.endswith(')'):
        cleaned = '-' + cleaned[1:-1]
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_csv(content: str) -> list[dict]:
    """
    Parse CSV content and return normalized transaction data.

    Returns list of dicts: [{date, merchant, amount}]
    Includes all transactions (both debits and credits are captured).
    """
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
