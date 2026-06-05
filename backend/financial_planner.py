"""Financial planning engine — derives savings goals and health metrics from spending data.

No ML training needed. All intelligence is derived from:
- Detected spending by category
- Monthly leak total
- Optional income (if detected from statement credits)
- Standard financial benchmarks (50/30/20 rule, compound interest)
"""

import math
from typing import Optional


# Standard financial benchmarks
EMERGENCY_FUND_MONTHS = 3          # Minimum 3-month emergency fund
COLLEGE_FUND_YEARS = 18            # Years to grow college fund
COLLEGE_FUND_TARGET = 100_000      # Rough 4-year public college cost (2025 USD)
HOUSE_DEPOSIT_RATE = 0.20          # 20% down payment target
MEDIAN_HOME_PRICE = 400_000        # Rough median US home (2025)
INVESTMENT_RETURN = 0.07           # Conservative 7% annual return (index fund)
COLLEGE_SAVINGS_RETURN = 0.06      # Conservative 529 plan return


def _monthly_to_reach_goal(goal_amount: float, monthly_contribution: float, annual_rate: float) -> Optional[int]:
    """Months required to reach a lump-sum goal with compound interest."""
    if monthly_contribution <= 0:
        return None
    r = annual_rate / 12
    if r == 0:
        return math.ceil(goal_amount / monthly_contribution)
    # FV = PMT * [(1+r)^n - 1] / r  →  solve for n
    try:
        n = math.log(1 + (goal_amount * r) / monthly_contribution) / math.log(1 + r)
        return math.ceil(n)
    except (ValueError, ZeroDivisionError):
        return None


def _future_value(monthly: float, months: int, annual_rate: float) -> float:
    """Future value of monthly contributions over N months."""
    r = annual_rate / 12
    if r == 0:
        return monthly * months
    return monthly * ((1 + r) ** months - 1) / r


def compute_health_score(
    monthly_leak: float,
    category_summary: list[dict],
    estimated_income: Optional[float] = None,
) -> dict:
    """Return a 0-100 financial health score with component breakdown.

    Scoring weights:
    - Subscription concentration (30 pts): too many subscriptions = low score
    - Fee burden (20 pts): bank fees are pure waste
    - Savings rate (30 pts): savings vs income (needs income estimate)
    - Spending diversity (20 pts): broad categories = healthier than single-category concentration
    """
    score = 100
    reasons = []

    # ── Subscription concentration (max penalty: 30) ──
    sub_total = next(
        (c["total"] for c in category_summary if "Subscription" in c.get("category", "")), 0
    )
    if sub_total > 300:
        score -= 30
        reasons.append("High subscription spend (>$300/mo)")
    elif sub_total > 150:
        score -= 15
        reasons.append("Moderate subscription spend ($150-$300/mo)")
    elif sub_total > 75:
        score -= 5
        reasons.append("Some subscription spend ($75-$150/mo)")

    # ── Fee burden (max penalty: 20) ──
    fee_total = next(
        (c["total"] for c in category_summary if "Fee" in c.get("category", "")), 0
    )
    if fee_total > 50:
        score -= 20
        reasons.append(f"High bank/service fees (${fee_total:.0f}/mo)")
    elif fee_total > 20:
        score -= 10
        reasons.append(f"Moderate fees (${fee_total:.0f}/mo)")
    elif fee_total > 5:
        score -= 3

    # ── Savings rate (max penalty: 30) — only when income known ──
    savings_rate = None
    if estimated_income and estimated_income > 0:
        total_spending = sum(c.get("total", 0) for c in category_summary)
        savings_rate = max(0.0, (estimated_income - total_spending) / estimated_income)
        if savings_rate < 0.05:
            score -= 30
            reasons.append(f"Very low savings rate ({savings_rate:.0%})")
        elif savings_rate < 0.10:
            score -= 15
            reasons.append(f"Low savings rate ({savings_rate:.0%})")
        elif savings_rate < 0.20:
            score -= 5
            reasons.append(f"Below-target savings rate ({savings_rate:.0%})")

    # ── Spending diversity ──
    categories_with_spend = [c for c in category_summary if c.get("total", 0) > 0]
    total_all = sum(c.get("total", 0) for c in categories_with_spend)
    if total_all > 0 and categories_with_spend:
        # Herfindahl concentration index
        hhi = sum((c["total"] / total_all) ** 2 for c in categories_with_spend)
        if hhi > 0.5:
            score -= 20
            reasons.append("Spending concentrated in very few categories")
        elif hhi > 0.3:
            score -= 8

    score = max(0, min(100, score))

    if score >= 80:
        grade, label = "A", "Excellent"
    elif score >= 65:
        grade, label = "B", "Good"
    elif score >= 50:
        grade, label = "C", "Fair"
    elif score >= 35:
        grade, label = "D", "Needs Work"
    else:
        grade, label = "F", "Critical"

    return {
        "score": score,
        "grade": grade,
        "label": label,
        "savings_rate": round(savings_rate, 3) if savings_rate is not None else None,
        "improvement_areas": reasons[:3],
    }


