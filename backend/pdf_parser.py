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
    r'\d{1,2}/\d{1,2}',  # MM/DD (short US format without year)
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
                _extract_commbank_format,
                _extract_nab_format,
                _extract_us_bank_format,
                _extract_anz_format,
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
    """Check if CSV content has actual data rows beyond header with reasonable amounts."""
    lines = [l.strip() for l in csv_content.strip().split('\n') if l.strip()]
    if len(lines) <= 1:
        return False

    # Count valid transactions - just check we have some reasonable data
    valid_transactions = 0
    for line in lines[1:]:  # Skip header
        parts = line.rsplit(',', 1)
        if len(parts) >= 2:
            try:
                amount = float(parts[-1].replace('"', ''))
                # Individual transaction shouldn't be > $100,000 for normal bank statements
                if 0 < amount <= 100000:
                    valid_transactions += 1
            except ValueError:
                continue

    # Need at least 1 valid transaction
    return valid_transactions >= 1


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
    balance_idx = indices.get('balance')  # Track balance column to avoid it

    for row in rows:
        try:
            # Get date
            date = row[date_idx] if date_idx < len(row) else ''

            # Get description
            desc = row[desc_idx] if desc_idx < len(row) else ''
            desc = re.sub(r'\s+', ' ', desc).strip()

            if not desc or len(desc) < 2:
                continue

            # Get amount - prefer debit column, but NEVER use balance column
            amount = 0

            if debit_idx is not None and debit_idx < len(row) and debit_idx != balance_idx:
                amount = _parse_amount(row[debit_idx])

            if amount == 0 and amount_idx is not None and amount_idx < len(row) and amount_idx != balance_idx:
                amt_val = row[amount_idx]
                # For combined amount column, check if it's a debit (negative or DR marker)
                if amt_val:
                    amt_lower = amt_val.lower()
                    is_debit = '-' in amt_val or 'dr' in amt_lower or amt_val.endswith('$') or amt_val.endswith('(')
                    if is_debit or 'cr' not in amt_lower:
                        amount = _parse_amount(amt_val)

            if amount == 0:
                continue

            # Skip unreasonably large amounts (likely picked up balance by mistake)
            if amount > 50000:
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


def _extract_commbank_format(pdf) -> str:
    """Extract transactions from CommBank (Commonwealth Bank) PDFs.

    CommBank format has:
    - Dates like "03 Jul" or "11 Jul" (DD Mon without year)
    - Multi-line transactions
    - Multiple amount columns: typically debit, credit, balance
    - Debit marker: amount followed by "(" like "550.00 ("
    - OR: first amount in a row of amounts (when followed by balance)
    """
    all_text = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)

    # Check if this looks like CommBank format
    if 'commbank' not in full_text.lower() and 'commonwealth' not in full_text.lower():
        return ''

    csv_lines = ['Date,Description,Amount']
    lines = full_text.split('\n')

    # CommBank date pattern: "03 Jul" or "11 Jul" (DD Mon)
    date_pattern = r'^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\s+'

    # Build transaction blocks
    tx_blocks = []
    current_block = None

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Skip header/summary lines
        line_lower = line_stripped.lower()
        skip_keywords = ['opening balance', 'closing balance', 'account number', 'statement',
                        'page ', 'enquiries', 'note:', 'interest rates', 'effective date',
                        'bsb', 'account name', 'available balance', 'current balance']
        if any(kw in line_lower for kw in skip_keywords):
            continue

        date_match = re.match(date_pattern, line_stripped, re.IGNORECASE)

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

    # Process each transaction block
    for block in tx_blocks:
        full_text_block = ' '.join(block['lines'])
        full_text_upper = full_text_block.upper()

        # Skip credits/deposits and internal transfers
        skip_keywords = ['DIRECT CREDIT', 'TRANSFER FROM', 'SALARY', 'FAST TRANSFER FROM',
                        'CREDIT TO ACCOUNT', 'PAYMENT RECEIVED', 'REFUND', 'DEPOSIT',
                        'OSKO FROM', 'BPAY CREDIT', 'INTEREST CREDIT',
                        # Internal transfers - skip these
                        'TRANSFER TO', 'TRANSFER TO XX']
        if any(kw in full_text_upper for kw in skip_keywords):
            continue

        # Find all amounts in the block
        all_amounts = re.findall(r'([\d,]+\.\d{2})', full_text_block)
        if not all_amounts:
            continue

        # Parse amounts
        parsed_amounts = []
        for amt_str in all_amounts:
            try:
                amt = float(amt_str.replace(',', ''))
                if amt > 0:
                    parsed_amounts.append(amt)
            except ValueError:
                continue

        if not parsed_amounts:
            continue

        # Determine which amount is the transaction vs balance
        # Strategy: Look for "amount (" or "amount $" pattern (CommBank debit markers)
        # The ( or $ after the amount indicates it's a debit, followed by the balance
        debit_match = re.search(r'([\d,]+\.\d{2})\s*[\(\$]', full_text_block)

        amount = None
        if debit_match:
            # Make sure this isn't the balance (balance has $amount format, not amount$)
            matched_amount = debit_match.group(1)
            # Check if there's a $ before this amount (which would make it a credit/balance)
            before_match = full_text_block[:debit_match.start()]
            if not before_match.rstrip().endswith('$'):
                amount = float(matched_amount.replace(',', ''))
        else:
            # Fallback: If multiple amounts, the SMALLEST is likely the transaction
            # (balance is typically the largest), but NOT if it's suspiciously large
            # Also: first amount that's NOT the max is likely the transaction
            if len(parsed_amounts) >= 2:
                max_amount = max(parsed_amounts)
                for amt in parsed_amounts:
                    if amt != max_amount and amt < 10000:
                        amount = amt
                        break
            elif len(parsed_amounts) == 1:
                # Single amount - use it if reasonable
                if parsed_amounts[0] < 5000:
                    amount = parsed_amounts[0]

        if not amount or amount <= 0 or amount > 50000:
            continue

        # Extract description (everything before the first amount)
        first_amount_str = all_amounts[0] if all_amounts else ''
        desc_end = full_text_block.find(first_amount_str)
        description = full_text_block[:desc_end].strip() if desc_end > 0 else full_text_block

        # Clean up description - remove any amounts and $ signs
        description = re.sub(r'\$?[\d,]+\.\d{2}', '', description)
        description = re.sub(r'\s+', ' ', description).strip()

        if not description or len(description) < 3:
            continue

        # Format for CSV
        description = description.replace('"', "'")
        if ',' in description:
            description = f'"{description}"'

        csv_lines.append(f"{block['date']},{description},{amount}")

    return '\n'.join(csv_lines)


