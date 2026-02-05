"""PDF parsing for bank statements from Western nations (US, UK, Australia, NZ)."""

import io
import re
from typing import Optional, List, Dict
import pdfplumber


# Date patterns for different regions
DATE_PATTERNS = [
    r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',      # MM/DD/YYYY, DD/MM/YYYY, DD-MM-YY
    r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',         # YYYY-MM-DD (ISO)
    r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{2,4})?',  # 01 Jul 2025, 1 January
    r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{2,4})?',  # Jul 01, 2025
]

# Currency symbols (Western + Indian Rupee)
CURRENCY_SYMBOLS = r'[\$£€₹]'

# Keywords indicating debits
DEBIT_KEYWORDS = ['debit', 'withdrawal', 'payment', 'purchase', 'dr', 'out']

# Keywords indicating credits (to exclude)
CREDIT_KEYWORDS = ['credit', 'deposit', 'refund', 'cr', 'in']

# Keywords to exclude (non-transaction lines)
EXCLUDE_KEYWORDS = [
    'balance', 'total', 'opening', 'closing', 'statement', 'page',
    'account number', 'account no', 'sort code', 'iban', 'bic', 'bsb',
    'brought forward', 'carried forward', 'summary', 'previous',
    'available', 'pending', 'credit limit', 'minimum payment',
    'interest rate', 'apr', 'customer service', 'thank you',
    'routing number', 'swift',
    # Indian bank specific
    'ifsc', 'micr', 'cif no', 'customer id', 'nomination', 'branch code',
    'pan no', 'aadhaar', 'mobile no', 'email', 'address'
]

# Header keywords for column detection (Western + Indian banks)
HEADER_KEYWORDS = {
    'date': ['date', 'trans date', 'transaction date', 'posting date', 'value date',
             'txn date', 'txn. date', 'val date', 'val. date'],
    'description': ['description', 'transaction', 'details', 'particulars',
                   'narration', 'memo', 'payee', 'merchant', 'remarks',
                   'transaction details', 'transaction particulars'],
    'debit': ['debit', 'withdrawal', 'withdrawals', 'out', 'dr', 'money out', 'paid out',
              'debit amount', 'dr.', 'debit(dr)', 'withdrawal amt'],
    'credit': ['credit', 'deposit', 'deposits', 'in', 'cr', 'money in', 'paid in',
               'credit amount', 'cr.', 'credit(cr)', 'deposit amt'],
    'amount': ['amount', 'value', 'sum', 'txn amount', 'transaction amount'],
    'balance': ['balance', 'running balance', 'available', 'closing balance', 'bal']
}

# Additional columns to skip (not needed for analysis)
SKIP_COLUMNS = ['chq no', 'cheque no', 'ref no', 'reference', 'branch', 'chq.no', 'ref.no']


def pdf_to_csv(pdf_bytes: bytes) -> str:
    """Convert PDF bank statement to CSV format."""
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            # Try multiple extraction strategies
            strategies = [
                _extract_from_tables,
                _extract_westpac_multiline,
                _extract_western_format,
                _extract_from_text,
            ]

            for strategy in strategies:
                csv_content = strategy(pdf)
                if csv_content and _has_valid_data(csv_content):
                    return csv_content

            return ''
    except Exception as e:
        print(f"PDF parsing error: {e}")
        return ''


def _has_valid_data(csv_content: str) -> bool:
    """Check if CSV content has actual data rows beyond header."""
    lines = [l.strip() for l in csv_content.strip().split('\n') if l.strip()]
    return len(lines) > 1


def _extract_from_tables(pdf) -> str:
    """Extract transactions from PDF tables with column detection."""
    all_rows = []
    header_indices = None

    for page in pdf.pages:
        tables = page.extract_tables()

        for table in tables:
            if not table:
                continue

            for row in table:
                if not row:
                    continue

                # Clean the row
                cleaned_row = [str(cell).strip() if cell else '' for cell in row]

                # Skip empty rows
                if not any(cleaned_row):
                    continue

                # Try to detect header row
                if header_indices is None:
                    indices = _detect_header_columns(cleaned_row)
                    if indices:
                        header_indices = indices
                        continue

                # Skip rows that look like summaries
                row_text = ' '.join(cleaned_row).lower()
                if any(kw in row_text for kw in EXCLUDE_KEYWORDS):
                    continue

                all_rows.append(cleaned_row)

    if not all_rows:
        return ''

    # Process rows based on detected columns
    if header_indices:
        return _process_table_rows(all_rows, header_indices)

    # Fallback: assume standard column order
    return _process_table_rows_fallback(all_rows)


