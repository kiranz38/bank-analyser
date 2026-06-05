"""Deep individual user insights — computed entirely from transaction data.

Produces insights that feel personal and actionable:
  - Spending velocity (daily burn rate, days-to-zero)
  - Behavioral patterns (day-of-week, weekend vs weekday, month-end spikes)
  - Habit analysis (merchant visit counts, cost-per-visit)
  - Cashflow calendar (weekly surplus/deficit)
  - Personalized action plan with exact $ impact
  - "What you could afford" projections
"""

from collections import defaultdict
from datetime import datetime, date
from typing import Optional
import statistics
import calendar


# ─── Date helpers ─────────────────────────────────────────────────────────────

def _parse_date(d: str) -> Optional[date]:
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(d, fmt).date()
        except (ValueError, TypeError):
            pass
    return None


def _date_range(transactions: list[dict]) -> tuple[Optional[date], Optional[date], int]:
    dates = [_parse_date(t.get("date", "")) for t in transactions]
    dates = [d for d in dates if d]
    if not dates:
        return None, None, 0
    return min(dates), max(dates), (max(dates) - min(dates)).days + 1


# ─── 1. Spending Velocity ──────────────────────────────────────────────────────

def compute_spending_velocity(
    transactions: list[dict],
    estimated_monthly_income: Optional[float],
) -> dict:
    """How fast money leaves the account."""
    start, end, span_days = _date_range(transactions)
    if span_days == 0:
        return {}

    total_spend = sum(t.get("amount", 0) for t in transactions)
    daily_burn = total_spend / span_days
    monthly_burn = daily_burn * 30.44

    result: dict = {
        "daily_burn_rate": round(daily_burn, 2),
        "monthly_burn_rate": round(monthly_burn, 2),
        "span_days": span_days,
    }

    if estimated_monthly_income and estimated_monthly_income > 0:
        days_to_empty = estimated_monthly_income / daily_burn if daily_burn > 0 else None
        savings_rate = max(0, (estimated_monthly_income - monthly_burn) / estimated_monthly_income * 100)
        result["days_to_empty"] = round(days_to_empty, 1) if days_to_empty else None
        result["savings_rate_pct"] = round(savings_rate, 1)
        result["monthly_surplus"] = round(estimated_monthly_income - monthly_burn, 2)

    return result


# ─── 2. Behavioral Patterns ────────────────────────────────────────────────────

_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def compute_behavioral_patterns(transactions: list[dict]) -> dict:
    """Day-of-week spending, weekend vs weekday, month-end spike."""
    day_totals: dict[int, float] = defaultdict(float)  # 0=Mon … 6=Sun
    day_counts: dict[int, int] = defaultdict(int)
    week_totals: dict[int, float] = defaultdict(float)   # 0=weekday, 1=weekend
    month_half: dict[str, float] = defaultdict(float)    # "first" / "second"

    for t in transactions:
        d = _parse_date(t.get("date", ""))
        if not d:
            continue
        amt = t.get("amount", 0)
        weekday = d.weekday()  # 0=Mon, 6=Sun
        day_totals[weekday] += amt
        day_counts[weekday] += 1
        week_totals[0 if weekday < 5 else 1] += amt
        month_half["first" if d.day <= 15 else "second"] += amt

    if not day_totals:
        return {}

    # Average spend per day-of-week (controls for how many of each weekday)
    avg_by_day = {
        _WEEKDAYS[wd]: round(day_totals[wd] / max(1, day_counts[wd]), 2)
        for wd in range(7)
        if day_counts[wd] > 0
    }

    top_day = max(avg_by_day, key=lambda k: avg_by_day[k]) if avg_by_day else None

    # Weekend premium
    weekday_total = week_totals.get(0, 0)
    weekend_total = week_totals.get(1, 0)
    grand = weekday_total + weekend_total
    weekend_pct = round(weekend_total / grand * 100, 1) if grand > 0 else 0

    # Month-end spike: does second half cost 20%+ more per day than first?
    first = month_half.get("first", 0)
    second = month_half.get("second", 0)
    month_end_spike = second > first * 1.2 if first > 0 else False

    return {
        "avg_spend_by_day": avg_by_day,
        "most_expensive_day": top_day,
        "weekend_spend_pct": weekend_pct,
        "weekday_spend_pct": round(100 - weekend_pct, 1),
        "month_end_spike": month_end_spike,
        "first_half_spend": round(first, 2),
        "second_half_spend": round(second, 2),
    }


