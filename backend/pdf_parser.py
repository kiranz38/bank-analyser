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
    header_found = False

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
                if not header_found:
                    row_lower = ' '.join(cleaned_row).lower()
                    header_keywords = ['date', 'description', 'amount', 'debit', 'credit',
                                      'transaction', 'details', 'particulars', 'narration',
                                      'withdrawal', 'deposit', 'balance']
                    if sum(1 for kw in header_keywords if kw in row_lower) >= 2:
                        header_found = True
                        all_rows.append(cleaned_row)
                        continue

                # Check if this looks like a transaction row
                row_text = ' '.join(cleaned_row)
                if _looks_like_transaction(row_text):
                    all_rows.append(cleaned_row)

    if not all_rows:
        return ''

    # If no header found, create a generic one
    if not header_found and all_rows:
        num_cols = len(all_rows[0])
        if num_cols >= 3:
            header_row = ['Date', 'Description', 'Amount'] + [f'Col{i}' for i in range(3, num_cols)]
        elif num_cols == 2:
            header_row = ['Description', 'Amount']
        else:
            header_row = ['Data']
        all_rows.insert(0, header_row)

    # Convert to CSV
    csv_lines = []
    for row in all_rows:
        # Escape commas and quotes in fields
        escaped = []
        for cell in row:
            if ',' in cell or '"' in cell or '\n' in cell:
                cell = '"' + cell.replace('"', '""') + '"'
            escaped.append(cell)
        csv_lines.append(','.join(escaped))

    return '\n'.join(csv_lines)


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

    # Find all amounts in the text
    amount_pattern = r'[\$£€]?\s*-?\d{1,3}(?:,\d{3})*(?:\.\d{2})?'

    # Find lines containing amounts
    lines_with_amounts = []
    for line in full_text.split('\n'):
        line = line.strip()
        if re.search(amount_pattern, line) and len(line) > 10:
            lines_with_amounts.append(line)

    if not lines_with_amounts:
        return ''

    # Create a simple CSV
    csv_lines = ['Date,Description,Amount']
    for line in lines_with_amounts:
        # Try to extract amount
        amounts = re.findall(r'-?[\$£€]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})', line)
        if amounts:
            amount = amounts[-1].replace('$', '').replace('£', '').replace('€', '').replace(',', '').strip()
            # Remove the amount from the line to get description
            desc = line
            for a in amounts:
                desc = desc.replace(a, '')
            desc = re.sub(r'\s+', ' ', desc).strip()

            # Try to extract date
            date_match = re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', line)
            date = date_match.group(0) if date_match else ''

            if desc:
                if ',' in desc:
                    desc = f'"{desc}"'
                csv_lines.append(f"{date},{desc},{amount}")

    return '\n'.join(csv_lines)


def _looks_like_transaction(text: str) -> bool:
    """Check if text looks like a transaction row."""
    if len(text) < 5:
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

    # Must have at least an amount (dates are optional for some formats)
    return has_amount


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
