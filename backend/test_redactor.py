"""Tests for PII redaction in redactor module."""

import pytest
from redactor import redact_text, redact_transactions


# ---------------------------------------------------------------------------
# 1. Account number patterns
# ---------------------------------------------------------------------------

class TestAccountNumbers:
    """Account numbers should be fully redacted."""

    def test_au_format_with_dashes(self):
        text = "Paid to 12-3456-78901234 today"
        result = redact_text(text)
        assert "12-3456-78901234" not in result

    def test_acc_prefix(self):
        text = "ACC: 123456789"
        result = redact_text(text)
        assert "123456789" not in result

    def test_account_keyword(self):
        text = "Account 9876543210"
        result = redact_text(text)
        assert "9876543210" not in result

    def test_account_number_keyword(self):
        text = "Account Number: 00112233"
        result = redact_text(text)
        assert "00112233" not in result

    def test_acct_abbreviation(self):
        text = "ACCT 556677889900"
        result = redact_text(text)
        assert "556677889900" not in result


# ---------------------------------------------------------------------------
# 2. Email addresses
# ---------------------------------------------------------------------------

class TestEmails:
    """Email addresses should be redacted."""

    def test_simple_email(self):
        text = "Send receipt to john@example.com"
        result = redact_text(text)
        assert "john@example.com" not in result

    def test_email_with_plus(self):
        text = "user+tag@domain.co.uk"
        result = redact_text(text)
        assert "user+tag@domain.co.uk" not in result

    def test_email_with_dots(self):
        text = "first.last@company.com.au"
        result = redact_text(text)
        assert "first.last@company.com.au" not in result

    def test_email_embedded_in_sentence(self):
        text = "Contact alice@bank.org for details."
        result = redact_text(text)
        assert "alice@bank.org" not in result


# ---------------------------------------------------------------------------
# 3. Phone numbers
# ---------------------------------------------------------------------------

class TestPhoneNumbers:
    """Phone numbers in various AU/international formats should be redacted."""

    def test_international_mobile_with_spaces(self):
        text = "Call +61 412 345 678"
        result = redact_text(text)
        assert "412 345 678" not in result

    def test_local_mobile_no_spaces(self):
        text = "Ph: 0412345678"
        result = redact_text(text)
        assert "0412345678" not in result

    def test_landline_with_area_code_parens(self):
        text = "Office (02) 9876 5432"
        result = redact_text(text)
        assert "9876 5432" not in result

    def test_mobile_with_dashes(self):
        text = "0412-345-678"
        result = redact_text(text)
        assert "0412-345-678" not in result

    def test_international_prefix_no_spaces(self):
        text = "+61412345678"
        result = redact_text(text)
        assert "+61412345678" not in result


# ---------------------------------------------------------------------------
# 4. BSB numbers
# ---------------------------------------------------------------------------

class TestBSBNumbers:
    """BSB numbers (Australian bank/branch codes) should be redacted."""

    def test_bsb_with_colon_and_dash(self):
        text = "BSB: 062-000"
        result = redact_text(text)
        assert "062-000" not in result

    def test_bsb_space_and_dash(self):
        text = "BSB 123-456"
        result = redact_text(text)
        assert "123-456" not in result

    def test_bsb_no_dash(self):
        text = "BSB: 062000"
        result = redact_text(text)
        assert "062000" not in result

    def test_bsb_lowercase(self):
        text = "bsb: 999-888"
        result = redact_text(text)
        assert "999-888" not in result


# ---------------------------------------------------------------------------
# 5. IBAN numbers
# ---------------------------------------------------------------------------

class TestIBANNumbers:
    """International Bank Account Numbers should be redacted."""

    def test_gb_iban(self):
        text = "IBAN GB29NWBK60161331926819"
        result = redact_text(text)
        assert "GB29NWBK60161331926819" not in result

    def test_de_iban(self):
        text = "Transfer to DE89370400440532013000"
        result = redact_text(text)
        assert "DE89370400440532013000" not in result

    def test_au_iban_like(self):
        text = "AU12345678901234567890"
        result = redact_text(text)
        assert "AU12345678901234567890" not in result

    def test_iban_with_spaces(self):
        text = "IBAN: GB29 NWBK 6016 1331 9268 19"
        result = redact_text(text)
        assert "GB29 NWBK 6016 1331 9268 19" not in result


# ---------------------------------------------------------------------------
# 6. Reference IDs
# ---------------------------------------------------------------------------

class TestReferenceIDs:
    """Transaction reference identifiers should be redacted."""

    def test_ref_colon_alphanumeric(self):
        text = "REF:ABC123456"
        result = redact_text(text)
        assert "ABC123456" not in result

    def test_reference_keyword(self):
        text = "Reference: 12345"
        result = redact_text(text)
        assert "12345" not in result

    def test_ref_hash(self):
        text = "Ref# TXN9988776655"
        result = redact_text(text)
        assert "TXN9988776655" not in result

    def test_ref_with_space(self):
        text = "REF 00ABCDEF"
        result = redact_text(text)
        assert "00ABCDEF" not in result


# ---------------------------------------------------------------------------
# 7. Street addresses
# ---------------------------------------------------------------------------

class TestStreetAddresses:
    """Street addresses should be redacted."""

    def test_main_street(self):
        text = "Located at 123 Main Street"
        result = redact_text(text)
        assert "123 Main Street" not in result

    def test_road(self):
        text = "Deliver to 45 George Rd"
        result = redact_text(text)
        assert "45 George Rd" not in result

    def test_avenue(self):
        text = "789 Collins Avenue Melbourne"
        result = redact_text(text)
        assert "789 Collins Avenue" not in result

    def test_drive(self):
        text = "Unit 4, 10 Harbour Drive"
        result = redact_text(text)
        assert "10 Harbour Drive" not in result