# ─── 3. Habit Analysis ─────────────────────────────────────────────────────────

# How we label visit frequency
def _habit_label(monthly_visits: float) -> str:
    if monthly_visits >= 20:
        return "daily habit"
    if monthly_visits >= 8:
        return "frequent habit"
    if monthly_visits >= 4:
        return "weekly habit"
    if monthly_visits >= 2:
        return "bi-weekly habit"
    return "occasional"


def compute_habit_analysis(
    transactions: list[dict],
    min_visits: int = 2,
    top_n: int = 10,
) -> list[dict]:
    """Merchant visit frequency and cost-per-visit — the 'coffee shop effect'."""
    _, _, span_days = _date_range(transactions)
    months = max(1, span_days / 30.44) if span_days else 1

    merchant_data: dict[str, dict] = defaultdict(lambda: {"amounts": [], "dates": []})
    for t in transactions:
        m = t.get("merchant", "").strip()
        if not m:
            continue
        merchant_data[m]["amounts"].append(t.get("amount", 0))
        d = _parse_date(t.get("date", ""))
        if d:
            merchant_data[m]["dates"].append(d)

    habits = []
    for merchant, data in merchant_data.items():
        visit_count = len(data["amounts"])
        if visit_count < min_visits:
            continue
        total = sum(data["amounts"])
        avg_per_visit = total / visit_count
        monthly_visits = visit_count / months
        monthly_total = total / months

        habits.append({
            "merchant": merchant,
            "visit_count": visit_count,
            "avg_per_visit": round(avg_per_visit, 2),
            "monthly_visits": round(monthly_visits, 1),
            "monthly_total": round(monthly_total, 2),
            "annual_total": round(monthly_total * 12, 2),
            "habit_label": _habit_label(monthly_visits),
        })

    # Sort by monthly total descending
    habits.sort(key=lambda h: h["monthly_total"], reverse=True)
    return habits[:top_n]


# ─── 4. Cashflow Calendar ──────────────────────────────────────────────────────

def compute_cashflow_calendar(
    transactions: list[dict],
    estimated_monthly_income: Optional[float],
) -> list[dict]:
    """Weekly cashflow — income minus spending per ISO week."""
    week_spend: dict[str, float] = defaultdict(float)

    for t in transactions:
        d = _parse_date(t.get("date", ""))
        if not d:
            continue
        # ISO week key: "2025-W04"
        week_key = f"{d.isocalendar()[0]}-W{d.isocalendar()[1]:02d}"
        week_spend[week_key] += t.get("amount", 0)

    if not week_spend:
        return []

    weekly_income = (estimated_monthly_income / 4.33) if estimated_monthly_income else None

    result = []
    for week, spend in sorted(week_spend.items()):
        entry: dict = {"week": week, "spending": round(spend, 2)}
        if weekly_income is not None:
            entry["income"] = round(weekly_income, 2)
            entry["surplus"] = round(weekly_income - spend, 2)
        result.append(entry)

    return result


# ─── 5. Personalized Action Plan ──────────────────────────────────────────────

