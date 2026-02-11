"""PII redaction for transaction data before sending to LLMs.

Strips or replaces personally identifiable information including:
- Names (common name patterns in transaction descriptions)
- Addresses (street addresses, postcodes)
- Account numbers (XX-XXXX-XXXXXXXX, plain digit sequences, etc.)
- BSB numbers (Australian format: XXX-XXX)
- IBAN numbers
- Reference IDs (REF:XXXX, reference numbers)
- Email addresses
- Phone numbers (various international formats)
"""

import re
from copy import deepcopy

# ---------------------------------------------------------------------------
# Sentinel used as the replacement token
# ---------------------------------------------------------------------------
REDACTED = "[REDACTED]"

# ---------------------------------------------------------------------------
# Pre-compiled regex patterns (order matters -- more specific patterns first)
# ---------------------------------------------------------------------------

# Email addresses  (must come before generic word patterns)
_EMAIL_RE = re.compile(
    r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"
)

# IBAN  (2-letter country code + 2 check digits + up to 30 alphanumeric chars)
_IBAN_RE = re.compile(
    r"\b[A-Z]{2}\d{2}[\s\-]?[\dA-Z]{4}[\s\-]?[\dA-Z]{4}[\s\-]?[\dA-Z]{4}"
    r"(?:[\s\-]?[\dA-Z]{4}){0,5}(?:[\s\-]?[\dA-Z]{1,4})?\b"
)

# Australian BSB  (3 digits, optional dash, 3 digits -- preceded by BSB keyword)
_BSB_KEYWORD_RE = re.compile(
    r"\bBSB[\s:]*\d{3}[\-\s]?\d{3}\b", re.IGNORECASE
)

# Australian BSB  (3 digits, dash, 3 digits -- standalone)
_BSB_RE = re.compile(
    r"\b\d{3}-\d{3}\b"
)

# Account numbers in XX-XXXX-XXXXXXXX format (NZ / AU style)
_ACCOUNT_DASHED_RE = re.compile(
    r"\b\d{2}-\d{4}-\d{7,8}(?:-\d{2,3})?\b"
)

# Generic long digit sequences that look like account / card numbers (8-17 digits,
# optionally separated by spaces or dashes)
_ACCOUNT_LONG_RE = re.compile(
    r"\b\d(?:[\s\-]?\d){7,16}\b"
)

# Card number fragments often shown as last-4 with masking  e.g. ****1234, XXXX-1234
_CARD_MASKED_RE = re.compile(
    r"(?:\*{2,}|\bX{2,})[\s\-]?\d{4}\b", re.IGNORECASE
)

# Reference IDs  (REF:xxx, Ref No:xxx, Reference:xxx, ref #xxx, etc.)
_REFERENCE_RE = re.compile(
    r"\b(?:REF(?:ERENCE)?(?:\s*(?:No|Number|ID|#))?|Ref(?:\s*(?:No|Number|ID|#))?)"
    r"[\s]*[:#.\-\s][\s]*[A-Za-z0-9\-]{3,20}\b",
    re.IGNORECASE,
)

# Phone numbers -- specific formats to avoid matching dates:
#   +61 4XX XXX XXX, (02) 9XXX XXXX, 04XX-XXX-XXX, +1-555-123-4567, etc.
# Uses explicit patterns rather than broad digit matching.
_PHONE_RE = re.compile(
    r"(?:"
    # International format: +CC NNNN NNN NNN
    r"\+\d{1,4}[\s\-]?\d{1,5}[\s\-]?\d{2,4}[\s\-]?\d{3,4}(?:[\s\-]?\d{1,4})?"
    r"|"
    # Parenthesized area code: (02) NNNN NNNN
    r"\(\d{2,5}\)[\s\-]?\d{3,4}[\s\-]?\d{3,4}"
    r"|"
    # Australian mobile: 04XX XXX XXX or 04XX-XXX-XXX
    r"\b04\d{2}[\s\-]?\d{3}[\s\-]?\d{3}\b"
    r")",
)

# Australian postcodes  (4 digits, standalone)
_AU_POSTCODE_RE = re.compile(r"\b\d{4}\b")

# UK postcodes  e.g. SW1A 1AA, EC2R 8AH
_UK_POSTCODE_RE = re.compile(
    r"\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b", re.IGNORECASE
)

# US ZIP codes  e.g. 90210, 90210-1234
_US_ZIP_RE = re.compile(
    r"\b\d{5}(?:-\d{4})?\b"
)

