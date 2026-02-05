"""Spending analyzer with heuristic detection and Claude enhancement."""

from collections import defaultdict
from typing import Optional
from claude_client import get_claude_analysis


# Fee-related keywords
FEE_KEYWORDS = [
    "FEE", "CHARGE", "FX", "OVERDRAFT", "SERVICE", "ATM", "MAINTENANCE",
    "FOREIGN TRANSACTION", "MONTHLY FEE", "ANNUAL FEE", "LATE FEE",
    "INTEREST CHARGE", "FINANCE CHARGE"
]

# Food delivery services
FOOD_DELIVERY_KEYWORDS = [
    "UBER EATS", "UBEREATS", "DOORDASH", "MENULOG", "DELIVEROO",
    "GRUBHUB", "POSTMATES", "CAVIAR", "SEAMLESS", "JUST EAT",
    "SKIP THE DISHES", "INSTACART", "GOPUFF"
]

# Known subscription services
SUBSCRIPTION_KEYWORDS = [
    "NETFLIX", "SPOTIFY", "HULU", "DISNEY", "HBO", "AMAZON PRIME",
    "APPLE MUSIC", "YOUTUBE", "PARAMOUNT", "PEACOCK", "AUDIBLE",
    "ADOBE", "MICROSOFT 365", "GOOGLE ONE", "DROPBOX", "ICLOUD",
    "PLANET FITNESS", "LA FITNESS", "ANYTIME FITNESS", "EQUINOX",
    "CROSSFIT", "PELOTON", "BEACHBODY", "GYM"
]

# Keywords that indicate non-transaction entries
EXCLUDE_KEYWORDS = [
    "BALANCE", "TOTAL", "OPENING", "CLOSING", "BROUGHT FORWARD",
    "CARRIED FORWARD", "AVAILABLE", "PENDING", "CREDIT LIMIT"
]


def _filter_transactions(transactions: list[dict]) -> list[dict]:
    """Filter out invalid or unrealistic transactions."""
    filtered = []

    for t in transactions:
        amount = t.get("amount", 0)
        merchant = t.get("merchant", "").upper()

        # Skip zero or negative amounts
        if amount <= 0:
            continue

        # Skip entries that look like balance/summary lines
        if any(kw in merchant for kw in EXCLUDE_KEYWORDS):
            continue

        # Skip if merchant name is too short or just numbers
        if len(merchant) < 2 or merchant.replace(" ", "").isdigit():
            continue

        filtered.append(t)

    return filtered


def analyze_transactions(transactions: list[dict], use_claude: bool = True) -> dict:
    """
    Analyze transactions for spending leaks.

    Args:
        transactions: List of parsed transactions
        use_claude: Whether to enhance with Claude API

    Returns:
        Analysis results dict
    """
    if not transactions:
        return _empty_result()

    # Filter out unrealistic transactions
    transactions = _filter_transactions(transactions)

    if not transactions:
        return _empty_result()

    # Run heuristic analysis
    heuristic_results = _heuristic_analysis(transactions)

    # Enhance with Claude if enabled
    if use_claude:
        claude_enhancements = get_claude_analysis(transactions, heuristic_results)
        if claude_enhancements:
            heuristic_results = _merge_results(heuristic_results, claude_enhancements)

    return heuristic_results


def _empty_result() -> dict:
    """Return empty analysis result."""
    return {
        "monthly_leak": 0,
        "annual_savings": 0,
        "top_leaks": [],
        "easy_wins": [],
        "recovery_plan": [
            "Upload your bank statement to get started",
            "We'll analyze your spending patterns",
            "Get personalized recommendations to save money"
        ],
        "disclaimer": "This analysis is for informational purposes only. Not financial advice."
    }