def compute_action_plan(
    top_leaks: list[dict],
    subscriptions: list[dict],
    alternatives: list[dict],
    behavioral_patterns: dict,
    habits: list[dict],
    estimated_monthly_income: Optional[float],
) -> list[dict]:
    """Ranked, specific actions with exact dollar impact — most valuable first."""
    actions: list[dict] = []

    # Cancel / downgrade specific subscriptions
    for sub in subscriptions[:5]:
        m = sub.get("merchant", "")
        mc = sub.get("monthly_cost", 0)
        if mc >= 5:
            actions.append({
                "priority": "high",
                "action": f"Cancel or pause {m}",
                "detail": f"You're paying ${mc:.0f}/mo (${mc*12:.0f}/yr) — evaluate if you actively use it.",
                "monthly_impact": round(mc, 2),
                "annual_impact": round(mc * 12, 2),
                "effort": "5 min",
                "type": "cancel_subscription",
            })

    # Switch to cheaper alternative — best option per original service only
    seen_originals: set = set()
    for alt in alternatives:
        orig = alt.get("original", "")
        s = alt.get("monthly_savings", 0)
        if s >= 3 and orig not in seen_originals:
            seen_originals.add(orig)
            actions.append({
                "priority": "medium",
                "action": f"Switch {orig} → {alt.get('alternative')}",
                "detail": alt.get("note", ""),
                "monthly_impact": round(s, 2),
                "annual_impact": round(s * 12, 2),
                "effort": "15 min",
                "type": "switch_alternative",
            })
        if len(seen_originals) >= 3:
            break

    # Coffee/café habit
    cafe_keywords = ["STARBUCKS", "COFFEE", "CAFE", "CAFFÈ", "COSTA", "TIM HORTONS", "DUNKIN"]
    cafe_habits = [
        h for h in habits
        if any(kw in h["merchant"].upper() for kw in cafe_keywords)
        and h["monthly_total"] >= 30
    ]
    for h in cafe_habits[:2]:
        cut = h["monthly_total"] * 0.5
        actions.append({
            "priority": "medium",
            "action": f"Halve your {h['merchant']} habit",
            "detail": f"{h['visit_count']} visits → avg ${h['avg_per_visit']:.2f}/visit. Brew at home 3 days/week.",
            "monthly_impact": round(cut, 2),
            "annual_impact": round(cut * 12, 2),
            "effort": "Ongoing",
            "type": "reduce_habit",
        })

    # Weekend spending alert
    if behavioral_patterns.get("weekend_spend_pct", 0) >= 55:
        # Estimate: cutting 20% of weekend spending
        for leak in top_leaks:
            if leak.get("category") in ("Food Delivery", "Dining", "Entertainment"):
                cut = leak.get("monthly_cost", 0) * 0.2
                if cut >= 10:
                    actions.append({
                        "priority": "medium",
                        "action": "Set a weekend spending limit",
                        "detail": f"{behavioral_patterns['weekend_spend_pct']:.0f}% of your spending happens on weekends. A $50 weekly cap saves ${cut*12:.0f}/yr.",
                        "monthly_impact": round(cut, 2),
                        "annual_impact": round(cut * 12, 2),
                        "effort": "Set alert in banking app",
                        "type": "behavioral",
                    })
                break

    # Fee elimination
    fee_leaks = [l for l in top_leaks if l.get("category") == "Fees & Charges"]
    for fl in fee_leaks[:1]:
        mc = fl.get("monthly_cost", 0)
        if mc > 0:
            actions.append({
                "priority": "high",
                "action": "Eliminate bank/ATM fees",
                "detail": f"You paid ${mc:.0f}/mo in fees. Switch to a fee-free bank or use in-network ATMs only.",
                "monthly_impact": round(mc, 2),
                "annual_impact": round(mc * 12, 2),
                "effort": "30 min to open account",
                "type": "eliminate_fee",
            })

    # Auto-invest surplus
    if estimated_monthly_income:
        total_action_savings = sum(a["monthly_impact"] for a in actions)
        if total_action_savings >= 50:
            actions.append({
                "priority": "low",
                "action": "Auto-invest the savings you free up",
                "detail": f"Put your freed-up ${total_action_savings:.0f}/mo into an index fund. In 10 years at 7%: ${total_action_savings * 12 * 13.82:.0f}.",
                "monthly_impact": 0,
                "annual_impact": 0,
                "effort": "30 min to set up",
                "type": "invest",
            })

    # Deduplicate and sort by annual impact
    seen = set()
    deduped = []
    for a in actions:
        key = (a["type"], a["action"][:30])
        if key not in seen:
            seen.add(key)
            deduped.append(a)

    priority_order = {"high": 0, "medium": 1, "low": 2}
    deduped.sort(key=lambda a: (-a["annual_impact"], priority_order.get(a["priority"], 3)))
    return deduped[:8]