def _detect_header_columns(row: List[str]) -> Optional[Dict[str, int]]:
    """Detect column indices from header row."""
    row_lower = [cell.lower() for cell in row]
    row_text = ' '.join(row_lower)

    # Must have at least 2 header keywords to be considered a header
    matches = sum(1 for keywords in HEADER_KEYWORDS.values()
                  for kw in keywords if kw in row_text)
    if matches < 2:
        return None

    indices = {}
    for i, cell in enumerate(row_lower):
        for col_type, keywords in HEADER_KEYWORDS.items():
            if any(kw in cell for kw in keywords):
                if col_type not in indices:  # Take first match
                    indices[col_type] = i
                break

    return indices if indices else None


def _process_table_rows(rows: List[List[str]], indices: Dict[str, int]) -> str:
    """Process table rows using detected column indices."""
    csv_lines = ['Date,Description,Amount']

    date_idx = indices.get('date', 0)
    desc_idx = indices.get('description', 1)
    debit_idx = indices.get('debit')
    credit_idx = indices.get('credit')
    amount_idx = indices.get('amount')

    for row in rows:
        try:
            # Get date
            date = row[date_idx] if date_idx < len(row) else ''

            # Get description
            desc = row[desc_idx] if desc_idx < len(row) else ''
            desc = re.sub(r'\s+', ' ', desc).strip()

            if not desc or len(desc) < 2:
                continue

            # Get amount - prefer debit column
            amount = 0

            if debit_idx is not None and debit_idx < len(row):
                amount = _parse_amount(row[debit_idx])

            if amount == 0 and amount_idx is not None and amount_idx < len(row):
                amt_val = row[amount_idx]
                # For combined amount column, check if it's a debit (negative or DR marker)
                if amt_val:
                    amt_lower = amt_val.lower()
                    is_debit = '-' in amt_val or 'dr' in amt_lower or amt_val.endswith('$') or amt_val.endswith('(')
                    if is_debit or 'cr' not in amt_lower:
                        amount = _parse_amount(amt_val)

            if amount == 0:
                continue

            # Format for CSV
            desc = desc.replace('"', "'")
            if ',' in desc:
                desc = f'"{desc}"'

            csv_lines.append(f"{date},{desc},{amount}")

        except (IndexError, ValueError):
            continue

    return '\n'.join(csv_lines)


def _process_table_rows_fallback(rows: List[List[str]]) -> str:
    """Process table rows without header detection."""
    csv_lines = ['Date,Description,Amount']

    for row in rows:
        if len(row) < 2:
            continue

        # Find date
        date = ''
        for cell in row:
            if _looks_like_date(cell):
                date = cell
                break

        # Find amount (look for debit-style amounts)
        amount = 0
        for cell in row:
            amt = _parse_amount(cell)
            if amt > 0:
                amount = amt
                break

        if amount == 0:
            continue

        # Description is typically the longest text cell
        desc = ''
        for cell in row:
            cell_clean = re.sub(r'[\d\$£€,.\-\(\)]', '', cell).strip()
            if len(cell_clean) > len(desc):
                desc = cell.strip()

        if not desc:
            continue

        desc = desc.replace('"', "'")
        if ',' in desc:
            desc = f'"{desc}"'

        csv_lines.append(f"{date},{desc},{amount}")

    return '\n'.join(csv_lines)


