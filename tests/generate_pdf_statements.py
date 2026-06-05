"""
Generate realistic synthetic PDF bank statements for all supported banks.

Each bank matches its real-world PDF format exactly (column headers, date formats,
balance notation, layout quirks) so the parser can be tested against them.
"""

import os
import random
from datetime import date, timedelta
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

BASE = os.path.dirname(__file__)

# ── Shared transaction data ──────────────────────────────────────────────────

AU_TRANSACTIONS = [
    ("Netflix Australia", -22.99, "streaming"),
    ("Woolworths Metro", -87.45, "groceries"),
    ("Spotify", -12.99, "streaming"),
    ("AGL Energy", -145.60, "utilities"),
    ("Salary Credit", 4200.00, "income"),
    ("ALDI Supermarkets", -63.20, "groceries"),
    ("Uber Eats", -34.50, "food delivery"),
    ("Optus Mobile", -55.00, "phone"),
    ("Amazon Prime", -9.99, "streaming"),
    ("Coles Supermarkets", -112.30, "groceries"),
    ("PayPal Netflix", -22.99, "streaming"),
    ("Adobe Creative Cloud", -87.49, "software"),
    ("Transfer from Savings", 500.00, "transfer"),
    ("ATM Withdrawal", -200.00, "cash"),
    ("eBay Purchase", -45.00, "shopping"),
    ("Afterpay", -60.00, "shopping"),
    ("McDonald's", -14.80, "food"),
    ("Petrol Station", -78.40, "transport"),
    ("Fitness First", -79.95, "fitness"),
    ("Harvey Norman", -299.00, "shopping"),
]

UK_TRANSACTIONS = [
    ("Netflix", -17.99, "streaming"),
    ("Tesco Superstore", -92.45, "groceries"),
    ("Spotify", -11.99, "streaming"),
    ("British Gas DD", -112.00, "utilities"),
    ("Salary Payment", 3500.00, "income"),
    ("Sainsburys", -67.30, "groceries"),
    ("Amazon Prime", -8.99, "streaming"),
    ("EDF Energy DD", -98.50, "utilities"),
    ("Vodafone DD", -45.00, "phone"),
    ("ASOS", -78.00, "shopping"),
    ("Marks Spencer", -55.20, "groceries"),
    ("Disney Plus", -7.99, "streaming"),
    ("TfL Travel", -45.00, "transport"),
    ("HMRC Tax Credits", 250.00, "government"),
    ("Gym Membership DD", -34.99, "fitness"),
    ("Costa Coffee", -12.80, "food"),
    ("Amazon DD", -14.99, "shopping"),
    ("Council Tax DD", -165.00, "utilities"),
    ("John Lewis", -120.00, "shopping"),
    ("Boots", -28.50, "health"),
]

US_TRANSACTIONS = [
    ("Netflix.com", -15.49, "streaming"),
    ("Walmart Supercenter", -124.67, "groceries"),
    ("Spotify USA", -10.99, "streaming"),
    ("ComEd Electric", -98.43, "utilities"),
    ("Direct Deposit Payroll", 4800.00, "income"),
    ("Whole Foods Market", -87.32, "groceries"),
    ("Amazon Prime", -14.99, "streaming"),
    ("T-Mobile AutoPay", -65.00, "phone"),
    ("Hulu", -17.99, "streaming"),
    ("Target", -156.23, "shopping"),
    ("Starbucks", -23.45, "food"),
    ("Chevron Gas Station", -68.90, "transport"),
    ("Planet Fitness", -24.99, "fitness"),
    ("Chase Overdraft Fee", -34.00, "bank fee"),
    ("Zelle Transfer", 200.00, "transfer"),
    ("Instacart", -112.50, "groceries"),
    ("Apple.com/bill", -9.99, "streaming"),
    ("AT&T Wireless", -85.00, "phone"),
    ("Disney Plus", -13.99, "streaming"),
    ("Costco Wholesale", -210.45, "groceries"),
]

CA_TRANSACTIONS = [
    ("Netflix Canada", -16.99, "streaming"),
    ("Loblaws", -134.56, "groceries"),
    ("Spotify Canada", -10.99, "streaming"),
    ("Enbridge Gas", -112.40, "utilities"),
    ("Payroll Deposit", 4100.00, "income"),
    ("Metro Grocery", -89.20, "groceries"),
    ("Amazon Prime CA", -9.99, "streaming"),
    ("Rogers Wireless", -95.00, "phone"),
    ("Crave TV", -19.99, "streaming"),
    ("Canadian Tire", -78.50, "shopping"),
    ("Tim Hortons", -18.50, "food"),
    ("Petro-Canada", -78.30, "transport"),
    ("GoodLife Fitness", -49.99, "fitness"),
    ("LCBO", -45.00, "shopping"),
    ("E-Transfer Received", 300.00, "transfer"),
    ("Sobeys", -92.40, "groceries"),
    ("Apple iTunes CA", -12.99, "streaming"),
    ("Bell Canada DD", -89.00, "phone"),
    ("Disney Plus CA", -11.99, "streaming"),
    ("Costco Canada", -230.80, "groceries"),
]