def _heuristic_analysis(transactions: list[dict]) -> dict:
    """Run heuristic-based spending analysis."""

    # Group transactions by merchant
    merchant_data = defaultdict(lambda: {"transactions": [], "total": 0})
    for t in transactions:
        merchant = t["merchant"]
        merchant_data[merchant]["transactions"].append(t)
        merchant_data[merchant]["total"] += t["amount"]

    top_leaks = []
    total_leak = 0

    # Detect subscriptions (recurring similar amounts)
    subscriptions = _detect_subscriptions(merchant_data)
    for sub in subscriptions:
        top_leaks.append(sub)
        total_leak += sub["monthly_cost"]

    # Detect fees
    fees = _detect_fees(merchant_data)
    for fee in fees:
        top_leaks.append(fee)
        total_leak += fee["monthly_cost"]

    # Detect food delivery spending
    food_delivery = _detect_food_delivery(merchant_data)
    for fd in food_delivery:
        top_leaks.append(fd)
        total_leak += fd["monthly_cost"]

    # Detect micro leaks
    micro_leaks = _detect_micro_leaks(merchant_data)
    for ml in micro_leaks:
        top_leaks.append(ml)
        total_leak += ml["monthly_cost"]

    # Sort by monthly cost
    top_leaks.sort(key=lambda x: x["monthly_cost"], reverse=True)

    # Generate easy wins
    easy_wins = _generate_easy_wins(top_leaks, merchant_data)

    # Generate recovery plan
    recovery_plan = _generate_recovery_plan(top_leaks, total_leak)

    return {
        "monthly_leak": round(total_leak, 2),
        "annual_savings": round(total_leak * 12, 2),
        "top_leaks": top_leaks[:10],  # Top 10 leaks
        "easy_wins": easy_wins[:5],    # Top 5 easy wins
        "recovery_plan": recovery_plan,
        "disclaimer": "This analysis is for informational purposes only. Not financial advice."
    }


def _detect_subscriptions(merchant_data: dict) -> list[dict]:
    """Detect subscription patterns."""
    subscriptions = []

    for merchant, data in merchant_data.items():
        txns = data["transactions"]

        # Check for known subscription services
        is_known_sub = any(kw in merchant for kw in SUBSCRIPTION_KEYWORDS)

        # Check for recurring pattern (2+ transactions with similar amounts)
        if len(txns) >= 2:
            amounts = [t["amount"] for t in txns]
            avg_amount = sum(amounts) / len(amounts)

            # Check if amounts are consistent (within 10%)
            consistent = all(abs(a - avg_amount) / avg_amount < 0.1 for a in amounts if avg_amount > 0)

            if is_known_sub or (consistent and len(txns) >= 2):
                monthly_cost = avg_amount
                subscriptions.append({
                    "category": "Subscription",
                    "merchant": merchant,
                    "monthly_cost": round(monthly_cost, 2),
                    "yearly_cost": round(monthly_cost * 12, 2),
                    "explanation": f"Recurring charge: {len(txns)} payments averaging ${avg_amount:.2f}"
                })

    return subscriptions


def _detect_fees(merchant_data: dict) -> list[dict]:
    """Detect bank fees and charges."""
    fees = []

    for merchant, data in merchant_data.items():
        if any(kw in merchant for kw in FEE_KEYWORDS):
            txns = data["transactions"]
            monthly_cost = data["total"] / max(1, _estimate_months(txns))
            fees.append({
                "category": "Fees & Charges",
                "merchant": merchant,
                "monthly_cost": round(monthly_cost, 2),
                "yearly_cost": round(monthly_cost * 12, 2),
                "explanation": f"Bank/service fees: {len(txns)} charges totaling ${data['total']:.2f}"
            })

    return fees


def _detect_food_delivery(merchant_data: dict) -> list[dict]:
    """Detect food delivery spending."""
    food_delivery = []

    for merchant, data in merchant_data.items():
        if any(kw in merchant for kw in FOOD_DELIVERY_KEYWORDS):
            txns = data["transactions"]
            monthly_cost = data["total"] / max(1, _estimate_months(txns))
            food_delivery.append({
                "category": "Food Delivery",
                "merchant": merchant,
                "monthly_cost": round(monthly_cost, 2),
                "yearly_cost": round(monthly_cost * 12, 2),
                "explanation": f"Food delivery: {len(txns)} orders totaling ${data['total']:.2f}"
            })

    return food_delivery


def _detect_micro_leaks(merchant_data: dict) -> list[dict]:
    """Detect micro transactions that add up."""
    micro_leaks = []

    for merchant, data in merchant_data.items():
        txns = data["transactions"]
        amounts = [t["amount"] for t in txns]
        avg_amount = sum(amounts) / len(amounts) if amounts else 0

        # Micro leak: average under $10 but 10+ transactions
        if avg_amount < 10 and len(txns) >= 10:
            monthly_cost = data["total"] / max(1, _estimate_months(txns))
            micro_leaks.append({
                "category": "Micro Leaks",
                "merchant": merchant,
                "monthly_cost": round(monthly_cost, 2),
                "yearly_cost": round(monthly_cost * 12, 2),
                "explanation": f"Small purchases adding up: {len(txns)} transactions, ${avg_amount:.2f} average"
            })

    return micro_leaks