def _extract_nab_format(pdf) -> str:
    """Extract transactions from NAB (National Australia Bank) PDFs.

    NAB format has:
    - Dates like "2 Jan 2025" or "15 Jan 2025" (D Mon YYYY)
    - Columns: Date, Particulars, Debits ($), Credits ($), Balance ($)
    """
    all_text = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)

    # Check if this looks like NAB format
    if 'nab' not in full_text.lower() and 'national australia bank' not in full_text.lower():
        return ''

    csv_lines = ['Date,Description,Amount']
    lines = full_text.split('\n')

    # NAB date pattern: "2 Jan 2025" or "15 Jan 2025"
    date_pattern = r'^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})\s+'

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Skip header/summary lines
        line_lower = line_stripped.lower()
        skip_keywords = ['brought forward', 'closing balance', 'opening balance', 'total credits',
                        'total debits', 'account summary', 'page ', 'statement period', 'bsb:',
                        'account number', 'important', 'government charges', 'please check']
        if any(kw in line_lower for kw in skip_keywords):
            continue

        date_match = re.match(date_pattern, line_stripped, re.IGNORECASE)
        if not date_match:
            continue

        date = date_match.group(1)
        rest = line_stripped[date_match.end():].strip()

        # Skip credits/deposits
        rest_upper = rest.upper()
        if any(kw in rest_upper for kw in ['DIRECT CREDIT', 'SALARY', 'OSKO PAYMENT FROM', 'CREDIT -']):
            continue

        # Find amounts in the line (format: description amount amount or description amount)
        amounts = re.findall(r'[\d,]+\.\d{2}', rest)

        if not amounts:
            continue

        # Parse amounts
        parsed_amounts = []
        for amt_str in amounts:
            try:
                amt = float(amt_str.replace(',', ''))
                parsed_amounts.append(amt)
            except ValueError:
                continue

        if not parsed_amounts:
            continue

        # Extract description (everything before the first amount)
        first_amount_pos = rest.find(amounts[0])
        if first_amount_pos > 0:
            description = rest[:first_amount_pos].strip()
        else:
            description = rest

        # Remove trailing dots from description
        description = re.sub(r'\.+$', '', description).strip()

        if not description or len(description) < 3:
            continue

        # The transaction amount is the first amount (debit), last is usually balance
        # For NAB: [debit, balance] or [credit, balance]
        amount = None
        if len(parsed_amounts) >= 2:
            # First amount is the transaction, last is balance
            amount = parsed_amounts[0]
        elif len(parsed_amounts) == 1:
            amount = parsed_amounts[0]

        if not amount or amount <= 0 or amount > 10000:
            continue

        # Format for CSV
        description = description.replace('"', "'")
        if ',' in description:
            description = f'"{description}"'

        csv_lines.append(f"{date},{description},{amount}")

    return '\n'.join(csv_lines)


