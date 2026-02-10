"""Improved recurring subscription detection."""

import math
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional
import re


def parse_date(date_str: str) -> Optional[datetime]:
    """Parse various date formats to datetime."""
    if not date_str:
        return None

    date_str = str(date_str).strip()

    # Common date formats
    formats = [
        "%Y-%m-%d",       # 2025-01-15
        "%d/%m/%Y",       # 15/01/2025
        "%m/%d/%Y",       # 01/15/2025
        "%d/%m/%y",       # 15/01/25
        "%m/%d/%y",       # 01/15/25
        "%d-%m-%Y",       # 15-01-2025
        "%d %b %Y",       # 15 Jan 2025
        "%d %B %Y",       # 15 January 2025
        "%b %d, %Y",      # Jan 15, 2025
        "%d %b",          # 15 Jan (assume current year)
        "%d/%m",          # 15/01 (assume current year)
        "%m/%d",          # 01/15 (assume current year)
    ]

    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            # If no year, assume current year
            if parsed.year == 1900:
                parsed = parsed.replace(year=datetime.now().year)
            return parsed
        except ValueError:
            continue

    return None


def detect_subscriptions(transactions: list[dict]) -> list[dict]:
    """
    Detect recurring subscriptions from transaction list.

    Uses:
    - Merchant grouping
    - Monthly periodicity detection (25-35 days)
    - Amount consistency (within 5% or $2)
    - Known subscription keywords

    Returns list of detected subscriptions with:
    - merchant, monthly_cost, annual_cost, confidence, last_date, occurrences
    """
    # Known subscription keywords for high confidence matching
    KNOWN_SUBSCRIPTIONS = [
        "NETFLIX", "SPOTIFY", "HULU", "DISNEY", "HBO", "AMAZON PRIME",
        "APPLE MUSIC", "YOUTUBE", "PARAMOUNT", "PEACOCK", "AUDIBLE",
        "ADOBE", "MICROSOFT 365", "GOOGLE ONE", "DROPBOX", "ICLOUD",
        "PLANET FITNESS", "LA FITNESS", "ANYTIME FITNESS", "EQUINOX",
        "GYM", "FITNESS", "PELOTON",
        "ONLYFANS", "PATREON", "TWITCH",
        "AFTERPAY", "KLARNA", "ZIP PAY", "AFFIRM",
        "HEADSPACE", "CALM", "NOOM",
        "HELLO FRESH", "BLUE APRON",
        "CHATGPT", "CLAUDE", "OPENAI",
        "COMMSEC", "DIRECT DEBIT"
    ]

    # Recurring payment patterns (may have variable amounts)
    RECURRING_PATTERNS = ["DIRECT DEBIT", "BPAY", "AUTOPAY", "AUTO PAY"]

    # Group transactions by normalized merchant
    merchant_groups = defaultdict(list)

    for txn in transactions:
        merchant = txn.get("normalized_merchant") or txn.get("merchant", "")
        if not merchant:
            continue
        merchant_groups[merchant.upper()].append(txn)

    subscriptions = []

    for merchant, txns in merchant_groups.items():
        if len(txns) == 0:
            continue

        # Get amounts and dates (filter out NaN values)
        amounts = [t.get("amount", 0) for t in txns]
        amounts = [a for a in amounts if a is not None and not math.isnan(a)]
        dates = [parse_date(t.get("date", "")) for t in txns]
        dates = [d for d in dates if d is not None]

        if not amounts:
            continue

        avg_amount = sum(amounts) / len(amounts)
        max_amount = max(amounts)
        min_amount = min(amounts)

        # Check if amounts are consistent (within 5% or $2 tolerance)
        amount_variance = max_amount - min_amount
        is_consistent = (
            amount_variance <= 2.0 or
            (avg_amount > 0 and amount_variance / avg_amount <= 0.05)
        )

        # Check for known subscription keywords
        is_known_sub = any(kw in merchant for kw in KNOWN_SUBSCRIPTIONS)

        # Check for recurring payment patterns (more lenient - 15% variance allowed)
        is_recurring_pattern = any(kw in merchant for kw in RECURRING_PATTERNS)
        is_loosely_consistent = (
            amount_variance <= 10.0 or
            (avg_amount > 0 and amount_variance / avg_amount <= 0.15)
        )

        # Check periodicity if we have dates
        is_periodic = False
        avg_interval = 0
        if len(dates) >= 2:
            dates.sort()
            intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
            avg_interval = sum(intervals) / len(intervals) if intervals else 0
            # Monthly: 25-35 days average
            is_periodic = 25 <= avg_interval <= 35

        # Determine if this is a subscription
        confidence = 0.0
        reason = ""

        if is_known_sub:
            confidence = 0.95
            reason = "Known subscription service"
        elif is_recurring_pattern and len(txns) >= 3 and is_periodic:
            confidence = 0.9
            reason = f"Recurring payment: {len(txns)} charges, ~{avg_interval:.0f} days apart"
        elif len(txns) >= 3 and is_consistent and is_periodic:
            confidence = 0.85
            reason = f"Recurring pattern: {len(txns)} charges, ~{avg_interval:.0f} days apart"
        elif is_recurring_pattern and len(txns) >= 3 and is_loosely_consistent:
            confidence = 0.75
            reason = f"Direct debit: {len(txns)} charges of ~${avg_amount:.2f}"
        elif len(txns) >= 2 and is_consistent:
            confidence = 0.7
            reason = f"Consistent amounts: {len(txns)} charges of ~${avg_amount:.2f}"
        elif is_known_sub or (len(txns) == 1 and any(kw in merchant for kw in KNOWN_SUBSCRIPTIONS)):
            confidence = 0.6
            reason = "Known subscription (single charge)"

        # Add if confidence is high enough and amount is valid
        if confidence >= 0.5 and avg_amount > 0 and not math.isnan(avg_amount):
            last_date = max(dates).strftime("%Y-%m-%d") if dates else ""

            subscriptions.append({
                "merchant": merchant,
                "monthly_cost": round(avg_amount, 2),
                "annual_cost": round(avg_amount * 12, 2),
                "confidence": confidence,
                "last_date": last_date,
                "occurrences": len(txns),
                "reason": reason
            })

    # Sort by monthly cost descending
    subscriptions.sort(key=lambda x: x["monthly_cost"], reverse=True)

    return subscriptions


