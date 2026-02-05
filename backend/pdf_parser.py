"""PDF parsing for bank statements."""

import io
import re
from typing import Optional
import pdfplumber


def pdf_to_csv(pdf_bytes: bytes) -> str:
    """
    Convert PDF bank statement to CSV format.

    Attempts to detect and extract transaction data from various PDF formats.
    """
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            # First try: Extract tables
            csv_content = _extract_from_tables(pdf)
            if csv_content and _has_valid_data(csv_content):
                return csv_content

            # Second try: Extract from text
            csv_content = _extract_from_text(pdf)
            if csv_content and _has_valid_data(csv_content):
                return csv_content

            # Third try: Raw text dump with smart parsing
            csv_content = _extract_raw_transactions(pdf)
            if csv_content and _has_valid_data(csv_content):
                return csv_content

            return ''
    except Exception as e:
        print(f"PDF parsing error: {e}")
        return ''


def _has_valid_data(csv_content: str) -> bool:
    """Check if CSV content has actual data rows beyond header."""
    lines = [l.strip() for l in csv_content.strip().split('\n') if l.strip()]
    return len(lines) > 1  # More than just header


def _extract_from_tables(pdf) -> str:
    """Extract transactions from PDF tables."""
    all_rows = []
    header_row = None
    header_indices = {}  # Track column positions

    for page in pdf.pages:
        tables = page.extract_tables()

        for table in tables:
            if not table:
                continue

            for row in table:
                if not row or all(cell is None or str(cell).strip() == '' for cell in row):
                    continue

                # Clean the row
                cleaned_row = [str(cell).strip() if cell else '' for cell in row]

                # Skip rows that are too short
                if len([c for c in cleaned_row if c]) < 2:
                    continue

                # Try to detect header row
                if header_row is None:
                    row_lower = [c.lower() for c in cleaned_row]
                    row_text = ' '.join(row_lower)

                    # Check if this is a header row
                    header_keywords = ['date', 'description', 'amount', 'debit', 'credit',
                                      'transaction', 'details', 'particulars', 'narration',
                                      'withdrawal', 'deposit', 'balance']
                    if sum(1 for kw in header_keywords if kw in row_text) >= 2:
                        header_row = cleaned_row

                        # Identify column indices
                        for i, col in enumerate(row_lower):
                            if 'date' in col:
                                header_indices['date'] = i
                            elif any(x in col for x in ['description', 'transaction', 'details', 'particulars', 'narration']):
                                header_indices['description'] = i
                            elif 'debit' in col or 'withdrawal' in col:
                                header_indices['debit'] = i
                            elif 'credit' in col or 'deposit' in col:
                                header_indices['credit'] = i
                            elif 'amount' in col:
                                header_indices['amount'] = i
                            elif 'balance' in col:
                                header_indices['balance'] = i

                        continue

                # This is a data row - check if it has valid data
                has_amount = any(re.search(r'\d+\.?\d*', cell) for cell in cleaned_row if cell)
                if has_amount:
                    all_rows.append(cleaned_row)

    if not all_rows:
        return ''

    # Process rows based on detected column structure
    if header_indices:
        return _process_structured_table(all_rows, header_indices)

    # Fallback: create generic CSV
    if header_row:
        all_rows.insert(0, header_row)
    else:
        num_cols = len(all_rows[0])
        if num_cols >= 3:
            header = ['Date', 'Description', 'Amount'] + [f'Col{i}' for i in range(3, num_cols)]
        elif num_cols == 2:
            header = ['Description', 'Amount']
        else:
            header = ['Data']
        all_rows.insert(0, header)

    # Convert to CSV
    csv_lines = []
    for row in all_rows:
        escaped = []
        for cell in row:
            if ',' in cell or '"' in cell or '\n' in cell:
                cell = '"' + cell.replace('"', '""') + '"'
            escaped.append(cell)
        csv_lines.append(','.join(escaped))

    return '\n'.join(csv_lines)