# ─── 6. What You Could Afford ─────────────────────────────────────────────────

_GOALS = [
    {"name": "Weekend city break", "cost": 500},
    {"name": "New iPhone 16", "cost": 1000},
    {"name": "3-month emergency fund (avg)", "cost": 7500},
    {"name": "Europe trip for two", "cost": 5000},
    {"name": "Down payment boost", "cost": 20000},
    {"name": "First investment portfolio", "cost": 2000},
]


def compute_what_you_could_afford(
    action_plan: list[dict],
    estimated_monthly_income: Optional[float],
) -> list[dict]:
    """If you act on the plan, here's what becomes achievable."""
    total_monthly_savings = sum(
        a["monthly_impact"] for a in action_plan
        if a.get("type") != "invest"
    )
    if total_monthly_savings < 20:
        return []

    results = []
    for goal in _GOALS:
        months = goal["cost"] / total_monthly_savings
        if 1 <= months <= 36:
            results.append({
                "goal": goal["name"],
                "cost": goal["cost"],
                "months_to_reach": round(months, 1),
                "monthly_savings_needed": round(total_monthly_savings, 2),
            })

    results.sort(key=lambda g: g["months_to_reach"])
    return results[:4]


# ─── 7. Category Deep Dive ────────────────────────────────────────────────────

def compute_category_deep_dive(
    transactions: list[dict],
    category_summary: list[dict],
    estimated_monthly_income: Optional[float],
) -> list[dict]:
    """Per-category: % of income, largest transaction, avg transaction."""
    _, _, span_days = _date_range(transactions)
    months = max(1, span_days / 30.44) if span_days else 1

    # Build per-category transaction lists
    cat_txns: dict[str, list] = defaultdict(list)
    for t in transactions:
        cat = t.get("category", "Other") or "Other"
        cat_txns[cat].append(t.get("amount", 0))

    result = []
    for cs in category_summary:
        cat = cs.get("category", "Other")
        total = cs.get("total", 0)
        amounts = cat_txns.get(cat, [])
        count = len(amounts) or cs.get("count", 0)

        monthly_total = total / months
        pct_of_income = (
            round(monthly_total / estimated_monthly_income * 100, 1)
            if estimated_monthly_income and estimated_monthly_income > 0
            else None
        )

        entry = {
            "category": cat,
            "monthly_total": round(monthly_total, 2),
            "total": round(total, 2),
            "transaction_count": count,
            "avg_per_transaction": round(total / count, 2) if count else 0,
            "largest_transaction": round(max(amounts), 2) if amounts else 0,
            "pct_of_income": pct_of_income,
        }
        result.append(entry)

    result.sort(key=lambda c: c["monthly_total"], reverse=True)
    return result


# ─── Master entry point ────────────────────────────────────────────────────────

def compute_all_insights(
    transactions: list[dict],
    category_summary: list[dict],
    top_leaks: list[dict],
    subscriptions: list[dict],
    alternatives: list[dict],
    estimated_monthly_income: Optional[float],
) -> dict:
    """Run all insight engines and return a single insights dict."""
    velocity = compute_spending_velocity(transactions, estimated_monthly_income)
    patterns = compute_behavioral_patterns(transactions)
    habits = compute_habit_analysis(transactions)
    cashflow = compute_cashflow_calendar(transactions, estimated_monthly_income)
    category_dive = compute_category_deep_dive(transactions, category_summary, estimated_monthly_income)
    action_plan = compute_action_plan(
        top_leaks, subscriptions, alternatives, patterns, habits, estimated_monthly_income
    )
    affordable = compute_what_you_could_afford(action_plan, estimated_monthly_income)

    return {
        "spending_velocity": velocity,
        "behavioral_patterns": patterns,
        "habit_analysis": habits,
        "cashflow_calendar": cashflow,
        "category_deep_dive": category_dive,
        "action_plan": action_plan,
        "what_you_could_afford": affordable,
    }