def _extract_us_bank_format(pdf) -> str:
    """Extract transactions from US bank PDFs (PNC, Chase, Wells Fargo, etc.).

    US bank format typically has:
    - Short dates like MM/DD (01/02, 01/15)
    - Separate Withdrawals and Deposits columns (no $ signs)
    - Balance column at the end
    - Transaction descriptions with merchant names
    """
    all_text = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)
    full_text_lower = full_text.lower()

    # Skip if this is clearly an Australian bank
    australian_banks = ['westpac', 'commbank', 'commonwealth', 'nab', 'national australia', 'anz', 'bsb']
    if any(bank in full_text_lower for bank in australian_banks):
        return ''

    # Check if this looks like US bank format
    # Look for short MM/DD dates and US-specific keywords
    has_short_date = re.search(r'\b\d{2}/\d{2}\b', full_text)
    has_us_keywords = any(kw in full_text_lower for kw in ['ach debit', 'ach deposit', 'zelle', 'virtual wallet', 'pnc', 'chase', 'wells fargo', 'bank of america', 'citibank', 'td bank', 'us bank', 'truist', 'capital one'])

    if not (has_short_date and has_us_keywords):
        return ''

    csv_lines = ['Date,Description,Amount']
    lines = full_text.split('\n')

    # US date pattern: MM/DD at start of line
    date_pattern = r'^(\d{2}/\d{2})\s+'

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Skip header/summary lines
        line_lower = line_stripped.lower()
        skip_keywords = ['beginning balance', 'ending balance', 'account summary', 'transaction detail',
                        'statement period', 'account number', 'page ', 'withdrawals deposits balance',
                        'date description']
        if any(kw in line_lower for kw in skip_keywords):
            continue

        date_match = re.match(date_pattern, line_stripped)
        if not date_match:
            continue

        date = date_match.group(1)
        rest = line_stripped[date_match.end():].strip()

        # Find all numbers in the line (could be amounts or balance)
        # US format: amounts are typically without $ signs, like 1,234.56 or 87.56
        amounts = re.findall(r'[\d,]+\.\d{2}', rest)

        if not amounts:
            continue

        # Parse amounts to floats
        parsed_amounts = []
        for amt_str in amounts:
            try:
                amt = float(amt_str.replace(',', ''))
                parsed_amounts.append(amt)
            except ValueError:
                continue

        if not parsed_amounts:
            continue

        # Extract description (everything before the amounts)
        # Find where the first amount starts
        first_amount_pos = rest.find(amounts[0])
        if first_amount_pos > 0:
            description = rest[:first_amount_pos].strip()
        else:
            description = rest

        # Clean description
        description = re.sub(r'\s+', ' ', description).strip()

        if not description or len(description) < 3:
            continue

        # Determine the transaction amount
        # US format typically: Description | Withdrawal | Deposit | Balance
        # If 3 amounts: [withdrawal, deposit, balance] - withdrawal or deposit will be the transaction
        # If 2 amounts: [amount, balance]
        # If 1 amount: could be balance only (skip) or amount

        # Skip credits/deposits - look for deposit keywords
        desc_upper = description.upper()
        is_deposit = any(kw in desc_upper for kw in ['DEPOSIT', 'PAYROLL', 'DIRECT DEP', 'PAYMENT RECEIVED', 'REFUND', 'CREDIT'])
        is_zelle_receive = 'ZELLE' in desc_upper and 'FROM' in desc_upper

        if is_deposit or is_zelle_receive:
            continue

        # The transaction amount is typically NOT the largest (balance is largest)
        # Take the first amount that's less than the max
        max_amount = max(parsed_amounts)
        amount = None

        for amt in parsed_amounts:
            if amt != max_amount and amt > 0 and amt < 10000:
                amount = amt
                break

        # If only one amount and it's reasonable, use it (might be a statement without balance column)
        if amount is None and len(parsed_amounts) == 1 and parsed_amounts[0] < 5000:
            amount = parsed_amounts[0]

        # If first amount is much smaller than last, first is likely the transaction
        if amount is None and len(parsed_amounts) >= 2:
            if parsed_amounts[0] < parsed_amounts[-1] * 0.5 and parsed_amounts[0] < 5000:
                amount = parsed_amounts[0]

        if not amount or amount <= 0:
            continue

        # Format for CSV
        description = description.replace('"', "'")
        if ',' in description:
            description = f'"{description}"'

        csv_lines.append(f"{date},{description},{amount}")

    return '\n'.join(csv_lines)