def _estimate_months(transactions: list[dict]) -> int:
    """Estimate number of months covered by transactions."""
    # Simple heuristic: assume data covers about 3 months if we can't parse dates
    return 3


def _generate_easy_wins(top_leaks: list[dict], merchant_data: dict) -> list[dict]:
    """Generate actionable easy wins."""
    easy_wins = []

    for leak in top_leaks:
        category = leak["category"]
        merchant = leak["merchant"]
        yearly = leak["yearly_cost"]

        if category == "Subscription":
            if "GYM" in merchant or "FITNESS" in merchant:
                easy_wins.append({
                    "title": f"Review {merchant} membership",
                    "estimated_yearly_savings": yearly,
                    "action": f"Consider pausing or canceling if not using regularly. Many gyms allow membership freezes."
                })
            else:
                easy_wins.append({
                    "title": f"Evaluate {merchant} subscription",
                    "estimated_yearly_savings": yearly,
                    "action": f"Check if you're actively using this service. Consider canceling or switching to a cheaper plan."
                })

        elif category == "Food Delivery":
            easy_wins.append({
                "title": f"Reduce {merchant} orders",
                "estimated_yearly_savings": round(yearly * 0.5, 2),
                "action": "Set a weekly budget for food delivery. Try meal prepping to reduce takeout frequency."
            })

        elif category == "Fees & Charges":
            easy_wins.append({
                "title": "Eliminate bank fees",
                "estimated_yearly_savings": yearly,
                "action": "Switch to a no-fee bank account or maintain minimum balance to avoid fees."
            })

        elif category == "Micro Leaks":
            easy_wins.append({
                "title": f"Cut back on {merchant}",
                "estimated_yearly_savings": round(yearly * 0.3, 2),
                "action": "Small purchases add up. Try limiting to once a week instead of daily."
            })

    return easy_wins


def _generate_recovery_plan(top_leaks: list[dict], monthly_leak: float) -> list[str]:
    """Generate personalized recovery plan."""
    plan = []

    # Subscriptions
    sub_total = sum(l["yearly_cost"] for l in top_leaks if l["category"] == "Subscription")
    if sub_total > 0:
        plan.append(f"Review and cancel unused subscriptions (potential savings: ${sub_total:.0f}/year)")

    # Food delivery
    food_total = sum(l["yearly_cost"] for l in top_leaks if l["category"] == "Food Delivery")
    if food_total > 0:
        weekly_budget = round(food_total / 52 * 0.5, 0)
        plan.append(f"Set a weekly food delivery budget of ${weekly_budget:.0f}")

    # Fees
    fee_total = sum(l["yearly_cost"] for l in top_leaks if l["category"] == "Fees & Charges")
    if fee_total > 0:
        plan.append("Switch to a no-fee bank account or credit card")

    # General advice
    plan.append("Enable transaction alerts for purchases over $50")
    plan.append("Review this analysis monthly to track progress")

    if monthly_leak > 100:
        plan.append(f"Target: Reduce monthly leaks from ${monthly_leak:.0f} to ${monthly_leak * 0.5:.0f}")

    return plan


def _merge_results(heuristic: dict, claude: dict) -> dict:
    """Merge Claude enhancements with heuristic results."""
    result = heuristic.copy()

    # Add any enhanced leaks from Claude
    if "enhanced_leaks" in claude and claude["enhanced_leaks"]:
        existing_merchants = {l["merchant"] for l in result["top_leaks"]}
        for leak in claude["enhanced_leaks"]:
            if leak.get("merchant") not in existing_merchants:
                result["top_leaks"].append(leak)
                result["monthly_leak"] += leak.get("monthly_cost", 0)

    # Use Claude's easy wins if better
    if "easy_wins" in claude and claude["easy_wins"]:
        result["easy_wins"] = claude["easy_wins"][:5]

    # Use Claude's recovery plan if provided
    if "recovery_plan" in claude and claude["recovery_plan"]:
        result["recovery_plan"] = claude["recovery_plan"]

    # Recalculate annual savings
    result["annual_savings"] = round(result["monthly_leak"] * 12, 2)

    return result
