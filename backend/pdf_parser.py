"""PDF parsing for bank statements."""

import io
import re
from typing import Optional
import pdfplumber


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    text_lines = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            # Try to extract tables first (better for bank statements)
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    for row in table:
                        if row:
                            # Filter out None values and join
                            row_text = ','.join(str(cell) if cell else '' for cell in row)
                            text_lines.append(row_text)
            else:
                # Fall back to text extraction
                text = page.extract_text()
                if text:
                    text_lines.append(text)

    return '\n'.join(text_lines)


def pdf_to_csv(pdf_bytes: bytes) -> str:
    """
    Convert PDF bank statement to CSV format.

    Attempts to detect and extract transaction data from various PDF formats.
    """
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        all_rows = []
        header_found = False
        header_row = None

        for page in pdf.pages:
            # Extract tables from the page
            tables = page.extract_tables()

            for table in tables:
                for row in table:
                    if not row or all(cell is None or str(cell).strip() == '' for cell in row):
                        continue

                    # Clean the row
                    cleaned_row = [str(cell).strip() if cell else '' for cell in row]

                    # Try to detect header row
                    if not header_found:
                        row_lower = ' '.join(cleaned_row).lower()
                        if any(kw in row_lower for kw in ['date', 'description', 'amount', 'debit', 'credit', 'transaction']):
                            header_row = cleaned_row
                            header_found = True
                            all_rows.append(cleaned_row)
                            continue

                    # Check if this looks like a transaction row (has a date-like pattern)
                    row_text = ' '.join(cleaned_row)
                    if _looks_like_transaction(row_text):
                        all_rows.append(cleaned_row)

        # If no tables found, try text extraction
        if not all_rows:
            return _extract_transactions_from_text(pdf)

        # If no header found, create a generic one
        if not header_found and all_rows:
            # Guess columns based on content
            num_cols = len(all_rows[0])
            if num_cols >= 3:
                header_row = ['Date', 'Description', 'Amount'] + [f'Col{i}' for i in range(3, num_cols)]
                all_rows.insert(0, header_row)

        # Convert to CSV
        csv_lines = []
        for row in all_rows:
            # Escape commas in fields
            escaped = [f'"{cell}"' if ',' in cell else cell for cell in row]
            csv_lines.append(','.join(escaped))

        return '\n'.join(csv_lines)


def _looks_like_transaction(text: str) -> bool:
    """Check if text looks like a transaction row."""
    # Common date patterns
    date_patterns = [
        r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # MM/DD/YYYY, DD-MM-YY, etc.
        r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',     # YYYY-MM-DD
        r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)',  # DD Mon
        r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}',  # Mon DD
    ]

    # Check for date pattern
    has_date = any(re.search(pattern, text, re.IGNORECASE) for pattern in date_patterns)

    # Check for amount pattern (currency)
    amount_patterns = [
        r'[\$£€]\s*[\d,]+\.?\d*',           # $123.45
        r'[\d,]+\.\d{2}\s*(?:DR|CR)?',      # 123.45 or 123.45 DR
        r'-?\s*[\d,]+\.\d{2}',               # -123.45
    ]
    has_amount = any(re.search(pattern, text) for pattern in amount_patterns)

    return has_date or has_amount


def _extract_transactions_from_text(pdf) -> str:
    """Extract transactions from PDF text when tables aren't available."""
    lines = []

    for page in pdf.pages:
        text = page.extract_text()
        if text:
            for line in text.split('\n'):
                if _looks_like_transaction(line):
                    lines.append(line)

    if not lines:
        return ''

    # Try to parse lines into CSV format
    csv_lines = ['Date,Description,Amount']

    for line in lines:
        parsed = _parse_transaction_line(line)
        if parsed:
            csv_lines.append(f'{parsed["date"]},{parsed["description"]},{parsed["amount"]}')

    return '\n'.join(csv_lines)


def _parse_transaction_line(line: str) -> Optional[dict]:
    """Attempt to parse a single transaction line."""
    # Try common patterns

    # Pattern 1: DATE DESCRIPTION AMOUNT
    match = re.match(
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+([-\$£€]?\s*[\d,]+\.\d{2})\s*$',
        line
    )
    if match:
        return {
            'date': match.group(1),
            'description': match.group(2).strip(),
            'amount': match.group(3).replace('$', '').replace('£', '').replace('€', '').strip()
        }

    # Pattern 2: DATE DESCRIPTION DEBIT CREDIT
    match = re.match(
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})?\s+([\d,]+\.\d{2})?\s*$',
        line
    )
    if match:
        debit = match.group(3)
        credit = match.group(4)
        amount = f'-{debit}' if debit else credit
        if amount:
            return {
                'date': match.group(1),
                'description': match.group(2).strip(),
                'amount': amount
            }

    return None