def random_transactions(pool, count=15, start_date=None, shuffle=True):
    if start_date is None:
        start_date = date(2024, 3, 1)
    txns = pool[:count] if not shuffle else random.sample(pool, min(count, len(pool)))
    result = []
    d = start_date
    for tx in txns:
        d += timedelta(days=random.randint(1, 3))
        result.append((d, tx[0], tx[1]))
    result.sort(key=lambda x: x[0])
    return result


# ── Helpers ──────────────────────────────────────────────────────────────────

def styles():
    s = getSampleStyleSheet()
    return s


def _doc(path, pagesize=A4):
    return SimpleDocTemplate(
        path,
        pagesize=pagesize,
        leftMargin=1.5*cm,
        rightMargin=1.5*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )


def _para(text, font="Helvetica", size=9, color=colors.black, align=TA_LEFT):
    style = ParagraphStyle(
        "custom",
        fontName=font,
        fontSize=size,
        textColor=color,
        alignment=align,
        leading=size * 1.4,
    )
    return Paragraph(text, style)


def _money(amount, symbol="$"):
    if amount < 0:
        return f"{symbol}{abs(amount):,.2f}"
    return f"{symbol}{amount:,.2f}"


def _table_style(header_bg=colors.HexColor("#003087"), header_fg=colors.white,
                 row_alt=colors.HexColor("#f5f5f5")):
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), header_bg),
        ("TEXTCOLOR", (0, 0), (-1, 0), header_fg),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, row_alt]),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ])


# ── ANZ Australia ─────────────────────────────────────────────────────────────

def gen_anz_au(path, stmt_num=1):
    """ANZ AU: Date | Transaction Details | Withdrawals ($) | Deposits ($) | Balance ($)
    Date shown as DD MMM, year printed once at top of Date column.
    """
    txns = random_transactions(AU_TRANSACTIONS, count=16, start_date=date(2024, 3 + stmt_num, 1))
    doc = _doc(path)
    elems = []
    s = styles()

    # Header
    elems.append(_para("ANZ Bank", "Helvetica-Bold", 20, colors.HexColor("#007DBA")))
    elems.append(_para("Bank Statement", "Helvetica", 12, colors.HexColor("#555555")))
    elems.append(Spacer(1, 0.3*cm))

    # Account info table
    period_end = txns[-1][0]
    period_start = txns[0][0]
    acct_data = [
        ["Account Name:", f"JOHN SMITH", "BSB / Account:", "012-345 / 123456789"],
        ["Account Type:", "Everyday Account", "Statement Period:", f"{period_start.strftime('%d %b %Y')} to {period_end.strftime('%d %b %Y')}"],
        ["Currency:", "AUD", "Statement Number:", str(stmt_num)],
    ]
    acct_tbl = Table(acct_data, colWidths=[3.5*cm, 6*cm, 3.5*cm, 5*cm])
    acct_tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(acct_tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#007DBA")))
    elems.append(Spacer(1, 0.3*cm))

    # Transaction table
    year_label = f"{txns[0][0].year}"
    headers = [f"Date\n({year_label})", "Transaction Details", "Withdrawals ($)", "Deposits ($)", "Balance ($)"]
    rows = [headers]

    balance = 3240.50 + (stmt_num * 100)
    for txn_date, desc, amount in txns:
        if amount < 0:
            withdraw = f"{abs(amount):,.2f}"
            deposit = ""
        else:
            withdraw = ""
            deposit = f"{amount:,.2f}"
        balance += amount
        rows.append([
            txn_date.strftime("%d %b"),
            desc,
            withdraw,
            deposit,
            f"{balance:,.2f}",
        ])

    col_widths = [2*cm, 8*cm, 3*cm, 3*cm, 3*cm]
    tbl = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#007DBA"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    tbl.setStyle(style)
    elems.append(tbl)
    elems.append(Spacer(1, 0.3*cm))
    elems.append(_para(
        f"Closing Balance: ${balance:,.2f} AUD",
        "Helvetica-Bold", 10, colors.HexColor("#007DBA")
    ))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para(
        "ANZ Bank — whereismymoneygo.com test statement. Not for real financial use.",
        "Helvetica", 7, colors.gray
    ))

    doc.build(elems)
    print(f"  ✓ {path}")


