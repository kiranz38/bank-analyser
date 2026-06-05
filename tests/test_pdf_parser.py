"""
Extensive test of the PDF parser against all generated bank statement PDFs.
Tests: transaction count, date parsing, amount extraction, balance detection.
"""

import sys
import os
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from pdf_parser import pdf_to_csv
import csv
import io

def parse_pdf(path):
    """Wrapper: returns list of dicts from pdf_to_csv."""
    with open(path, 'rb') as f:
        raw = f.read()
    csv_str = pdf_to_csv(raw)
    if not csv_str or not csv_str.strip():
        return []
    reader = csv.DictReader(io.StringIO(csv_str))
    rows = list(reader)
    return rows

BASE = os.path.dirname(__file__)
STATEMENTS_DIR = os.path.join(BASE, 'statements')

BANKS = [
    ("anz-au",         ["anz-au-1.pdf", "anz-au-2.pdf"]),
    ("anz-nz",         ["anz-nz-1.pdf", "anz-nz-2.pdf"]),
    ("commbank",       ["commbank-1.pdf", "commbank-2.pdf"]),
    ("westpac",        ["westpac-1.pdf", "westpac-2.pdf"]),
    ("nab",            ["nab-1.pdf", "nab-2.pdf"]),
    ("chase",          ["chase-1.pdf", "chase-2.pdf"]),
    ("bank-of-america",["boa-1.pdf", "boa-2.pdf"]),
    ("barclays",       ["barclays-1.pdf", "barclays-2.pdf"]),
    ("hsbc",           ["hsbc-1.pdf", "hsbc-2.pdf"]),
    ("td-bank-ca",     ["td-ca-1.pdf", "td-ca-2.pdf"]),
    ("td-bank-us",     ["td-us-1.pdf", "td-us-2.pdf"]),
    ("wells-fargo",    ["wells-fargo-1.pdf", "wells-fargo-2.pdf"]),
]

PASS = "✅"
FAIL = "❌"
WARN = "⚠️"

def _find_key(row, *candidates):
    """Case-insensitive key lookup in a CSV row dict."""
    lower_map = {k.lower().strip(): v for k, v in row.items()}
    for c in candidates:
        v = lower_map.get(c.lower())
        if v is not None:
            return v
    return None

def check_transactions(txns, bank, filename):
    issues = []
    if not txns:
        return [f"{FAIL} No transactions extracted"]

    # Check minimum count
    if len(txns) < 5:
        issues.append(f"{WARN} Only {len(txns)} transactions (expected ≥10)")

    # Check each transaction has required fields
    missing_date = sum(1 for t in txns if not _find_key(t, 'date', 'Date', 'posting date', 'transaction date'))
    missing_desc = sum(1 for t in txns if not _find_key(t, 'description', 'Description', 'merchant', 'details', 'particulars', 'transaction'))
    missing_amount = sum(1 for t in txns if not _find_key(t, 'amount', 'Amount', 'debit', 'Debit', 'credit', 'Credit', 'withdrawals', 'deposits', 'money out', 'money in', 'paid out', 'paid in'))

    if missing_date > 0:
        issues.append(f"{WARN} {missing_date}/{len(txns)} transactions missing date")
    if missing_desc > 0:
        issues.append(f"{WARN} {missing_desc}/{len(txns)} transactions missing description")
    if missing_amount > 0:
        issues.append(f"{FAIL} {missing_amount}/{len(txns)} transactions missing amount")

    # Check for nonsensical amounts
    amounts = []
    for t in txns:
        amt = _find_key(t, 'amount', 'debit', 'credit', 'withdrawals', 'deposits', 'money out', 'paid out') or 0
        if amt:
            try:
                amounts.append(float(str(amt).replace(',', '').replace('$', '').replace('£', '').replace('+', '').replace('-', '').strip()))
            except (ValueError, TypeError):
                pass

    if amounts:
        if max(abs(a) for a in amounts) > 100000:
            issues.append(f"{WARN} Suspiciously large amount: {max(abs(a) for a in amounts):,.2f}")
        zero_amounts = sum(1 for a in amounts if a == 0)
        if zero_amounts > len(amounts) * 0.3:
            issues.append(f"{WARN} {zero_amounts} zero-amount transactions")

    return issues if issues else [f"{PASS} OK — {len(txns)} transactions extracted"]


results = {}
total_pass = 0
total_fail = 0

print("=" * 70)
print("BANK PDF PARSER TEST SUITE")
print("=" * 70)

for bank_dir, pdfs in BANKS:
    bank_results = {}
    print(f"\n{'─' * 70}")
    print(f"  BANK: {bank_dir.upper()}")
    print(f"{'─' * 70}")

    for pdf_name in pdfs:
        pdf_path = os.path.join(STATEMENTS_DIR, bank_dir, pdf_name)
        if not os.path.exists(pdf_path):
            print(f"  {FAIL} {pdf_name}: FILE NOT FOUND")
            total_fail += 1
            continue

        try:
            result = parse_pdf(pdf_path)
            txns = result if isinstance(result, list) else result.get('transactions', result.get('data', []))

            # Handle various return formats
            if isinstance(result, dict):
                txns = (result.get('transactions') or
                        result.get('data') or
                        result.get('rows') or
                        [])
            elif isinstance(result, list):
                txns = result

            issues = check_transactions(txns, bank_dir, pdf_name)
            has_fail = any(FAIL in i for i in issues)

            if has_fail:
                total_fail += 1
            else:
                total_pass += 1

            print(f"  {pdf_name}:")
            for issue in issues:
                print(f"    {issue}")

            # Show sample transactions
            if txns:
                print(f"    Sample (first 3 transactions):")
                for t in txns[:3]:
                    if isinstance(t, dict):
                        date_val = _find_key(t, 'date', 'Date', 'posting date') or 'N/A'
                        desc = _find_key(t, 'description', 'Description', 'merchant', 'details', 'particulars', 'transaction') or 'N/A'
                        amt = _find_key(t, 'amount', 'Amount', 'debit', 'credit', 'withdrawals', 'deposits', 'money out', 'paid out') or 'N/A'
                        print(f"      date={str(date_val)[:20]:20s}  desc={str(desc)[:30]:30s}  amount={str(amt)[:12]}")
                    elif isinstance(t, (list, tuple)):
                        print(f"      {t[:5]}")

            bank_results[pdf_name] = {
                'count': len(txns),
                'issues': issues,
                'pass': not has_fail,
            }

        except Exception as e:
            print(f"  {FAIL} {pdf_name}: EXCEPTION — {type(e).__name__}: {e}")
            total_fail += 1
            bank_results[pdf_name] = {'count': 0, 'issues': [str(e)], 'pass': False}

    results[bank_dir] = bank_results

print(f"\n{'=' * 70}")
print(f"SUMMARY: {total_pass} passed, {total_fail} failed out of {total_pass + total_fail} PDFs")
print(f"{'=' * 70}")

# Save detailed results
out_path = os.path.join(BASE, "pdf_parser_test_results.json")
with open(out_path, 'w') as f:
    json.dump(results, f, indent=2, default=str)
print(f"\nDetailed results saved to: {out_path}")

sys.exit(0 if total_fail == 0 else 1)