# ---------------------------------------------------------------------------
# 8. Transaction list redaction
# ---------------------------------------------------------------------------

class TestRedactTransactions:
    """redact_transactions should redact PII inside transaction dicts."""

    def test_basic_transaction_list(self):
        transactions = [
            {
                "date": "2025-01-15",
                "amount": -42.50,
                "description": "Payment to john@example.com REF:ABC123",
                "category": "Transfer",
            }
        ]
        result = redact_transactions(transactions)
        assert len(result) == 1
        assert "john@example.com" not in result[0]["description"]
        assert "ABC123" not in result[0]["description"]

    def test_date_preserved(self):
        transactions = [
            {"date": "2025-03-10", "amount": -10.00, "description": "NETFLIX"}
        ]
        result = redact_transactions(transactions)
        assert result[0]["date"] == "2025-03-10"

    def test_amount_preserved(self):
        transactions = [
            {"date": "2025-03-10", "amount": -29.99, "description": "Spotify"}
        ]
        result = redact_transactions(transactions)
        assert result[0]["amount"] == -29.99

    def test_multiple_transactions(self):
        transactions = [
            {"date": "2025-01-01", "amount": -5.00, "description": "Coffee"},
            {
                "date": "2025-01-02",
                "amount": -100.00,
                "description": "Transfer to ACC: 123456789",
            },
        ]
        result = redact_transactions(transactions)
        assert len(result) == 2
        assert "123456789" not in result[1]["description"]
        assert result[0]["description"] == "Coffee"

    def test_returns_new_list(self):
        """redact_transactions should not mutate the original list."""
        transactions = [
            {
                "date": "2025-06-01",
                "amount": -20.00,
                "description": "Sent to alice@bank.org",
            }
        ]
        result = redact_transactions(transactions)
        assert result is not transactions
        # Original should remain unchanged
        assert "alice@bank.org" in transactions[0]["description"]

    def test_empty_list(self):
        assert redact_transactions([]) == []


# ---------------------------------------------------------------------------
# 9. Amounts and dates should NOT be redacted
# ---------------------------------------------------------------------------

class TestSafeValues:
    """Monetary amounts and date strings must pass through unchanged."""

    def test_dollar_amount_preserved(self):
        text = "Total $1,234.56"
        result = redact_text(text)
        assert "$1,234.56" in result

    def test_plain_amount_preserved(self):
        text = "Amount: 99.95"
        result = redact_text(text)
        assert "99.95" in result

    def test_date_iso_preserved(self):
        text = "Date: 2025-01-15"
        result = redact_text(text)
        assert "2025-01-15" in result

    def test_date_slash_preserved(self):
        text = "Posted 15/01/2025"
        result = redact_text(text)
        assert "15/01/2025" in result

    def test_date_verbose_preserved(self):
        text = "January 15, 2025"
        result = redact_text(text)
        assert "January 15, 2025" in result

    def test_negative_amount_preserved(self):
        text = "Debit -45.00"
        result = redact_text(text)
        assert "-45.00" in result


# ---------------------------------------------------------------------------
# 10. Normal merchant descriptions pass through unchanged
# ---------------------------------------------------------------------------

class TestMerchantDescriptions:
    """Common merchant names should not be redacted."""

    def test_netflix(self):
        assert redact_text("NETFLIX") == "NETFLIX"

    def test_uber_eats(self):
        assert redact_text("UBER EATS") == "UBER EATS"

    def test_woolworths(self):
        assert redact_text("WOOLWORTHS 1234") == "WOOLWORTHS 1234"

    def test_coles(self):
        assert redact_text("COLES SUPERMARKET") == "COLES SUPERMARKET"

    def test_spotify(self):
        assert redact_text("SPOTIFY P12345") == "SPOTIFY P12345"

    def test_amazon(self):
        assert redact_text("AMAZON AU") == "AMAZON AU"

    def test_mcdonalds(self):
        assert redact_text("MCDONALD'S") == "MCDONALD'S"

    def test_complex_merchant_no_pii(self):
        text = "VISA PURCHASE - UBER EATS SYDNEY AU"
        assert redact_text(text) == text


# ---------------------------------------------------------------------------
# Edge cases / mixed content
# ---------------------------------------------------------------------------

class TestMixedContent:
    """Strings containing both safe and sensitive data."""

    def test_merchant_with_email(self):
        text = "PAYPAL john@example.com"
        result = redact_text(text)
        assert "PAYPAL" in result
        assert "john@example.com" not in result

    def test_description_with_phone_and_amount(self):
        text = "Payment $50.00 to 0412345678"
        result = redact_text(text)
        assert "$50.00" in result
        assert "0412345678" not in result

    def test_description_with_bsb_and_account(self):
        text = "Transfer BSB: 062-000 ACC: 12345678"
        result = redact_text(text)
        assert "062-000" not in result
        assert "12345678" not in result

    def test_date_and_address(self):
        text = "2025-01-15 at 123 Main Street"
        result = redact_text(text)
        assert "2025-01-15" in result
        assert "123 Main Street" not in result


# ---------------------------------------------------------------------------
# Return type sanity checks
# ---------------------------------------------------------------------------

class TestReturnTypes:
    """Verify functions return the expected types."""

    def test_redact_text_returns_str(self):
        assert isinstance(redact_text("hello"), str)

    def test_redact_text_empty_string(self):
        assert redact_text("") == ""

    def test_redact_transactions_returns_list(self):
        assert isinstance(redact_transactions([]), list)

    def test_redact_transactions_returns_dicts(self):
        txns = [{"date": "2025-01-01", "amount": -1.0, "description": "Test"}]
        result = redact_transactions(txns)
        assert all(isinstance(t, dict) for t in result)