def _process_structured_table(rows: list, indices: dict) -> str:
    """Process table with known column structure (Date, Transaction, Debit, Credit, Balance)."""
    csv_lines = ['Date,Description,Amount']

    date_idx = indices.get('date', 0)
    desc_idx = indices.get('description', 1)
    debit_idx = indices.get('debit')
    credit_idx = indices.get('credit')
    amount_idx = indices.get('amount')
    balance_idx = indices.get('balance')

    for row in rows:
        try:
            # Get date
            date = row[date_idx] if date_idx < len(row) else ''

            # Get description
            desc = row[desc_idx] if desc_idx < len(row) else ''
            if not desc or desc.lower() in ['', 'nan', 'none']:
                continue

            # Get amount - prefer debit column, then amount column
            amount = None

            # Check debit column first (this is what we want for spending)
            if debit_idx is not None and debit_idx < len(row):
                debit_val = row[debit_idx]
                if debit_val and debit_val.strip():
                    amount = _parse_amount_str(debit_val)

            # If no debit, check if there's a general amount column
            if amount is None and amount_idx is not None and amount_idx < len(row):
                amt_val = row[amount_idx]
                if amt_val and amt_val.strip():
                    amount = _parse_amount_str(amt_val)

            # Skip if no debit amount (this might be a credit/deposit)
            if amount is None or amount == 0:
                continue

            # Skip balance-like large amounts
            if amount > 10000:
                continue

            # Escape description
            if ',' in desc:
                desc = f'"{desc}"'

            csv_lines.append(f"{date},{desc},{amount}")

        except (IndexError, ValueError):
            continue

    return '\n'.join(csv_lines)


def _parse_amount_str(value: str) -> float:
    """Parse amount string to float."""
    if not value:
        return 0
    # Remove currency symbols, commas, spaces
    cleaned = re.sub(r'[£$€,\s]', '', str(value))
    # Handle parentheses as negative
    if cleaned.startswith('(') and cleaned.endswith(')'):
        cleaned = cleaned[1:-1]
    try:
        return abs(float(cleaned))
    except ValueError:
        return 0


def _extract_from_text(pdf) -> str:
    """Extract transactions from PDF text."""
    all_text = []

    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)
    lines = full_text.split('\n')

    # Find transaction lines
    transaction_lines = []
    for line in lines:
        line = line.strip()
        if line and _looks_like_transaction(line):
            transaction_lines.append(line)

    if not transaction_lines:
        return ''

    # Try to parse each line
    csv_lines = ['Date,Description,Amount']
    for line in transaction_lines:
        parsed = _parse_transaction_line(line)
        if parsed:
            # Escape fields
            desc = parsed['description']
            if ',' in desc:
                desc = f'"{desc}"'
            csv_lines.append(f"{parsed['date']},{desc},{parsed['amount']}")

    return '\n'.join(csv_lines)


