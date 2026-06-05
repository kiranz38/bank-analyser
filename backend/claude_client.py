"""AI client — uses the multi-provider router (Ollama → Groq → Gemini → Claude).

All AI calls go through AIRouter, which tries providers in cost order.
Claude Sonnet is only reached for premium strategy tasks when cheaper providers fail.
"""

import logging
import hashlib
import time
from typing import Optional
from redactor import redact_transactions
from ai_router import (
    get_router,
    TaskType,
    savings_strategy_prompt,
)

logger = logging.getLogger(__name__)

# Separate in-memory cache for the analysis pipeline (1-hour TTL)
_cache: dict[str, tuple[dict, float]] = {}
_CACHE_TTL = 3600


def _cache_get(key: str) -> Optional[dict]:
    entry = _cache.get(key)
    if entry and time.time() - entry[1] < _CACHE_TTL:
        return entry[0]
    if entry:
        del _cache[key]
    return None


def _cache_set(key: str, value: dict) -> None:
    if len(_cache) >= 100:
        oldest = min(_cache, key=lambda k: _cache[k][1])
        del _cache[oldest]
    _cache[key] = (value, time.time())


def get_claude_analysis(
    transactions: list[dict],
    heuristic_results: dict,
    premium: bool = False,
) -> Optional[dict]:
    """Run spending analysis through the AI cascade.

    Non-premium users: Ollama → Groq → Gemini → Claude Haiku
    Premium users:     Claude Sonnet (best quality, gated feature)

    PRIVACY: Only anonymized category totals are sent to external providers.
    """
    try:
        redacted_txns = redact_transactions(transactions)
        anonymized_summary = _prepare_anonymized_summary(redacted_txns, heuristic_results)

        # Check local cache first
        cache_key = hashlib.sha256(anonymized_summary.encode()).hexdigest()
        cached = _cache_get(cache_key)
        if cached is not None:
            logger.info("Analysis cache hit — skipping AI call")
            return cached

        router = get_router()
        prompt = savings_strategy_prompt(anonymized_summary)

        task = TaskType.PREMIUM_STRATEGY if premium else TaskType.SAVINGS_STRATEGY
        result = router.route(task, prompt, max_tokens=1500, cache_ttl=3600)

        if result:
            logger.info(
                f"Analysis served by {result.provider} in {result.latency_ms}ms "
                f"(cost ${result.cost_usd:.5f})"
            )
            _cache_set(cache_key, result.content)
            return result.content

        return None

    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return None


def categorize_merchant_ai(merchant_name: str) -> Optional[dict]:
    """Categorize a single merchant using the cheapest available provider.

    Tries Ollama first (free, local, instant), then Groq, then Gemini.
    Never reaches Claude for this task — it's overkill.
    Returns: {"category": str, "is_subscription": bool, "confidence": float}
    """
    from ai_router import merchant_categorization_prompt
    router = get_router()
    prompt = merchant_categorization_prompt(merchant_name)
    result = router.route(TaskType.CATEGORIZE_MERCHANT, prompt, max_tokens=100)
    return result.content if result else None


def get_router_health() -> dict:
    """Return which AI providers are currently available — useful for /health endpoint."""
    router = get_router()
    return {
        "providers": router.health_check(),
        "stats": router.get_stats(),
    }


def _prepare_anonymized_summary(transactions: list[dict], heuristic_results: dict) -> str:
    """Prepare an ANONYMIZED summary for external AI providers.

    PRIVACY: Never sends raw merchant names or exact amounts.
    Only sends category totals, transaction counts, and amount ranges.
    """
    category_totals = {}
    for t in transactions:
        category = t.get("category", "Uncategorized")
        if category not in category_totals:
            category_totals[category] = {"count": 0, "total": 0}
        category_totals[category]["count"] += 1
        category_totals[category]["total"] += t["amount"]

    sorted_categories = sorted(
        category_totals.items(),
        key=lambda x: x[1]["total"],
        reverse=True,
    )

    lines = ["Spending by Category (anonymized):"]
    for category, data in sorted_categories:
        avg = data["total"] / data["count"] if data["count"] > 0 else 0
        lines.append(
            f"- {category}: {_amount_range(data['total'])} total, "
            f"{data['count']} transactions, {_amount_range(avg)} avg"
        )

    total_spending = sum(t["amount"] for t in transactions)
    lines.append(f"\nTotal transactions: {len(transactions)}")
    lines.append(f"Total spending range: {_amount_range(total_spending)}")

    sub_count = len(heuristic_results.get("subscriptions", []))
    if sub_count:
        lines.append(f"Detected recurring payments: {sub_count}")

    monthly_leak = heuristic_results.get("monthly_leak", 0)
    if monthly_leak:
        lines.append(f"Estimated monthly leak: {_amount_range(monthly_leak)}")

    return "\n".join(lines)


def _amount_range(amount: float) -> str:
    """Convert exact amount to range for privacy."""
    thresholds = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
    labels = [
        "$0-10", "$10-25", "$25-50", "$50-100", "$100-250",
        "$250-500", "$500-1000", "$1000-2500", "$2500-5000", "$5000-10000",
    ]
    for threshold, label in zip(thresholds, labels):
        if amount < threshold:
            return label
    return "$10000+"