def _extract_westpac_multiline(pdf) -> str:
    """Extract transactions from Westpac-style PDFs with multi-line transactions.

    Westpac format has:
    - Date + description start on one line
    - Description continuation + amounts on next line(s)
    - Columns: DATE, DESCRIPTION, DEBIT, CREDIT, BALANCE
    """
    all_text = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)
    csv_lines = ['Date,Description,Amount']

    lines = full_text.split('\n')
    date_pattern = r'^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+'

    # Build transaction blocks: date line + continuation lines
    tx_blocks = []
    current_block = None

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Skip header lines
        line_lower = line_stripped.lower()
        if 'transaction description' in line_lower or 'effective date' in line_lower:
            continue
        if line_lower.startswith('date ') and 'debit' in line_lower:
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
            # Continuation line - add to current block
            current_block['lines'].append(line_stripped)

    # Don't forget last block
    if current_block:
        tx_blocks.append(current_block)

    # Process each transaction block
    for block in tx_blocks:
        full_text = ' '.join(block['lines'])
        full_text_upper = full_text.upper()

        # Skip non-transaction lines
        skip_keywords = ['OPENING BALANCE', 'CLOSING BALANCE', 'STATEMENT PERIOD',
                        'CUSTOMER ID', 'BSB', 'ACCOUNT NAME', 'PLEASE CHECK']
        if any(skip in full_text_upper for skip in skip_keywords):
            continue

        # Skip credits/deposits
        credit_keywords = ['DEPOSIT', 'OSKO PAYMENT', 'DIRECT CREDIT', 'TRANSFER IN',
                          'PAYMENT RECEIVED', 'REFUND', 'CREDIT']
        # But NOT "Debit Card" which contains "CREDIT" substring check carefully
        is_credit = any(kw in full_text_upper for kw in credit_keywords)
        is_debit_card = 'DEBIT CARD' in full_text_upper
        if is_credit and not is_debit_card:
            continue

        # Parse amounts from the combined text
        # Look for sequences of numbers that could be amounts
        amounts_found = []
        description_parts = []

        # Process all lines to separate description from amounts
        for line in block['lines']:
            parts = line.split()
            line_amounts = []
            line_desc = []

            # Scan from right - amounts are typically at the end
            found_non_numeric = False
            for part in reversed(parts):
                cleaned = part.replace(',', '').replace('$', '')
                try:
                    val = float(cleaned)
                    # Only consider amounts >= 0.01 as valid amounts
                    if not found_non_numeric and val >= 0.01:
                        line_amounts.insert(0, val)
                    else:
                        found_non_numeric = True
                        line_desc.insert(0, part)
                except ValueError:
                    found_non_numeric = True
                    line_desc.insert(0, part)

            # Use amounts from the line that has them (usually the last line)
            if line_amounts and not amounts_found:
                amounts_found = line_amounts
                if line_desc:
                    description_parts = line_desc + description_parts
            else:
                description_parts = parts + description_parts

        if not amounts_found:
            continue

        description = ' '.join(description_parts).strip()
        if not description or len(description) < 3:
            continue

        # For Westpac: amounts are [DEBIT, CREDIT, BALANCE] or [DEBIT, BALANCE] or [CREDIT, BALANCE]
        # We want DEBIT (spending), which is the first non-balance amount
        amount = None
        if len(amounts_found) >= 2:
            # First amount is likely DEBIT (if present), last is BALANCE
            # Take the first amount that's not the balance (last one)
            for amt in amounts_found[:-1]:
                if amt > 0:
                    amount = amt
                    break
        elif len(amounts_found) == 1:
            # Only one amount - could be the transaction amount
            amount = amounts_found[0]

        if not amount or amount <= 0:
            continue

        # Clean description
        description = re.sub(r'\s+', ' ', description).strip()
        description = description.replace('"', "'")
        if ',' in description:
            description = f'"{description}"'

        csv_lines.append(f"{block['date']},{description},{amount}")

    return '\n'.join(csv_lines)


