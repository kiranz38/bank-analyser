"""Spending analyzer with categorization, subscription detection, and Claude enhancement."""

from collections import defaultdict
from typing import Optional
from claude_client import get_claude_analysis
from categorizer import categorize_transactions, generate_category_summary, Category
from subscription_detector import detect_subscriptions, generate_month_comparison, detect_date_range


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

# Keywords that indicate non-transaction entries
EXCLUDE_KEYWORDS = [
    "BALANCE", "TOTAL", "OPENING", "CLOSING", "BROUGHT FORWARD",
    "CARRIED FORWARD", "AVAILABLE", "PENDING", "CREDIT LIMIT"
]


def _get_top_spending(transactions: list[dict], limit: int = 5) -> list[dict]:
    """Get the top N biggest individual transactions."""
    sorted_txns = sorted(transactions, key=lambda x: x.get("amount", 0), reverse=True)

    top_spending = []
    for t in sorted_txns[:limit]:
        top_spending.append({
            "date": t.get("date", ""),
            "merchant": t.get("original_merchant", t.get("merchant", "Unknown")),
            "amount": round(t.get("amount", 0), 2),
            "category": t.get("category", "Other")
        })

    return top_spending


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
    Analyze transactions for spending leaks with categorization.

    Args:
        transactions: List of parsed transactions
        use_claude: Whether to enhance with Claude API

    Returns:
        Analysis results dict with categories, subscriptions, and comparisons
    """
    if not transactions:
        return _empty_result()

    # Filter out unrealistic transactions
    transactions = _filter_transactions(transactions)

    if not transactions:
        return _empty_result()

    # Categorize all transactions
    categorized_txns = categorize_transactions(transactions)

    # Generate category summary
    category_summary = generate_category_summary(categorized_txns)

    # Detect subscriptions with improved algorithm
    subscriptions = detect_subscriptions(categorized_txns)

    # Generate month-over-month comparison if enough data
    comparison = generate_month_comparison(categorized_txns)

    # Run heuristic analysis for leaks
    heuristic_results = _heuristic_analysis(categorized_txns, subscriptions)

    # Enhance with Claude if enabled
    if use_claude:
        claude_enhancements = get_claude_analysis(categorized_txns, heuristic_results)
        if claude_enhancements:
            heuristic_results = _merge_results(heuristic_results, claude_enhancements)

    # Build final result
    result = heuristic_results
    result["category_summary"] = category_summary
    result["subscriptions"] = subscriptions
    result["comparison"] = comparison

    # Generate share summary (privacy-safe)
    result["share_summary"] = _generate_share_summary(result, subscriptions)

    return result


def _empty_result() -> dict:
    """Return empty analysis result."""
    return {
        "monthly_leak": 0,
        "annual_savings": 0,
        "top_leaks": [],
        "top_spending": [],
        "easy_wins": [],
        "recovery_plan": [
            "Upload your bank statement to get started",
            "We'll analyze your spending patterns",
            "Get personalized recommendations to save money"
        ],
        "disclaimer": "This analysis is for informational purposes only. Not financial advice.",
        "category_summary": [],
        "subscriptions": [],
        "comparison": None,
        "share_summary": None
    }


def _heuristic_analysis(transactions: list[dict], subscriptions: list[dict]) -> dict:
    """Run heuristic-based spending analysis."""

    # Group transactions by merchant
    merchant_data = defaultdict(lambda: {"transactions": [], "total": 0})
    for t in transactions:
        merchant = t.get("normalized_merchant") or t["merchant"]
        merchant_data[merchant]["transactions"].append(t)
        merchant_data[merchant]["total"] += t["amount"]

    top_leaks = []
    total_leak = 0

    # Add subscriptions as leaks
    subscription_merchants = set()
    for sub in subscriptions:
        if sub["confidence"] >= 0.5:
            top_leaks.append({
                "category": "Subscription",
                "merchant": sub["merchant"],
                "monthly_cost": sub["monthly_cost"],
                "yearly_cost": sub["annual_cost"],
                "explanation": sub["reason"]
            })
            total_leak += sub["monthly_cost"]
            subscription_merchants.add(sub["merchant"])

    # Detect fees (not already counted as subscriptions)
    fees = _detect_fees(merchant_data, subscription_merchants)
    for fee in fees:
        top_leaks.append(fee)
        total_leak += fee["monthly_cost"]

    # Detect food delivery spending
    food_delivery = _detect_food_delivery(merchant_data, subscription_merchants)
    for fd in food_delivery:
        top_leaks.append(fd)
        total_leak += fd["monthly_cost"]

    # Detect micro leaks
    micro_leaks = _detect_micro_leaks(merchant_data, subscription_merchants)
    for ml in micro_leaks:
        top_leaks.append(ml)
        total_leak += ml["monthly_cost"]

    # Sort by monthly cost
    top_leaks.sort(key=lambda x: x["monthly_cost"], reverse=True)

    # Get top 5 biggest individual transactions
    top_spending = _get_top_spending(transactions)

    # Generate easy wins
    easy_wins = _generate_easy_wins(top_leaks, merchant_data)

    # Generate recovery plan
    recovery_plan = _generate_recovery_plan(top_leaks, total_leak)

    return {
        "monthly_leak": round(total_leak, 2),
        "annual_savings": round(total_leak * 12, 2),
        "top_leaks": top_leaks[:10],
        "top_spending": top_spending,
        "easy_wins": easy_wins[:5],
        "recovery_plan": recovery_plan,
        "disclaimer": "This analysis is for informational purposes only. Not financial advice."
    }


def _detect_fees(merchant_data: dict, exclude_merchants: set) -> list[dict]:
    """Detect bank fees and charges."""
    fees = []

    for merchant, data in merchant_data.items():
        if merchant in exclude_merchants:
            continue
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


def _detect_food_delivery(merchant_data: dict, exclude_merchants: set) -> list[dict]:
    """Detect food delivery spending."""
    food_delivery = []

    for merchant, data in merchant_data.items():
        if merchant in exclude_merchants:
            continue
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


def _detect_micro_leaks(merchant_data: dict, exclude_merchants: set) -> list[dict]:
    """Detect micro transactions that add up."""
    micro_leaks = []

    for merchant, data in merchant_data.items():
        if merchant in exclude_merchants:
            continue
        txns = data["transactions"]
        amounts = [t["amount"] for t in txns]
        avg_amount = sum(amounts) / len(amounts) if amounts else 0

        # Micro leak: average under $10 but 10+ transactions
        if avg_amount < 10 and len(txns) >= 10:
            monthly_cost = data["total"] / max(1, _estimate_months(txns))
            micro_leaks.append({
                "category": "Small Frequent Purchases",
                "merchant": merchant,
                "monthly_cost": round(monthly_cost, 2),
                "yearly_cost": round(monthly_cost * 12, 2),
                "explanation": f"Convenience store purchases: Small amounts can add up over time"
            })

    return micro_leaks


def _estimate_months(transactions: list[dict]) -> int:
    """Estimate number of months covered by transactions."""
    from subscription_detector import detect_date_range
    _, _, days = detect_date_range(transactions)
    if days > 0:
        return max(1, days // 30)
    return 3  # Default assumption


def _generate_easy_wins(top_leaks: list[dict], merchant_data: dict) -> list[dict]:
    """Generate actionable easy wins."""
    easy_wins = []
    seen_categories = set()

    for leak in top_leaks:
        category = leak["category"]
        merchant = leak["merchant"]
        yearly = leak["yearly_cost"]

        # Avoid duplicate category suggestions
        if category in seen_categories:
            continue

        if category == "Subscription":
            if "GYM" in merchant or "FITNESS" in merchant:
                easy_wins.append({
                    "title": f"Audit {merchant} usage",
                    "estimated_yearly_savings": yearly,
                    "action": "Track gym visits for 2 weeks - if less than 8 visits per month, cancel and use free alternatives"
                })
            else:
                easy_wins.append({
                    "title": "Consolidate streaming services",
                    "estimated_yearly_savings": yearly,
                    "action": "Keep only 1-2 streaming services you actually watch. Rotate subscriptions monthly instead of paying for all."
                })
            seen_categories.add(category)

        elif category == "Food Delivery":
            easy_wins.append({
                "title": "Reduce delivery orders",
                "estimated_yearly_savings": round(yearly * 0.5, 2),
                "action": "Set a weekly delivery budget. Try meal prepping on Sundays to reduce takeout frequency."
            })
            seen_categories.add(category)

        elif category == "Fees & Charges":
            easy_wins.append({
                "title": "Switch to fee-free banking",
                "estimated_yearly_savings": yearly,
                "action": "Open account with online bank like Ally or local credit union to eliminate ATM and account fees."
            })
            seen_categories.add(category)

        elif category == "Small Frequent Purchases":
            easy_wins.append({
                "title": "Cut convenience store runs",
                "estimated_yearly_savings": round(yearly * 0.3, 2),
                "action": "Buy snacks and drinks in bulk at grocery store. Small daily purchases add up significantly."
            })
            seen_categories.add(category)

    return easy_wins


def _generate_recovery_plan(top_leaks: list[dict], monthly_leak: float) -> list[str]:
    """Generate personalized recovery plan."""
    plan = []

    # Subscriptions
    sub_leaks = [l for l in top_leaks if l["category"] == "Subscription"]
    if sub_leaks:
        plan.append(f"Week 1: Audit all {len(sub_leaks)} subscriptions - cancel or pause unused ones")

    # Food delivery
    food_leaks = [l for l in top_leaks if l["category"] == "Food Delivery"]
    if food_leaks:
        weekly_target = round(sum(l["yearly_cost"] for l in food_leaks) / 52 * 0.5, 0)
        plan.append(f"Week 2: Set weekly food delivery budget of ${weekly_target:.0f}")

    # Fees
    fee_leaks = [l for l in top_leaks if l["category"] == "Fees & Charges"]
    if fee_leaks:
        plan.append("Week 3: Research and open a fee-free bank account")

    # General advice
    plan.append("Month 2: Track all discretionary spending for 30 days")
    plan.append("Set up automatic transfers of saved money to separate savings account")
    plan.append("Schedule monthly 15-minute spending reviews to maintain awareness")

    if monthly_leak > 100:
        target = round(monthly_leak * 0.5, 0)
        plan.append(f"Goal: Reduce monthly leaks from ${monthly_leak:.0f} to ${target:.0f}")

    return plan


def _generate_share_summary(results: dict, subscriptions: list[dict]) -> dict:
    """Generate privacy-safe summary for sharing."""
    monthly = results.get("monthly_leak", 0)
    annual = results.get("annual_savings", 0)

    # Get top 3 leak categories (not specific merchants for privacy)
    top_categories = []
    seen = set()
    for leak in results.get("top_leaks", [])[:5]:
        cat = leak.get("category", "Other")
        if cat not in seen:
            monthly_cost = leak.get("monthly_cost", 0)
            try:
                monthly_cost = float(monthly_cost) if monthly_cost is not None else 0
            except (ValueError, TypeError):
                monthly_cost = 0
            top_categories.append({
                "category": cat,
                "monthly": round(monthly_cost, 2)
            })
            seen.add(cat)
        if len(top_categories) >= 3:
            break

    # Count subscriptions found
    sub_count = len([s for s in subscriptions if s.get("confidence", 0) >= 0.6])

    return {
        "monthly_leak": round(monthly, 2),
        "annual_savings": round(annual, 2),
        "top_categories": top_categories,
        "subscription_count": sub_count,
        "tagline": f"I found ${annual:.0f}/year in hidden spending leaks!"
    }


def _merge_results(heuristic: dict, claude: dict) -> dict:
    """Merge Claude enhancements with heuristic results."""
    result = heuristic.copy()

    # Add any enhanced leaks from Claude
    if "enhanced_leaks" in claude and claude["enhanced_leaks"]:
        existing_merchants = {l["merchant"] for l in result["top_leaks"]}
        for leak in claude["enhanced_leaks"]:
            if leak.get("merchant") not in existing_merchants:
                # Ensure valid numeric values for costs
                monthly_cost = leak.get("monthly_cost")
                yearly_cost = leak.get("yearly_cost")
                try:
                    monthly_cost = float(monthly_cost) if monthly_cost is not None else 0
                    yearly_cost = float(yearly_cost) if yearly_cost is not None else monthly_cost * 12
                except (ValueError, TypeError):
                    monthly_cost = 0
                    yearly_cost = 0

                leak["monthly_cost"] = round(monthly_cost, 2)
                leak["yearly_cost"] = round(yearly_cost, 2)

                result["top_leaks"].append(leak)
                result["monthly_leak"] += leak["monthly_cost"]

    # Use Claude's easy wins if better
    if "easy_wins" in claude and claude["easy_wins"]:
        result["easy_wins"] = claude["easy_wins"][:5]

    # Use Claude's recovery plan if provided
    if "recovery_plan" in claude and claude["recovery_plan"]:
        result["recovery_plan"] = claude["recovery_plan"]

    # Recalculate annual savings
    result["annual_savings"] = round(result["monthly_leak"] * 12, 2)

    return result