def detect_date_range(transactions: list[dict]) -> tuple[Optional[datetime], Optional[datetime], int]:
    """
    Detect the date range covered by transactions.

    Returns: (start_date, end_date, days_covered)
    """
    dates = []
    for txn in transactions:
        parsed = parse_date(txn.get("date", ""))
        if parsed:
            dates.append(parsed)

    if not dates:
        return None, None, 0

    start_date = min(dates)
    end_date = max(dates)
    days_covered = (end_date - start_date).days

    return start_date, end_date, days_covered


def generate_month_comparison(transactions: list[dict]) -> Optional[dict]:
    """
    Generate month-over-month comparison if data spans > 60 days.

    Returns comparison data or None if insufficient data.
    """
    start_date, end_date, days_covered = detect_date_range(transactions)

    if days_covered < 60:
        return None

    # Group transactions by month
    monthly_data = defaultdict(lambda: {
        "total": 0,
        "count": 0,
        "categories": defaultdict(float)
    })

    for txn in transactions:
        date = parse_date(txn.get("date", ""))
        if not date:
            continue

        month_key = date.strftime("%Y-%m")
        amount = txn.get("amount", 0)
        category = txn.get("category", "Other")

        # Skip income for spending comparison
        if category == "Income":
            continue

        monthly_data[month_key]["total"] += amount
        monthly_data[month_key]["count"] += 1
        monthly_data[month_key]["categories"][category] += amount

    if len(monthly_data) < 2:
        return None

    # Sort months
    sorted_months = sorted(monthly_data.keys())

    # Get last two complete months (or most recent)
    if len(sorted_months) >= 2:
        prev_month = sorted_months[-2]
        curr_month = sorted_months[-1]
    else:
        return None

    prev_data = monthly_data[prev_month]
    curr_data = monthly_data[curr_month]

    # Calculate changes
    total_change = curr_data["total"] - prev_data["total"]
    total_change_pct = (total_change / prev_data["total"] * 100) if prev_data["total"] > 0 else 0

    # Find category changes
    category_changes = []
    all_categories = set(prev_data["categories"].keys()) | set(curr_data["categories"].keys())

    for cat in all_categories:
        prev_amt = prev_data["categories"].get(cat, 0)
        curr_amt = curr_data["categories"].get(cat, 0)
        change = curr_amt - prev_amt
        change_pct = (change / prev_amt * 100) if prev_amt > 0 else (100 if curr_amt > 0 else 0)

        category_changes.append({
            "category": cat,
            "previous": round(prev_amt, 2),
            "current": round(curr_amt, 2),
            "change": round(change, 2),
            "change_percent": round(change_pct, 1)
        })

    # Sort by absolute change
    category_changes.sort(key=lambda x: abs(x["change"]), reverse=True)

    # Detect spikes (> 30% increase)
    spikes = [c for c in category_changes if c["change_percent"] > 30 and c["change"] > 20]

    return {
        "previous_month": prev_month,
        "current_month": curr_month,
        "previous_total": round(prev_data["total"], 2),
        "current_total": round(curr_data["total"], 2),
        "total_change": round(total_change, 2),
        "total_change_percent": round(total_change_pct, 1),
        "top_changes": category_changes[:5],
        "spikes": spikes[:3],
        "months_analyzed": len(sorted_months)
    }