def _extract_anz_format(pdf) -> str:
    """Extract transactions from ANZ-style PDFs.

    ANZ format has:
    - Date like "17 JUN" (DD MON)
    - Multi-line descriptions with "EFFECTIVE DATE" lines
    - Columns: Date, Transaction Details, Withdrawals ($), Deposits ($), Balance ($)
    """
    all_text = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text.append(text)

    if not all_text:
        return ''

    full_text = '\n'.join(all_text)

    # Check if this looks like ANZ format (has "blank" OR "DD MON" dates with Withdrawals/Deposits headers)
    has_blank = 'blank' in full_text.lower()
    has_anz_date = re.search(r'\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b', full_text, re.IGNORECASE)
    has_anz_headers = 'withdrawals' in full_text.lower() and 'deposits' in full_text.lower()

    if not (has_blank or (has_anz_date and has_anz_headers)):
        return ''

    csv_lines = ['Date,Description,Amount']
    lines = full_text.split('\n')

    # ANZ date pattern: "17 JUN" or "1 JAN"
    date_pattern = r'^(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))\b'

    # Build transaction blocks
    tx_blocks = []
    current_block = None

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Skip header lines
        line_lower = line_stripped.lower()
        if 'transaction details' in line_lower:
            continue
        if 'withdrawals' in line_lower and 'deposits' in line_lower:
            continue

        date_match = re.match(date_pattern, line_stripped, re.IGNORECASE)

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

    if current_block:
        tx_blocks.append(current_block)

    # Process each transaction block
    for block in tx_blocks:
        full_text_block = ' '.join(block['lines'])
        full_text_upper = full_text_block.upper()

        # Skip non-transaction lines
        if 'OPENING BALANCE' in full_text_upper or 'CLOSING BALANCE' in full_text_upper:
            continue

        # Skip deposits/credits (but not "VISA DEBIT" which is a spending type)
        is_deposit = 'DEPOSIT' in full_text_upper or 'CREDIT' in full_text_upper
        is_visa_debit = 'VISA DEBIT' in full_text_upper
        if is_deposit and not is_visa_debit:
            continue

        # Collect all amounts from all lines in the block
        all_amounts = []
        description_parts = []

        for line in block['lines']:
            # Skip EFFECTIVE DATE lines from description
            if 'EFFECTIVE DATE' in line.upper():
                continue

            # Find all amounts in this line
            line_amounts = re.findall(r'[\d,]+\.\d{2}', line)

            if line_amounts:
                for amt_str in line_amounts:
                    try:
                        amt = float(amt_str.replace(',', ''))
                        all_amounts.append(amt)
                    except ValueError:
                        continue
                # Remove amounts and "blank" from line to get description
                cleaned_line = re.sub(r'[\d,]+\.\d{2}', '', line)
                cleaned_line = re.sub(r'\bblank\b', '', cleaned_line, flags=re.IGNORECASE)
                cleaned_line = cleaned_line.strip()
                if cleaned_line and len(cleaned_line) > 2:
                    description_parts.append(cleaned_line)
            else:
                # No amounts, this is description
                cleaned_line = re.sub(r'\bblank\b', '', line, flags=re.IGNORECASE).strip()
                if cleaned_line:
                    description_parts.append(cleaned_line)

        if not all_amounts:
            continue

        # ANZ format: [withdrawal, deposit, balance] or [withdrawal, balance] or [deposit, balance]
        # Balance is typically the largest and last value
        # Withdrawal/deposit are typically smaller values
        # Sort to identify: smallest values are likely transaction amounts, largest is balance

        # The first amount that's NOT the largest is likely the transaction amount
        max_amount = max(all_amounts)
        transaction_amount = None

        for amt in all_amounts:
            # Skip the balance (largest value or values > 1000 that look like balances)
            if amt == max_amount:
                continue
            # Take the first non-balance amount as transaction
            if amt < 5000:  # Reasonable transaction limit
                transaction_amount = amt
                break

        if transaction_amount is None or transaction_amount <= 0:
            continue

        description = ' '.join(description_parts).strip()
        if not description or len(description) < 3:
            continue

        # Clean description
        description = re.sub(r'\s+', ' ', description).strip()
        description = description.replace('"', "'")
        if ',' in description:
            description = f'"{description}"'

        csv_lines.append(f"{block['date']},{description},{transaction_amount}")

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
    # Support both DD/MM/YYYY and DD/MM/YY formats
    date_pattern = r'^(\d{1,2}/\d{1,2}/\d{2,4})\s+'

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
        # "Deposit-Osko" is a credit, "Withdrawal-Osko" is a debit
        is_deposit_osko = 'DEPOSIT-OSKO' in full_text_upper or 'DEPOSIT OSKO' in full_text_upper
        is_direct_credit = 'DIRECT CREDIT' in full_text_upper
        is_transfer_in = 'TRANSFER IN' in full_text_upper
        is_payment_received = 'PAYMENT RECEIVED' in full_text_upper
        is_refund = 'REFUND' in full_text_upper

        if is_deposit_osko or is_direct_credit or is_transfer_in or is_payment_received or is_refund:
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
