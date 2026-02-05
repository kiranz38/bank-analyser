"""Claude API integration for enhanced spending analysis."""

import os
import json
from typing import Optional
from anthropic import Anthropic


def get_claude_analysis(transactions: list[dict], heuristic_results: dict) -> Optional[dict]:
    """
    Send transactions to Claude for enhanced analysis.

    Returns enhanced analysis or None if API unavailable.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    try:
        client = Anthropic(api_key=api_key)

        # Prepare transaction summary for Claude
        transaction_summary = _prepare_transaction_summary(transactions)

        prompt = f"""Analyze this bank statement data and provide insights about spending patterns, subscriptions, and potential savings.

Transaction Summary:
{transaction_summary}

Heuristic Analysis Results:
{json.dumps(heuristic_results, indent=2)}

Please enhance this analysis by:
1. Identifying any additional patterns or subscriptions the heuristics might have missed
2. Providing better categorization for merchants
3. Suggesting specific, actionable "easy wins" for saving money
4. Creating a personalized recovery plan based on the spending patterns

Respond with a JSON object containing:
- "enhanced_leaks": array of any additional leaks found (same format as top_leaks)
- "category_improvements": object mapping merchant names to better categories
- "easy_wins": array of actionable savings opportunities with title, estimated_yearly_savings, and action
- "recovery_plan": array of specific steps (strings) for this user

Important: Focus on practical financial advice. Do not provide investment advice. Keep suggestions realistic and achievable.

Respond ONLY with valid JSON, no other text."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
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
        print(f"Claude API error: {e}")
        return None


def _prepare_transaction_summary(transactions: list[dict]) -> str:
    """Prepare a summary of transactions for Claude."""
    # Group by merchant
    merchant_totals = {}
    for t in transactions:
        merchant = t["merchant"]
        if merchant not in merchant_totals:
            merchant_totals[merchant] = {"count": 0, "total": 0, "amounts": []}
        merchant_totals[merchant]["count"] += 1
        merchant_totals[merchant]["total"] += t["amount"]
        merchant_totals[merchant]["amounts"].append(t["amount"])

    # Sort by total spending
    sorted_merchants = sorted(
        merchant_totals.items(),
        key=lambda x: x[1]["total"],
        reverse=True
    )

    lines = ["Top merchants by spending:"]
    for merchant, data in sorted_merchants[:20]:
        avg = data["total"] / data["count"]
        lines.append(f"- {merchant}: ${data['total']:.2f} total, {data['count']} transactions, ${avg:.2f} avg")

    lines.append(f"\nTotal transactions: {len(transactions)}")
    lines.append(f"Total spending: ${sum(t['amount'] for t in transactions):.2f}")

    return "\n".join(lines)