# Street addresses  -- line starting with a number followed by street-type words
_STREET_ADDRESS_RE = re.compile(
    r"\b\d{1,5}\s+"
    r"(?:[A-Z][a-z]+\s+){0,4}"
    r"(?:St(?:reet)?|Rd|Road|Ave(?:nue)?|Blvd|Boulevard|Dr(?:ive)?|Ct|Court"
    r"|Ln|Lane|Way|Pl(?:ace)?|Cres(?:cent)?|Tce|Terrace|Pde|Parade"
    r"|Hwy|Highway|Cir(?:cle)?|Loop|Run|Trail|Pass|Pike|Row)\b"
    r"(?:\s*,?\s*(?:Suite|Ste|Apt|Unit|#)\s*\w+)?",
    re.IGNORECASE,
)

# PO Box
_PO_BOX_RE = re.compile(
    r"\bP\.?O\.?\s*Box\s+\d+\b", re.IGNORECASE
)

# Common name patterns found in bank transaction descriptions:
#   "TO John Smith", "FROM Jane Doe", "PAYEE: John A. Smith"
#   Matches 2-3 consecutive capitalised words preceded by a trigger keyword.
#
# IMPORTANT: Short keywords (TO, FROM) must appear as *complete* words followed
# by a delimiter (space/colon) to avoid matching inside words like "Town".
# Longer, unambiguous keywords like PAYEE, BENEFICIARY etc. are safe as-is.
_NAME_LONG_TRIGGERS = (
    r"(?:PAYEE|PAYER|BENEFICIARY|RECIPIENT|SENDER|A/C NAME|ACCOUNT NAME"
    r"|NAME|PAID TO|PAID BY|PAYMENT TO|PAYMENT FROM|TRANSFER TO|TRANSFER FROM"
    r"|TFR TO|TFR FROM)"
)
# Short triggers require whitespace or colon immediately after to prevent
# partial-word matches (e.g. "Town" should not trigger on "TO").
_NAME_SHORT_TRIGGERS = r"(?:(?<=\s)|(?<=^))(?:TO|FROM)(?=[\s:])"

_NAME_AFTER_LONG_TRIGGER_RE = re.compile(
    r"\b" + _NAME_LONG_TRIGGERS + r"[\s:]*"
    r"([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b",
    re.IGNORECASE,
)
_NAME_AFTER_SHORT_TRIGGER_RE = re.compile(
    _NAME_SHORT_TRIGGERS + r"[\s:]*"
    r"([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b",
    re.IGNORECASE,
)

# Standalone full names -- two or three capitalised words that are NOT common
# merchant / category words.  Applied conservatively to avoid over-redacting.
_COMMON_WORDS = frozenset({
    # Transaction-related
    "VISA", "MASTERCARD", "AMEX", "EFTPOS", "DIRECT", "DEBIT", "CREDIT",
    "TRANSFER", "PAYMENT", "PURCHASE", "WITHDRAWAL", "DEPOSIT", "ONLINE",
    "RECURRING", "INTERNATIONAL", "DOMESTIC", "PENDING", "POSTED", "CLEARED",
    "REFUND", "REVERSAL", "ADJUSTMENT", "AUTHORISED", "AUTHORIZED",
    "MONTHLY", "ANNUAL", "WEEKLY", "DAILY",
    # Common merchant words
    "PTY", "LTD", "INC", "LLC", "CORP", "GROUP", "HOLDINGS", "SERVICES",
    "AUSTRALIA", "SYDNEY", "MELBOURNE", "BRISBANE", "PERTH", "ADELAIDE",
    "NEW", "YORK", "LOS", "ANGELES", "SAN", "FRANCISCO",
    "CAFE", "COFFEE", "SHOP", "STORE", "MARKET", "SUPER", "MART",
    "THE", "AND", "FOR", "WITH",
})

# ---------------------------------------------------------------------------
# Ordered list of (pattern, replacement) tuples.
# More specific patterns are listed first so they match before generic ones.
# ---------------------------------------------------------------------------
_PATTERNS: list[tuple[re.Pattern, str]] = [
    (_EMAIL_RE, REDACTED),
    (_IBAN_RE, REDACTED),
    (_ACCOUNT_DASHED_RE, REDACTED),
    (_BSB_KEYWORD_RE, REDACTED),
    (_BSB_RE, REDACTED),
    (_CARD_MASKED_RE, REDACTED),
    (_REFERENCE_RE, REDACTED),
    (_NAME_AFTER_LONG_TRIGGER_RE, REDACTED),
    (_NAME_AFTER_SHORT_TRIGGER_RE, REDACTED),
    (_PO_BOX_RE, REDACTED),
    (_STREET_ADDRESS_RE, REDACTED),
    (_UK_POSTCODE_RE, REDACTED),
    (_PHONE_RE, REDACTED),
]