def compute_goal_projections(
    monthly_leak: float,
    category_summary: list[dict],
    estimated_income: Optional[float] = None,
) -> list[dict]:
    """Generate personalized financial goal projections based on spending data.

    Each goal shows:
    - The goal name and target
    - How much you could redirect from current leaks
    - How long it takes to reach the goal
    """
    total_spending = sum(c.get("total", 0) for c in category_summary)
    # Available monthly savings = income - spending (if income known), else just the leak amount
    if estimated_income and estimated_income > total_spending:
        current_monthly_savings = estimated_income - total_spending
    else:
        current_monthly_savings = 0.0

    # The "freed" amount if the user cuts identified leaks in half (conservative)
    freed_monthly = monthly_leak * 0.5

    projections = []

    # ── Emergency Fund ──
    monthly_expenses = total_spending if total_spending > 0 else (monthly_leak * 3)
    emergency_target = monthly_expenses * EMERGENCY_FUND_MONTHS
    if emergency_target > 0:
        contribution = current_monthly_savings + freed_monthly
        months = _monthly_to_reach_goal(emergency_target, max(contribution, freed_monthly), 0.045)
        projections.append({
            "goal": "Emergency Fund",
            "description": f"3 months of expenses (${emergency_target:,.0f})",
            "target_amount": round(emergency_target, 2),
            "monthly_contribution": round(max(contribution, freed_monthly), 2),
            "months_to_goal": months,
            "years_to_goal": round(months / 12, 1) if months else None,
            "icon": "🛡️",
            "priority": "HIGH — build this first",
        })

    # ── College Fund ──
    college_monthly_needed = COLLEGE_FUND_TARGET / (
        _future_value(1, COLLEGE_FUND_YEARS * 12, COLLEGE_SAVINGS_RETURN) or 1
    )
    projections.append({
        "goal": "College Fund (18-year plan)",
        "description": f"${COLLEGE_FUND_TARGET:,} target for university costs",
        "target_amount": COLLEGE_FUND_TARGET,
        "monthly_contribution": round(freed_monthly, 2),
        "projected_value_at_18": round(
            _future_value(freed_monthly, COLLEGE_FUND_YEARS * 12, COLLEGE_SAVINGS_RETURN), 2
        ),
        "monthly_needed_to_hit_target": round(college_monthly_needed, 2),
        "icon": "🎓",
        "priority": "MEDIUM — invest in a 529 plan",
    })

    # ── House Deposit ──
    house_target = MEDIAN_HOME_PRICE * HOUSE_DEPOSIT_RATE
    months_house = _monthly_to_reach_goal(house_target, max(freed_monthly, 1), 0.04)
    projections.append({
        "goal": "House Deposit",
        "description": f"20% down on median home (${house_target:,.0f})",
        "target_amount": house_target,
        "monthly_contribution": round(freed_monthly, 2),
        "months_to_goal": months_house,
        "years_to_goal": round(months_house / 12, 1) if months_house else None,
        "icon": "🏡",
        "priority": "MEDIUM",
    })

    # ── Retirement Boost ──
    # Show 10-year compound growth of redirecting the leak
    ten_year_fv = _future_value(freed_monthly, 120, INVESTMENT_RETURN)
    projections.append({
        "goal": "Retirement Boost (10 years)",
        "description": f"Invest freed-up ${freed_monthly:.0f}/mo into index fund",
        "monthly_contribution": round(freed_monthly, 2),
        "projected_value_10yr": round(ten_year_fv, 2),
        "projected_value_20yr": round(_future_value(freed_monthly, 240, INVESTMENT_RETURN), 2),
        "icon": "📈",
        "priority": "HIGH — start early",
    })

    return projections


def build_budget_benchmark(category_summary: list[dict], estimated_income: Optional[float]) -> Optional[dict]:
    """Compare spending to the 50/30/20 rule if income is available."""
    if not estimated_income or estimated_income <= 0:
        return None

    # Map our categories to 50/30/20 buckets
    needs_categories = {"Utilities & Bills", "Groceries", "Transport", "Health & Fitness"}
    wants_categories = {"Dining & Delivery", "Entertainment", "Shopping", "Subscriptions", "Travel"}

    needs_total = sum(
        c["total"] for c in category_summary
        if c.get("category") in needs_categories
    )
    wants_total = sum(
        c["total"] for c in category_summary
        if c.get("category") in wants_categories
    )
    other_total = sum(
        c["total"] for c in category_summary
        if c.get("category") not in needs_categories | wants_categories
        and c.get("category") not in {"Income", "Transfers"}
    )

    target_needs = estimated_income * 0.50
    target_wants = estimated_income * 0.30
    target_savings = estimated_income * 0.20

    actual_savings = max(0, estimated_income - needs_total - wants_total - other_total)

    return {
        "income_estimate": round(estimated_income, 2),
        "rule": "50/30/20",
        "needs": {
            "actual": round(needs_total, 2),
            "target": round(target_needs, 2),
            "pct_of_income": round(needs_total / estimated_income * 100, 1),
            "target_pct": 50,
            "status": "ok" if needs_total <= target_needs * 1.1 else "over",
        },
        "wants": {
            "actual": round(wants_total, 2),
            "target": round(target_wants, 2),
            "pct_of_income": round(wants_total / estimated_income * 100, 1),
            "target_pct": 30,
            "status": "ok" if wants_total <= target_wants * 1.1 else "over",
        },
        "savings": {
            "actual": round(actual_savings, 2),
            "target": round(target_savings, 2),
            "pct_of_income": round(actual_savings / estimated_income * 100, 1),
            "target_pct": 20,
            "status": "ok" if actual_savings >= target_savings * 0.9 else "under",
        },
    }