def _extract_western_format(pdf) -> str:
    """Extract transactions using patterns common in Western bank statements."""
    all_text = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)
    csv_lines = ['Date,Description,Amount']

    lines = full_text.split('\n')
    current_date = ''

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip excluded lines
        line_lower = line.lower()
        if any(kw in line_lower for kw in EXCLUDE_KEYWORDS):
            continue

        # Extract date if present
        date_match = None
        for pattern in DATE_PATTERNS:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                date_match = match
                current_date = match.group(0)
                break

        # Look for debit amounts using multiple patterns
        amount = 0
        desc = line

        # Pattern 1: Amount followed by $ or ( (CommBank/Australian style)
        match = re.search(r'([\d,]+\.\d{2})\s*[\$\(]', line)
        if match:
            amount = _parse_amount(match.group(1))
            desc = line[:match.start()].strip()

        # Pattern 2: Negative amount -$123.45, -₹1,234.56, or -123.45
        if amount == 0:
            match = re.search(r'-\s*' + CURRENCY_SYMBOLS + r'?\s*([\d,]+\.?\d*)', line)
            if match:
                amount = _parse_amount(match.group(1))
                desc = re.sub(r'-\s*' + CURRENCY_SYMBOLS + r'?\s*[\d,]+\.?\d*', '', line).strip()

        # Pattern 3: Amount with DR marker (UK style)
        if amount == 0:
            match = re.search(r'([\d,]+\.\d{2})\s*(?:DR|D)\b', line, re.IGNORECASE)
            if match:
                amount = _parse_amount(match.group(1))
                desc = line[:match.start()].strip()

        # Pattern 4: Currency then amount at end of line (might be debit in single-column format)
        if amount == 0:
            match = re.search(CURRENCY_SYMBOLS + r'\s*([\d,]+\.\d{2})\s*$', line)
            if match:
                # Only use if no CR marker
                if 'cr' not in line_lower:
                    amount = _parse_amount(match.group(1))
                    desc = line[:match.start()].strip()

        if amount == 0:
            continue

        # Clean description
        if date_match:
            desc = desc.replace(current_date, '').strip()
        desc = re.sub(r'\s+', ' ', desc).strip()
        desc = re.sub(r'^[\s,\-]+|[\s,\-]+$', '', desc)

        if not desc or len(desc) < 2:
            continue

        # Skip if description looks like a credit
        if any(kw in desc.lower() for kw in ['interest earned', 'deposit from']):
            continue

        desc = desc.replace('"', "'")
        if ',' in desc:
            desc = f'"{desc}"'

        csv_lines.append(f"{current_date},{desc},{amount}")

    return '\n'.join(csv_lines)


def _extract_from_text(pdf) -> str:
    """Fallback text extraction."""
    all_text = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)
    csv_lines = ['Date,Description,Amount']

    for line in full_text.split('\n'):
        line = line.strip()
        if not line or len(line) < 10:
            continue

        line_lower = line.lower()
        if any(kw in line_lower for kw in EXCLUDE_KEYWORDS):
            continue

        # Must have both a date and an amount
        has_date = _looks_like_date(line)

        # Find any amount
        amounts = re.findall(r'[\d,]+\.\d{2}', line)
        if not amounts or not has_date:
            continue

        # Extract date
        date = ''
        for pattern in DATE_PATTERNS:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                date = match.group(0)
                break

        # Use first reasonable amount
        amount = 0
        for amt_str in amounts:
            amt = _parse_amount(amt_str)
            if 0 < amt < 50000:  # Reasonable transaction range
                amount = amt
                break

        if amount == 0:
            continue

        # Extract description
        desc = line
        for amt_str in amounts:
            desc = desc.replace(amt_str, '')
        desc = re.sub(CURRENCY_SYMBOLS, '', desc)
        desc = re.sub(r'[\(\)\-]', '', desc)
        if date:
            desc = desc.replace(date, '')
        desc = re.sub(r'\s+', ' ', desc).strip()

        if len(desc) < 2:
            continue

        desc = desc.replace('"', "'")
        if ',' in desc:
            desc = f'"{desc}"'

        csv_lines.append(f"{date},{desc},{amount}")

    return '\n'.join(csv_lines)


def _looks_like_date(text: str) -> bool:
    """Check if text contains a date pattern."""
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in DATE_PATTERNS)


def _parse_amount(value) -> float:
    """Parse amount string to float.

    Handles various formats:
    - Western: $1,234.56 or 1,234.56
    - Indian: ₹1,23,456.78 or 1,23,456.78 (lakhs/crores format)
    - UK: £1,234.56
    - Negative: -$50.00 or (50.00)
    """
    if not value:
        return 0

    value = str(value).strip()

    # Remove currency symbols, parentheses, spaces, letters (but keep digits, commas, dots, minus)
    cleaned = re.sub(r'[£$€₹(),\s]', '', value)
    cleaned = re.sub(r'[a-zA-Z]', '', cleaned)

    # Handle negative indicator
    is_negative = '-' in value or ('(' in value and ')' in value)

    # Extract number - handles both Western (1,234.56) and Indian (1,23,456.78) formats
    # Indian format: digits with commas every 2 digits after first 3 from right
    match = re.search(r'[\d,]+\.?\d*', cleaned)
    if match:
        num_str = match.group(0).replace(',', '')  # Remove all commas
        try:
            amount = abs(float(num_str))
            return -amount if is_negative else amount
        except ValueError:
            return 0
    return 0