# ── ANZ New Zealand ──────────────────────────────────────────────────────────

def gen_anz_nz(path, stmt_num=1):
    """ANZ NZ: Date | Transaction type and details | Withdrawals | Deposits | Balance
    Date: DD/MM/YYYY. Account format: XX-XXXX-XXXXXXX-XX
    """
    txns = random_transactions(AU_TRANSACTIONS, count=15, start_date=date(2024, 2 + stmt_num, 1))
    doc = _doc(path)
    elems = []

    elems.append(_para("ANZ New Zealand", "Helvetica-Bold", 20, colors.HexColor("#007DBA")))
    elems.append(_para("Account Statement", "Helvetica", 12, colors.HexColor("#555555")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Holder:", "JANE WILLIAMS", "Account Number:", f"01-1839-{8765432 + stmt_num * 10:07d}-00"],
        ["Statement Period:", f"{period_start.strftime('%d/%m/%Y')} to {period_end.strftime('%d/%m/%Y')}", "Currency:", "NZD"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 6*cm, 3.5*cm, 5*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#007DBA")))
    elems.append(Spacer(1, 0.3*cm))

    headers = ["Date", "Transaction type and details", "Withdrawals", "Deposits", "Balance"]
    rows = [headers]
    balance = 4820.30 + stmt_num * 150
    for txn_date, desc, amount in txns:
        balance += amount
        rows.append([
            txn_date.strftime("%d/%m/%Y"),
            desc,
            f"{abs(amount):,.2f}" if amount < 0 else "",
            f"{amount:,.2f}" if amount >= 0 else "",
            f"{balance:,.2f}",
        ])

    col_widths = [2.8*cm, 8*cm, 2.8*cm, 2.8*cm, 2.8*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#007DBA"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))
    elems.append(_para(f"Closing Balance: NZD {balance:,.2f}", "Helvetica-Bold", 10, colors.HexColor("#007DBA")))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("ANZ New Zealand — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── CommBank ─────────────────────────────────────────────────────────────────

def gen_commbank(path, stmt_num=1):
    """CommBank: Date | Transaction | Debit | Credit | Balance
    Date: DD MMM (year in header). Balance has CR/DR suffix.
    """
    txns = random_transactions(AU_TRANSACTIONS, count=15, start_date=date(2024, 1 + stmt_num, 1))
    doc = _doc(path)
    elems = []

    elems.append(_para("Commonwealth Bank", "Helvetica-Bold", 20, colors.HexColor("#FFCC00"), align=TA_LEFT))
    elems.append(_para("of Australia", "Helvetica", 14, colors.HexColor("#000000")))
    elems.append(Spacer(1, 0.2*cm))
    elems.append(_para("Statement of Account", "Helvetica-Bold", 12))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Name:", "MICHAEL JONES", "BSB:", "062-000"],
        ["Account Number:", f"1234567{stmt_num}", "Account Number:", f"9876543{stmt_num}"],
        ["Statement Period:", f"{period_start.strftime('%d %b %Y')} to {period_end.strftime('%d %b %Y')}", "Year:", str(period_start.year)],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5.5*cm, 3*cm, 6*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#FFCC00")))
    elems.append(Spacer(1, 0.3*cm))

    headers = ["Date", "Transaction", "Debit", "Credit", "Balance"]
    rows = [headers]
    balance = 2850.00 + stmt_num * 200
    for txn_date, desc, amount in txns:
        balance += amount
        bal_suffix = "CR" if balance >= 0 else "DR"
        rows.append([
            txn_date.strftime("%d %b"),
            desc,
            f"{abs(amount):,.2f}" if amount < 0 else "",
            f"{amount:,.2f}" if amount >= 0 else "",
            f"{abs(balance):,.2f} {bal_suffix}",
        ])

    col_widths = [2*cm, 8.5*cm, 2.5*cm, 2.5*cm, 3.5*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#333333"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))
    bal_suffix = "CR" if balance >= 0 else "DR"
    elems.append(_para(
        f"Closing Balance: ${abs(balance):,.2f} {bal_suffix}",
        "Helvetica-Bold", 10, colors.black
    ))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("Commonwealth Bank — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── Westpac ──────────────────────────────────────────────────────────────────

def gen_westpac(path, stmt_num=1):
    """Westpac: DATE | TRANSACTION DESCRIPTION | DEBIT | CREDIT | BALANCE
    Date: DD/MM/YY. All-caps column headers.
    """
    txns = random_transactions(AU_TRANSACTIONS, count=16, start_date=date(2024, 2 + stmt_num, 1))
    doc = _doc(path)
    elems = []

    elems.append(_para("Westpac", "Helvetica-Bold", 22, colors.HexColor("#D5001C")))
    elems.append(_para("Banking Corporation", "Helvetica", 12, colors.HexColor("#555555")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Name:", "SARAH THOMPSON", "BSB Number:", "032-001"],
        ["Account Number:", f"23456789{stmt_num}", "Statement:", f"From {period_start.strftime('%d %b %Y')} to {period_end.strftime('%d %b %Y')}"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5.5*cm, 3*cm, 6*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#D5001C")))
    elems.append(Spacer(1, 0.3*cm))

    headers = ["DATE", "TRANSACTION DESCRIPTION", "DEBIT", "CREDIT", "BALANCE"]
    rows = [headers]
    balance = 5100.75 + stmt_num * 300
    for txn_date, desc, amount in txns:
        balance += amount
        rows.append([
            txn_date.strftime("%d/%m/%y"),
            desc,
            f"{abs(amount):,.2f}" if amount < 0 else "",
            f"{amount:,.2f}" if amount >= 0 else "",
            f"{balance:,.2f}",
        ])

    col_widths = [2.2*cm, 8*cm, 2.8*cm, 2.8*cm, 3.2*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#D5001C"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))
    elems.append(_para(f"Closing Balance: ${balance:,.2f}", "Helvetica-Bold", 10, colors.HexColor("#D5001C")))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("Westpac Banking Corporation — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── NAB ──────────────────────────────────────────────────────────────────────

def gen_nab(path, stmt_num=1):
    """NAB: Date | Particulars | Debits ($) | Credits ($) | Balance ($)
    Date: DD MMM YYYY. First row is 'Brought forward'.
    """
    txns = random_transactions(AU_TRANSACTIONS, count=15, start_date=date(2024, 1 + stmt_num, 1))
    doc = _doc(path)
    elems = []

    elems.append(_para("National Australia Bank", "Helvetica-Bold", 20, colors.HexColor("#E31837")))
    elems.append(_para("Account Statement", "Helvetica", 12, colors.HexColor("#555555")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Name:", "DAVID CHEN", "BSB:", "083-004"],
        ["Account Number:", f"345678901{stmt_num}", "Statement Period:", f"{period_start.strftime('%d %b %Y')} to {period_end.strftime('%d %b %Y')}"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5.5*cm, 3*cm, 6*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#E31837")))
    elems.append(Spacer(1, 0.3*cm))

    headers = ["Date", "Particulars", "Debits ($)", "Credits ($)", "Balance ($)"]
    balance = 6200.00 + stmt_num * 400
    rows = [
        headers,
        [period_start.strftime("%d %b %Y"), "Brought forward", "", "", f"{balance:,.2f}"],
    ]
    for txn_date, desc, amount in txns:
        balance += amount
        rows.append([
            txn_date.strftime("%d %b %Y"),
            desc,
            f"{abs(amount):,.2f}" if amount < 0 else "",
            f"{amount:,.2f}" if amount >= 0 else "",
            f"{balance:,.2f}",
        ])

    col_widths = [2.8*cm, 7.5*cm, 2.7*cm, 2.7*cm, 3.3*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#E31837"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    # Highlight the 'Brought forward' row
    style.add("FONTNAME", (0, 1), (-1, 1), "Helvetica-Oblique")
    style.add("TEXTCOLOR", (0, 1), (-1, 1), colors.HexColor("#666666"))
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))
    elems.append(_para(f"Closing Balance: ${balance:,.2f}", "Helvetica-Bold", 10, colors.HexColor("#E31837")))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("National Australia Bank — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── Chase US ─────────────────────────────────────────────────────────────────

def gen_chase(path, stmt_num=1):
    """Chase Checking: DATE | DESCRIPTION | AMOUNT | BALANCE
    Date: MM/DD. Transactions grouped by type. Negative amounts for debits.
    """
    txns = random_transactions(US_TRANSACTIONS, count=16, start_date=date(2024, 1 + stmt_num, 1))
    doc = _doc(path, pagesize=letter)
    elems = []

    elems.append(_para("CHASE", "Helvetica-Bold", 24, colors.HexColor("#117ACA")))
    elems.append(_para("JPMorgan Chase Bank, N.A.", "Helvetica", 10, colors.HexColor("#555555")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account:", "Chase Total Checking®", "Statement Period:"],
        ["Account Number:", f"**** **** {1234 + stmt_num}", f"{period_start.strftime('%m/%d/%Y')} through {period_end.strftime('%m/%d/%Y')}"],
        ["Customer:", "EMILY JOHNSON", ""],
    ]
    tbl = Table(acct_data, colWidths=[4*cm, 7*cm, 7*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#117ACA")))
    elems.append(Spacer(1, 0.3*cm))

    # Separate into debits/credits sections (Chase groups by type)
    deposits = [(d, desc, amt) for d, desc, amt in txns if amt > 0]
    withdrawals = [(d, desc, amt) for d, desc, amt in txns if amt < 0]

    balance = 3450.00 + stmt_num * 250
    opening = balance

    elems.append(_para("TRANSACTION DETAIL", "Helvetica-Bold", 10))
    elems.append(Spacer(1, 0.2*cm))

    # Deposits section
    elems.append(_para("Deposits and Additions", "Helvetica-Bold", 9, colors.HexColor("#117ACA")))
    headers = ["DATE", "DESCRIPTION", "AMOUNT", "BALANCE"]
    rows = [headers]
    for txn_date, desc, amount in deposits:
        balance += amount
        rows.append([txn_date.strftime("%m/%d"), desc, f"+{amount:,.2f}", f"{balance:,.2f}"])
    col_widths = [1.8*cm, 10*cm, 3*cm, 3*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#117ACA"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))

    # Withdrawals section
    elems.append(_para("ATM & Debit Card Withdrawals", "Helvetica-Bold", 9, colors.HexColor("#117ACA")))
    rows = [headers]
    for txn_date, desc, amount in withdrawals:
        balance += amount
        rows.append([txn_date.strftime("%m/%d"), desc, f"{amount:,.2f}", f"{balance:,.2f}"])
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#117ACA"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))
    elems.append(_para(f"Ending Balance: ${balance:,.2f}", "Helvetica-Bold", 10, colors.HexColor("#117ACA")))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("JPMorgan Chase Bank — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── Bank of America ──────────────────────────────────────────────────────────

def gen_boa(path, stmt_num=1):
    """BoA: Date | Description | Amount  (single amount col, negatives for debits)
    Organized into sections: Deposits, Withdrawals.
    """
    txns = random_transactions(US_TRANSACTIONS, count=16, start_date=date(2024, 2 + stmt_num, 1))
    doc = _doc(path, pagesize=letter)
    elems = []

    elems.append(_para("Bank of America", "Helvetica-Bold", 20, colors.HexColor("#E31837")))
    elems.append(_para("Your Statement of Account", "Helvetica", 11, colors.HexColor("#333333")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Number:", f"****{5678 + stmt_num}", "Statement Period:", f"{period_start.strftime('%m/%d/%Y')} to {period_end.strftime('%m/%d/%Y')}"],
        ["Customer:", "ROBERT MARTINEZ", "Account Type:", "Advantage Plus Banking"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5*cm, 3.5*cm, 6*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#E31837")))
    elems.append(Spacer(1, 0.3*cm))

    deposits = [(d, desc, amt) for d, desc, amt in txns if amt > 0]
    withdrawals = [(d, desc, amt) for d, desc, amt in txns if amt < 0]

    balance = 4200.00 + stmt_num * 350

    def section_table(rows_data, col_widths):
        headers = ["Date", "Description", "Amount"]
        rows = [headers] + rows_data
        t = Table(rows, colWidths=col_widths, repeatRows=1)
        style = _table_style(colors.HexColor("#E31837"), colors.white)
        style.add("ALIGN", (2, 0), (2, -1), "RIGHT")
        t.setStyle(style)
        return t

    elems.append(_para("Deposits and other additions", "Helvetica-Bold", 10))
    elems.append(Spacer(1, 0.15*cm))
    dep_rows = []
    for txn_date, desc, amount in deposits:
        balance += amount
        dep_rows.append([txn_date.strftime("%m/%d/%y"), desc, f"+{amount:,.2f}"])
    elems.append(section_table(dep_rows, [2.5*cm, 11*cm, 3*cm]))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(_para("Withdrawals and other subtractions", "Helvetica-Bold", 10))
    elems.append(Spacer(1, 0.15*cm))
    wd_rows = []
    for txn_date, desc, amount in withdrawals:
        balance += amount
        wd_rows.append([txn_date.strftime("%m/%d/%y"), desc, f"-{abs(amount):,.2f}"])
    elems.append(section_table(wd_rows, [2.5*cm, 11*cm, 3*cm]))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(_para(f"Ending Balance: ${balance:,.2f}", "Helvetica-Bold", 10, colors.HexColor("#E31837")))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("Bank of America — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── Barclays UK ──────────────────────────────────────────────────────────────

def gen_barclays(path, stmt_num=1):
    """Barclays: Date | Description | Money out | Money in | Balance
    Date printed only for first transaction of each day (blank thereafter).
    """
    txns = random_transactions(UK_TRANSACTIONS, count=16, start_date=date(2024, 2 + stmt_num, 1))
    doc = _doc(path)
    elems = []

    elems.append(_para("Barclays", "Helvetica-Bold", 22, colors.HexColor("#00AEEF")))
    elems.append(_para("Bank Account Statement", "Helvetica", 11, colors.HexColor("#555555")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Name:", "SOPHIE ANDERSON", "Sort Code:", f"20-{30 + stmt_num:02d}-{50 + stmt_num:02d}"],
        ["Account Number:", f"8765432{stmt_num}", "Period:", f"{period_start.strftime('%d %b')} to {period_end.strftime('%d %b %Y')}"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5.5*cm, 3*cm, 6*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#00AEEF")))
    elems.append(Spacer(1, 0.3*cm))

    headers = ["Date", "Description", "Money out", "Money in", "Balance"]
    rows = [headers]
    balance = 1850.00 + stmt_num * 200
    seen_dates = set()
    for txn_date, desc, amount in txns:
        date_str = txn_date.strftime("%d %b")
        if txn_date in seen_dates:
            date_str = ""  # Barclays: date only on first txn of the day
        else:
            seen_dates.add(txn_date)
        balance += amount
        rows.append([
            date_str,
            desc,
            f"£{abs(amount):,.2f}" if amount < 0 else "",
            f"£{amount:,.2f}" if amount >= 0 else "",
            f"£{balance:,.2f}",
        ])

    col_widths = [2*cm, 8.5*cm, 2.8*cm, 2.8*cm, 3*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#00AEEF"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))
    elems.append(_para(f"Balance: £{balance:,.2f}", "Helvetica-Bold", 10, colors.HexColor("#00AEEF")))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("Barclays Bank PLC — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── HSBC UK ──────────────────────────────────────────────────────────────────

def gen_hsbc(path, stmt_num=1):
    """HSBC UK: Date | Payment type and details | Paid out | Paid in | Balance
    Date: DD MMM YY. Overdrawn balances use 'D' suffix (not minus).
    """
    txns = random_transactions(UK_TRANSACTIONS, count=15, start_date=date(2024, 3 + stmt_num, 1))
    doc = _doc(path)
    elems = []

    elems.append(_para("HSBC", "Helvetica-Bold", 24, colors.HexColor("#DB0011")))
    elems.append(_para("UK Bank • Statement of Account", "Helvetica", 11, colors.HexColor("#333333")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Holder:", "JAMES WILSON", "Sort Code:", f"40-{12 + stmt_num:02d}-{34 + stmt_num:02d}"],
        ["Account Number:", f"9876543{stmt_num}", "Period:", f"{period_start.strftime('%d %b %y')} to {period_end.strftime('%d %b %y')}"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5.5*cm, 3*cm, 6*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#DB0011")))
    elems.append(Spacer(1, 0.3*cm))

    headers = ["Date", "Payment type and details", "Paid out", "Paid in", "Balance"]
    rows = [headers]
    balance = 2300.00 + stmt_num * 150
    type_prefixes = {"streaming": "DD", "groceries": "VIS", "utilities": "DDR", "income": "BGC",
                     "phone": "DDR", "shopping": "VIS", "transport": "VIS", "fitness": "DDR", "government": "BGC"}
    for txn_date, desc, amount in txns:
        prefix = type_prefixes.get("shopping", "VIS")
        balance += amount
        if balance < 0:
            bal_str = f"£{abs(balance):,.2f} D"
        else:
            bal_str = f"£{balance:,.2f}"
        rows.append([
            txn_date.strftime("%d %b %y"),
            f"{prefix} {desc}",
            f"£{abs(amount):,.2f}" if amount < 0 else "",
            f"£{amount:,.2f}" if amount >= 0 else "",
            bal_str,
        ])

    col_widths = [2.2*cm, 8.5*cm, 2.7*cm, 2.7*cm, 3*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#DB0011"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))
    elems.append(_para(f"Closing Balance: £{abs(balance):,.2f}{'D' if balance < 0 else ''}", "Helvetica-Bold", 10, colors.HexColor("#DB0011")))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("HSBC UK — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── TD Bank Canada ────────────────────────────────────────────────────────────

def gen_td_ca(path, stmt_num=1):
    """TD Canada: Description | Withdrawals | Deposits | Date | Balance (unusual column order!)
    Date: MMM DD format. Year in header. First row: BALANCE FORWARD.
    """
    txns = random_transactions(CA_TRANSACTIONS, count=15, start_date=date(2024, 1 + stmt_num, 1))
    doc = _doc(path)
    elems = []

    elems.append(_para("TD Canada Trust", "Helvetica-Bold", 20, colors.HexColor("#34B233")))
    elems.append(_para("Personal Chequing Account Statement", "Helvetica", 11, colors.HexColor("#333333")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Holder:", "LISA NGUYEN", "Account:", f"5{stmt_num:02d}4-{98765 + stmt_num:05d}"],
        ["Statement Period:", f"{period_start.strftime('%b %d, %Y')} – {period_end.strftime('%b %d, %Y')}", "Transit:", f"{5432 + stmt_num}"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5.5*cm, 3*cm, 6*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#34B233")))
    elems.append(Spacer(1, 0.3*cm))

    # TD Canada uses unusual column order: Description | Withdrawals | Deposits | Date | Balance
    headers = ["Description", "Withdrawals", "Deposits", "Date", "Balance"]
    balance = 3780.00 + stmt_num * 200
    rows = [
        headers,
        ["BALANCE FORWARD", "", "", period_start.strftime("%b %d").upper(), f"${balance:,.2f}"],
    ]
    for txn_date, desc, amount in txns:
        balance += amount
        rows.append([
            desc,
            f"${abs(amount):,.2f}" if amount < 0 else "",
            f"${amount:,.2f}" if amount >= 0 else "",
            txn_date.strftime("%b %d").upper(),
            f"${balance:,.2f}",
        ])

    col_widths = [8*cm, 2.8*cm, 2.8*cm, 2*cm, 3.4*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#34B233"), colors.white)
    style.add("ALIGN", (1, 0), (-1, -1), "RIGHT")
    style.add("FONTNAME", (0, 1), (-1, 1), "Helvetica-Oblique")
    style.add("TEXTCOLOR", (0, 1), (-1, 1), colors.HexColor("#666666"))
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))
    elems.append(_para(f"Closing Balance: ${balance:,.2f} CAD", "Helvetica-Bold", 10, colors.HexColor("#34B233")))
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("TD Canada Trust — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── TD Bank US ───────────────────────────────────────────────────────────────

def gen_td_us(path, stmt_num=1):
    """TD US: POSTING DATE | DESCRIPTION | AMOUNT  (no balance column)
    Groups by category. Daily Balance Summary table at end.
    """
    txns = random_transactions(US_TRANSACTIONS, count=15, start_date=date(2024, 2 + stmt_num, 1))
    doc = _doc(path, pagesize=letter)
    elems = []

    elems.append(_para("TD Bank", "Helvetica-Bold", 22, colors.HexColor("#34B233")))
    elems.append(_para("America's Most Convenient Bank®", "Helvetica", 10, colors.HexColor("#555555")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account:", "TD Beyond Checking", "Statement Period:", f"{period_start.strftime('%m/%d/%Y')} to {period_end.strftime('%m/%d/%Y')}"],
        ["Account Number:", f"****{3456 + stmt_num}", "Customer:", "CARLOS RODRIGUEZ"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5.5*cm, 3.5*cm, 5.5*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#34B233")))
    elems.append(Spacer(1, 0.3*cm))

    deposits = [(d, desc, amt) for d, desc, amt in txns if amt > 0]
    withdrawals = [(d, desc, amt) for d, desc, amt in txns if amt < 0]

    headers = ["POSTING DATE", "DESCRIPTION", "AMOUNT"]
    col_widths = [3*cm, 12*cm, 3*cm]

    elems.append(_para("Electronic Deposits", "Helvetica-Bold", 9, colors.HexColor("#34B233")))
    rows = [headers]
    for txn_date, desc, amount in deposits:
        rows.append([txn_date.strftime("%m/%d"), desc, f"+{amount:,.2f}"])
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#34B233"), colors.white)
    style.add("ALIGN", (2, 0), (2, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.3*cm))

    elems.append(_para("Electronic Payments", "Helvetica-Bold", 9, colors.HexColor("#34B233")))
    rows = [headers]
    for txn_date, desc, amount in withdrawals:
        rows.append([txn_date.strftime("%m/%d"), desc, f"{amount:,.2f}"])
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#34B233"), colors.white)
    style.add("ALIGN", (2, 0), (2, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.4*cm))

    # Daily Balance Summary
    elems.append(_para("Daily Balance Summary", "Helvetica-Bold", 9))
    balance = 5100.00 + stmt_num * 300
    bal_rows = [["Date", "Balance"]]
    for txn_date, _, amount in txns:
        balance += amount
        bal_rows.append([txn_date.strftime("%m/%d"), f"${balance:,.2f}"])
    bt = Table(bal_rows, colWidths=[3*cm, 4*cm])
    bt.setStyle(_table_style(colors.HexColor("#34B233"), colors.white))
    bt.hAlign = "LEFT"
    elems.append(bt)
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("TD Bank, N.A. — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── Wells Fargo ──────────────────────────────────────────────────────────────

def gen_wells_fargo(path, stmt_num=1):
    """Wells Fargo: Date | Description | Deposits/Credits | Withdrawals/Debits | Ending daily balance
    Date: MM/DD. Includes Daily Balance Summary at end.
    """
    txns = random_transactions(US_TRANSACTIONS, count=16, start_date=date(2024, 3 + stmt_num, 1))
    doc = _doc(path, pagesize=letter)
    elems = []

    elems.append(_para("Wells Fargo", "Helvetica-Bold", 22, colors.HexColor("#C8102E")))
    elems.append(_para("Everyday Checking", "Helvetica", 12, colors.HexColor("#333333")))
    elems.append(Spacer(1, 0.3*cm))

    period_start = txns[0][0]
    period_end = txns[-1][0]
    acct_data = [
        ["Account Number:", f"****{7890 + stmt_num}", "Statement Period:", f"{period_start.strftime('%m/%d/%Y')} – {period_end.strftime('%m/%d/%Y')}"],
        ["Account Holder:", "ANGELA DAVIS", "Account Type:", "Everyday Checking"],
    ]
    tbl = Table(acct_data, colWidths=[3.5*cm, 5.5*cm, 3.5*cm, 5.5*cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elems.append(tbl)
    elems.append(Spacer(1, 0.4*cm))
    elems.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#C8102E")))
    elems.append(Spacer(1, 0.3*cm))

    headers = ["Date", "Description", "Deposits/\nCredits", "Withdrawals/\nDebits", "Ending daily\nbalance"]
    rows = [headers]
    balance = 2890.00 + stmt_num * 180
    daily_balances = []
    for txn_date, desc, amount in txns:
        balance += amount
        rows.append([
            txn_date.strftime("%m/%d"),
            desc,
            f"{amount:,.2f}" if amount >= 0 else "",
            f"{abs(amount):,.2f}" if amount < 0 else "",
            f"{balance:,.2f}",
        ])
        daily_balances.append((txn_date, balance))

    col_widths = [1.8*cm, 8.5*cm, 2.8*cm, 2.8*cm, 3*cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = _table_style(colors.HexColor("#C8102E"), colors.white)
    style.add("ALIGN", (2, 0), (-1, -1), "RIGHT")
    t.setStyle(style)
    elems.append(t)
    elems.append(Spacer(1, 0.4*cm))

    # Daily Balance Summary
    elems.append(_para("Daily Balance Summary", "Helvetica-Bold", 9))
    elems.append(Spacer(1, 0.1*cm))
    bal_rows = [["Date", "Ending Balance"]]
    for txn_date, bal in daily_balances[::2]:  # Every other day to keep it compact
        bal_rows.append([txn_date.strftime("%m/%d"), f"${bal:,.2f}"])
    bt = Table(bal_rows, colWidths=[3*cm, 4*cm])
    bt.setStyle(_table_style(colors.HexColor("#C8102E"), colors.white))
    bt.hAlign = "LEFT"
    elems.append(bt)
    elems.append(Spacer(1, 0.5*cm))
    elems.append(_para("Wells Fargo Bank, N.A. — test statement only.", "Helvetica", 7, colors.gray))
    doc.build(elems)
    print(f"  ✓ {path}")


# ── Runner ────────────────────────────────────────────────────────────────────

GENERATORS = {
    "anz-au":       (gen_anz_au,    "anz-au"),
    "anz-nz":       (gen_anz_nz,    "anz-nz"),
    "commbank":     (gen_commbank,  "commbank"),
    "westpac":      (gen_westpac,   "westpac"),
    "nab":          (gen_nab,       "nab"),
    "chase":        (gen_chase,     "chase"),
    "bank-of-america": (gen_boa,    "boa"),
    "barclays":     (gen_barclays,  "barclays"),
    "hsbc":         (gen_hsbc,      "hsbc"),
    "td-bank-ca":   (gen_td_ca,     "td-ca"),
    "td-bank-us":   (gen_td_us,     "td-us"),
    "wells-fargo":  (gen_wells_fargo, "wells-fargo"),
}

if __name__ == "__main__":
    random.seed(42)
    for bank_dir, (fn, prefix) in GENERATORS.items():
        out_dir = os.path.join(BASE, "statements", bank_dir)
        os.makedirs(out_dir, exist_ok=True)
        print(f"\n{bank_dir}:")
        for i in range(1, 3):
            out_path = os.path.join(out_dir, f"{prefix}-{i}.pdf")
            fn(out_path, stmt_num=i)

    print("\n✅ All PDFs generated successfully.")
