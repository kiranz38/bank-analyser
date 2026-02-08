"""Claude API integration for enhanced spending analysis."""

import os
import json
import logging
from typing import Optional
from anthropic import Anthropic

logger = logging.getLogger(__name__)


def get_claude_analysis(transactions: list[dict], heuristic_results: dict) -> Optional[dict]:
    """
    Send ANONYMIZED transaction data to Claude for enhanced analysis.

    PRIVACY: We never send raw merchant names or exact amounts.
    Only aggregated, anonymized data is shared.

    Returns enhanced analysis or None if API unavailable.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    try:
        client = Anthropic(api_key=api_key)

        # Prepare ANONYMIZED transaction summary for Claude
        anonymized_summary = _prepare_anonymized_summary(transactions, heuristic_results)

        prompt = f"""Analyze this anonymized spending data and provide general financial insights.

{anonymized_summary}

Based on this aggregated spending pattern, please provide:
1. General observations about the spending distribution
2. Actionable "easy wins" for saving money based on the category breakdown
3. A recovery plan with practical steps

Respond with a JSON object containing:
- "easy_wins": array of actionable savings opportunities with title, estimated_yearly_savings (number), and action (string)
- "recovery_plan": array of specific steps (strings) for improving financial health

Important: Focus on practical financial advice. Do not provide investment advice. Keep suggestions realistic and achievable.

Respond ONLY with valid JSON, no other text."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse Claude's response
        response_text = response.content[0].text

        # Try to extract JSON from response
        try:
            # Handle potential markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            return None

    except Exception as e:
        logger.error(f"Claude API error: {e}")
        return None


def _prepare_anonymized_summary(transactions: list[dict], heuristic_results: dict) -> str:
    """
    Prepare an ANONYMIZED summary for Claude.

    PRIVACY: Never sends raw merchant names or exact transaction amounts.
    Only sends:
    - Category totals (not merchant names)
    - Amount ranges (not exact amounts)
    - Transaction counts
    - Aggregated statistics
    """
    # Group by category only (no merchant names)
    category_totals = {}
    for t in transactions:
        category = t.get("category", "Uncategorized")
        if category not in category_totals:
            category_totals[category] = {"count": 0, "total": 0, "amounts": []}
        category_totals[category]["count"] += 1
        category_totals[category]["total"] += t["amount"]
        category_totals[category]["amounts"].append(t["amount"])

    # Sort by total spending
    sorted_categories = sorted(
        category_totals.items(),
        key=lambda x: x[1]["total"],
        reverse=True
    )

    lines = ["Spending by Category (anonymized):"]
    for category, data in sorted_categories:
        # Use ranges instead of exact amounts
        avg = data["total"] / data["count"] if data["count"] > 0 else 0
        total_range = _get_amount_range(data["total"])
        avg_range = _get_amount_range(avg)
        lines.append(f"- {category}: {total_range} total, {data['count']} transactions, {avg_range} avg")

    # Add anonymized statistics
    total_spending = sum(t["amount"] for t in transactions)
    lines.append(f"\nTotal transactions: {len(transactions)}")
    lines.append(f"Total spending range: {_get_amount_range(total_spending)}")

    # Add subscription count (no names)
    if "subscriptions" in heuristic_results:
        sub_count = len(heuristic_results.get("subscriptions", []))
        lines.append(f"Detected recurring payments: {sub_count}")

    return "\n".join(lines)


def _get_amount_range(amount: float) -> str:
    """Convert exact amount to a range for privacy."""
    if amount < 10:
        return "$0-10"
    elif amount < 25:
        return "$10-25"
    elif amount < 50:
        return "$25-50"
    elif amount < 100:
        return "$50-100"
    elif amount < 250:
        return "$100-250"
    elif amount < 500:
        return "$250-500"
    elif amount < 1000:
        return "$500-1000"
    elif amount < 2500:
        return "$1000-2500"
    elif amount < 5000:
        return "$2500-5000"
    elif amount < 10000:
        return "$5000-10000"
    else:
        return "$10000+"