def _extract_raw_transactions(pdf) -> str:
    """Last resort: extract any lines that might be transactions."""
    all_text = []

    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)

    # Exclude keywords for balance/summary lines
    exclude_keywords = [
        'balance', 'total', 'opening', 'closing', 'statement',
        'brought forward', 'carried forward', 'summary', 'available'
    ]

    # Find lines containing amounts AND dates (more strict)
    lines_with_transactions = []
    for line in full_text.split('\n'):
        line = line.strip()
        line_lower = line.lower()

        # Skip if contains exclude keywords
        if any(kw in line_lower for kw in exclude_keywords):
            continue

        # Must have a date pattern
        has_date = re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', line)
        if not has_date:
            continue

        # Must have an amount
        has_amount = re.search(r'\d+\.\d{2}', line)
        if not has_amount:
            continue

        if len(line) > 10:
            lines_with_transactions.append(line)

    if not lines_with_transactions:
        return ''

    # Create a simple CSV
    csv_lines = ['Date,Description,Amount']
    for line in lines_with_transactions:
        # Try to extract amount (take the first reasonable one, not balance)
        amounts = re.findall(r'-?[\$£€]?\s*\d{1,3}(?:,\d{3})*\.\d{2}', line)
        if amounts:
            # Filter out very large amounts (likely balances)
            valid_amounts = []
            for a in amounts:
                clean_amt = float(a.replace('$', '').replace('£', '').replace('€', '').replace(',', '').replace(' ', ''))
                # Skip amounts over $10,000 (likely balance, not transaction)
                if abs(clean_amt) < 10000:
                    valid_amounts.append(a)

            if not valid_amounts:
                continue

            # Use the first valid amount (usually the transaction amount)
            amount = valid_amounts[0].replace('$', '').replace('£', '').replace('€', '').replace(',', '').strip()

            # Remove all amounts from the line to get description
            desc = line
            for a in amounts:
                desc = desc.replace(a, '')
            desc = re.sub(r'\s+', ' ', desc).strip()

            # Try to extract date
            date_match = re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', line)
            date = date_match.group(0) if date_match else ''

            if desc and len(desc) > 2:
                if ',' in desc:
                    desc = f'"{desc}"'
                csv_lines.append(f"{date},{desc},{amount}")

    return '\n'.join(csv_lines)


def _looks_like_transaction(text: str) -> bool:
    """Check if text looks like a transaction row."""
    if len(text) < 5:
        return False

    text_lower = text.lower()

    # Exclude summary/header/footer lines
    exclude_keywords = [
        'balance', 'total', 'opening', 'closing', 'statement', 'page',
        'account number', 'account no', 'sort code', 'iban', 'bic',
        'brought forward', 'carried forward', 'summary', 'previous',
        'ending balance', 'beginning balance', 'available', 'pending',
        'credit limit', 'minimum payment', 'payment due', 'annual fee',
        'interest rate', 'apr', 'customer service', 'thank you'
    ]
    if any(kw in text_lower for kw in exclude_keywords):
        return False

    # Common date patterns
    date_patterns = [
        r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # MM/DD/YYYY, DD-MM-YY, etc.
        r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',     # YYYY-MM-DD
        r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)',  # DD Mon
        r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}',  # Mon DD
    ]

    has_date = any(re.search(pattern, text, re.IGNORECASE) for pattern in date_patterns)

    # Amount patterns
    amount_patterns = [
        r'[\$£€]\s*[\d,]+\.?\d*',           # $123.45
        r'[\d,]+\.\d{2}',                    # 123.45
        r'-\s*[\d,]+\.\d{2}',                # -123.45
    ]
    has_amount = any(re.search(pattern, text) for pattern in amount_patterns)

    # Must have BOTH a date and an amount for better accuracy
    return has_date and has_amount


def _parse_transaction_line(line: str) -> Optional[dict]:
    """Attempt to parse a single transaction line."""

    # Extract date if present
    date = ''
    date_patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',
        r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{2,4})?)',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s+\d{2,4})?)',
    ]

    for pattern in date_patterns:
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            date = match.group(1)
            line = line.replace(date, '', 1)
            break

    # Extract amount (usually at the end)
    amount_patterns = [
        r'([\$£€]?\s*-?\d{1,3}(?:,\d{3})*\.\d{2})\s*(?:DR|CR|D|C)?\s*$',
        r'([\$£€]?\s*-?\d{1,3}(?:,\d{3})*\.\d{2})',
    ]

    amount = None
    for pattern in amount_patterns:
        match = re.search(pattern, line)
        if match:
            amount = match.group(1)
            amount = re.sub(r'[\$£€,\s]', '', amount)
            line = line[:match.start()] + line[match.end():]
            break

    if not amount:
        return None

    # Remaining text is description
    description = re.sub(r'\s+', ' ', line).strip()
    description = re.sub(r'^[,\s]+|[,\s]+$', '', description)

    if not description:
        description = 'Unknown'

    return {
        'date': date,
        'description': description,
        'amount': amount
    }