def detect_price_changes(transactions: list[dict]) -> list[dict]:
    """
    Detect subscription price increases over time.

    Looks for merchants with:
    - Multiple transactions at different amounts
    - Later transactions higher than earlier ones
    - Amount change > $1 (to filter out rounding)
    """
    # Group by merchant
    merchant_txns = defaultdict(list)
    for txn in transactions:
        merchant = txn.get("normalized_merchant") or txn.get("merchant", "")
        if not merchant:
            continue
        date = parse_date(txn.get("date", ""))
        amount = txn.get("amount", 0)
        if date and amount > 0 and not math.isnan(amount):
            merchant_txns[merchant.upper()].append({
                "date": date,
                "amount": amount
            })

    price_changes = []

    for merchant, txns in merchant_txns.items():
        if len(txns) < 2:
            continue

        # Sort by date
        txns.sort(key=lambda x: x["date"])

        # Get unique amounts in chronological order
        unique_amounts = []
        last_amount = None
        for t in txns:
            if last_amount is None or abs(t["amount"] - last_amount) > 0.50:
                unique_amounts.append({
                    "amount": t["amount"],
                    "date": t["date"]
                })
                last_amount = t["amount"]

        if len(unique_amounts) < 2:
            continue

        # Check if latest price is higher than earliest
        first = unique_amounts[0]
        last = unique_amounts[-1]

        price_diff = last["amount"] - first["amount"]
        pct_change = (price_diff / first["amount"] * 100) if first["amount"] > 0 else 0

        # Only report significant increases (> $1 or > 5%)
        if price_diff >= 1.0 or pct_change >= 5:
            price_changes.append({
                "merchant": merchant,
                "old_price": round(first["amount"], 2),
                "new_price": round(last["amount"], 2),
                "increase": round(price_diff, 2),
                "percent_change": round(pct_change, 1),
                "first_date": first["date"].strftime("%Y-%m-%d"),
                "latest_date": last["date"].strftime("%Y-%m-%d"),
                "yearly_impact": round(price_diff * 12, 2)
            })

    # Sort by yearly impact
    price_changes.sort(key=lambda x: x["yearly_impact"], reverse=True)
    return price_changes[:10]


def detect_duplicate_subscriptions(subscriptions: list[dict]) -> list[dict]:
    """
    Detect potential duplicate or overlapping subscriptions.

    Groups subscriptions by service category:
    - Multiple streaming services
    - Multiple music services
    - Multiple cloud storage
    - Multiple fitness memberships
    """
    # Category keywords
    CATEGORIES = {
        "streaming": ["NETFLIX", "HULU", "DISNEY", "HBO", "MAX", "PARAMOUNT", "PEACOCK", "APPLE TV", "AMAZON PRIME VIDEO", "STAN", "BINGE"],
        "music": ["SPOTIFY", "APPLE MUSIC", "AMAZON MUSIC", "YOUTUBE MUSIC", "TIDAL", "DEEZER", "PANDORA"],
        "cloud": ["DROPBOX", "GOOGLE ONE", "ICLOUD", "ONEDRIVE", "BOX"],
        "fitness": ["GYM", "FITNESS", "PELOTON", "PLANET FITNESS", "LA FITNESS", "ANYTIME FITNESS", "EQUINOX", "CLASSPASS", "APPLE FITNESS"],
        "food_delivery": ["DOORDASH", "UBER EATS", "GRUBHUB", "POSTMATES", "MENULOG", "DELIVEROO", "JUST EAT"],
        "password_manager": ["1PASSWORD", "LASTPASS", "DASHLANE", "BITWARDEN"],
        "vpn": ["NORDVPN", "EXPRESSVPN", "SURFSHARK", "PRIVATE INTERNET ACCESS"]
    }

    duplicates = []

    # Categorize subscriptions
    categorized = defaultdict(list)

    for sub in subscriptions:
        merchant = sub.get("merchant", "").upper()
        for category, keywords in CATEGORIES.items():
            if any(kw in merchant for kw in keywords):
                categorized[category].append(sub)
                break

    # Find categories with multiple subscriptions
    for category, subs in categorized.items():
        if len(subs) >= 2:
            total_monthly = sum(s.get("monthly_cost", 0) for s in subs)
            total_yearly = total_monthly * 12

            duplicates.append({
                "category": category.replace("_", " ").title(),
                "services": [s.get("merchant", "") for s in subs],
                "count": len(subs),
                "combined_monthly": round(total_monthly, 2),
                "combined_yearly": round(total_yearly, 2),
                "suggestion": _get_duplicate_suggestion(category, subs)
            })

    # Sort by combined yearly cost
    duplicates.sort(key=lambda x: x["combined_yearly"], reverse=True)
    return duplicates


def _get_duplicate_suggestion(category: str, subs: list[dict]) -> str:
    """Generate suggestion for duplicate subscriptions."""
    count = len(subs)

    suggestions = {
        "streaming": f"Consider keeping only 1-2 streaming services and rotating monthly. You have {count} active.",
        "music": f"Most music services have similar catalogs. Pick one favorite and cancel the rest.",
        "cloud": f"Consolidate to one cloud storage provider. {count} services likely means duplicate backups.",
        "fitness": f"You're paying for {count} fitness memberships. Consider keeping only the one you use most.",
        "food_delivery": f"Pick one delivery service for best rewards. {count} services may mean no loyalty benefits.",
        "password_manager": f"One password manager is enough. Using {count} reduces security benefits.",
        "vpn": f"Multiple VPN subscriptions provide no extra benefit. Keep the fastest one."
    }

    return suggestions.get(category, f"Consider consolidating these {count} similar services.")