# Patterns that are only applied when context suggests they are PII
# (to avoid false positives on amounts, dates, etc.)
_CONTEXTUAL_PATTERNS: list[tuple[re.Pattern, str]] = [
    (_ACCOUNT_LONG_RE, REDACTED),
    (_US_ZIP_RE, REDACTED),
    (_AU_POSTCODE_RE, REDACTED),
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def redact_text(text: str) -> str:
    """Redact PII patterns from a single string.

    Applies a layered set of regex-based redactions.  More specific patterns
    (IBAN, email, dashed account numbers) are applied first so that their
    matches are not partially consumed by broader patterns.

    Args:
        text: The input string potentially containing PII.

    Returns:
        A new string with PII replaced by ``[REDACTED]``.
    """
    if not text:
        return text

    result = text

    # Pass 1 -- high-confidence patterns (applied unconditionally)
    for pattern, replacement in _PATTERNS:
        result = pattern.sub(replacement, result)

    # Pass 2 -- contextual patterns: only redact long digit sequences that
    # survived Pass 1 and are NOT plausible amounts or dates.
    # Date pattern to skip: YYYY-MM-DD, DD/MM/YYYY, etc.
    _DATE_LIKE_RE = re.compile(
        r"\b\d{4}[\-/]\d{1,2}[\-/]\d{1,2}\b"
        r"|\b\d{1,2}[\-/]\d{1,2}[\-/]\d{2,4}\b"
    )

    for pattern, replacement in _CONTEXTUAL_PATTERNS:
        def _contextual_sub(m: re.Match, _pat=pattern) -> str:
            matched = m.group(0)
            start = m.start()
            # Skip if preceded by a currency symbol
            if start > 0 and result[start - 1] in "$£€₹":
                return matched
            # Skip if the match looks like a date
            if _DATE_LIKE_RE.match(matched):
                return matched
            # Skip if it overlaps a date-like pattern in surrounding text
            surrounding = result[max(0, start - 5):m.end() + 5]
            if _DATE_LIKE_RE.search(surrounding):
                return matched
            # Skip short sequences (4-5 digits) that may be store IDs
            clean = matched.replace(" ", "").replace("-", "")
            if len(clean) < 6:
                return matched
            # Check if it looks like a decimal amount
            if "." in text[m.start():m.end() + 3]:
                surrounding_amt = text[max(0, m.start() - 1):m.end() + 3]
                if re.search(r"[\$£€₹]", surrounding_amt):
                    return matched
            return replacement

        result = pattern.sub(_contextual_sub, result)

    # Collapse multiple consecutive [REDACTED] tokens into one
    result = re.sub(
        r"(?:\[REDACTED\]\s*){2,}",
        REDACTED + " ",
        result,
    ).strip()

    return result


def redact_transactions(transactions: list[dict]) -> list[dict]:
    """Redact PII from a list of transaction dictionaries.

    For each transaction only the following fields are retained:
      - ``date`` -- kept as-is (no PII)
      - ``description`` -- redacted (falls back to ``merchant`` or
        ``original_merchant`` if ``description`` is absent)
      - ``amount`` -- kept as-is
      - ``category`` -- kept as-is

    All other fields (e.g. ``merchant``, ``original_merchant``, ``payee``,
    ``account``) are **stripped** from the output to minimise leakage.

    Args:
        transactions: A list of transaction dicts, each expected to have at
            least ``date``, ``amount``, and one of ``description``,
            ``merchant``, or ``original_merchant``.

    Returns:
        A new list of dicts containing only the four safe fields listed above.
    """
    redacted: list[dict] = []

    for txn in transactions:
        # Determine the best available description text
        raw_description = (
            txn.get("description")
            or txn.get("original_merchant")
            or txn.get("merchant")
            or ""
        )

        redacted.append({
            "date": txn.get("date", ""),
            "description": redact_text(str(raw_description)),
            "amount": txn.get("amount", 0),
            "category": txn.get("category", ""),
        })

    return redacted
