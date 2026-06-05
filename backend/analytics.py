"""Analytics engine — captures aggregate metrics after every analysis.

Stores anonymised, non-personal data only:
  - No merchant names, no transaction descriptions
  - Only category totals (bucketed), counts, derived metrics
  - Each analysis event is one row — no user identity

Schema lives in SQLite (zero-config MVP).
Migration path to PostgreSQL: change DATABASE_URL env var.
"""

import os
import json
import sqlite3
import logging
from datetime import datetime, date, timedelta
from typing import Optional
from contextlib import contextmanager

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "analytics.db")


# ─── Schema ──────────────────────────────────────────────────────────────────

SCHEMA = """
CREATE TABLE IF NOT EXISTS analysis_events (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at          TEXT DEFAULT (datetime('now')),
    country             TEXT,           -- AU, US, UK, CA, NZ (from bank format)
    bank_format         TEXT,           -- anz-au, chase, westpac, etc.
    monthly_leak        REAL,
    annual_savings      REAL,
    transaction_count   INTEGER,
    subscription_count  INTEGER,
    has_overdraft_fees  INTEGER,        -- 0 or 1
    has_bank_fees       INTEGER,        -- 0 or 1
    ai_provider_used    TEXT,           -- groq, gemini, ollama, claude_sonnet, none
    parse_time_ms       INTEGER,
    health_score        INTEGER,        -- 0-100
    category_totals     TEXT            -- JSON: {category: total_amount}
);

CREATE TABLE IF NOT EXISTS daily_rollups (
    rollup_date         TEXT PRIMARY KEY,   -- YYYY-MM-DD
    analyses_count      INTEGER DEFAULT 0,
    avg_monthly_leak    REAL DEFAULT 0,
    median_monthly_leak REAL DEFAULT 0,
    total_savings_found REAL DEFAULT 0,
    avg_subscription_count REAL DEFAULT 0,
    overdraft_rate      REAL DEFAULT 0,     -- fraction 0.0-1.0
    bank_fee_rate       REAL DEFAULT 0,
    avg_health_score    REAL DEFAULT 0,
    bank_format_counts  TEXT DEFAULT '{}',  -- JSON
    country_counts      TEXT DEFAULT '{}',  -- JSON
    ai_provider_counts  TEXT DEFAULT '{}',  -- JSON
    category_totals_sum TEXT DEFAULT '{}',  -- JSON: aggregate spending by category
    leak_histogram      TEXT DEFAULT '{}'   -- JSON: bucket → count
);
"""


@contextmanager
def _db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        conn.executescript(SCHEMA)
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Analytics DB error: {e}")
        raise
    finally:
        conn.close()


# ─── Write ────────────────────────────────────────────────────────────────────

_BANK_COUNTRY_MAP = {
    "anz-au": "AU", "commbank": "AU", "westpac": "AU", "nab": "AU",
    "anz-nz": "NZ",
    "chase": "US", "bank-of-america": "US", "wells-fargo": "US",
    "td-bank-us": "US", "td-bank-ca": "CA",
    "barclays": "UK", "hsbc": "UK",
}

_LEAK_BUCKETS = [
    (0, 50, "$0-50"), (50, 100, "$50-100"), (100, 200, "$100-200"),
    (200, 300, "$200-300"), (300, 500, "$300-500"), (500, 750, "$500-750"),
    (750, 1000, "$750-1k"), (1000, 9999, "$1k+"),
]


def _leak_bucket(amount: float) -> str:
    for lo, hi, label in _LEAK_BUCKETS:
        if lo <= amount < hi:
            return label
    return "$1k+"


def record_analysis(
    result: dict,
    bank_format: Optional[str] = None,
    ai_provider: Optional[str] = None,
    parse_time_ms: Optional[int] = None,
) -> None:
    """Write one anonymised analysis event to the DB.

    Called automatically by the /analyze endpoint after every successful parse.
    """
    try:
        country = _BANK_COUNTRY_MAP.get(bank_format or "", "unknown")
        monthly_leak = result.get("monthly_leak", 0) or 0
        subscriptions = result.get("subscriptions", [])
        top_leaks = result.get("top_leaks", [])
        health = (result.get("financial_health") or {}).get("score")

        has_overdraft = any(
            "OVERDRAFT" in (leak.get("merchant", "")).upper()
            or "NSF" in (leak.get("merchant", "")).upper()
            for leak in top_leaks
        )
        has_bank_fees = any(
            leak.get("category") == "Fees & Charges"
            for leak in top_leaks
        )

        # Category totals — only amounts, no merchant names
        cat_totals: dict[str, float] = {}
        for item in result.get("category_summary", []):
            cat = item.get("category", "Other")
            total = item.get("total", 0) or 0
            if cat and total:
                cat_totals[cat] = round(total, 2)

        txn_count = sum(item.get("count", 0) for item in result.get("category_summary", []))

        with _db() as conn:
            conn.execute("""
                INSERT INTO analysis_events
                (country, bank_format, monthly_leak, annual_savings,
                 transaction_count, subscription_count, has_overdraft_fees,
                 has_bank_fees, ai_provider_used, parse_time_ms, health_score,
                 category_totals)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                country,
                bank_format or "unknown",
                round(monthly_leak, 2),
                round(monthly_leak * 12, 2),
                txn_count,
                len(subscriptions),
                1 if has_overdraft else 0,
                1 if has_bank_fees else 0,
                ai_provider or "none",
                parse_time_ms,
                health,
                json.dumps(cat_totals),
            ))

        _refresh_today_rollup()

    except Exception as e:
        logger.warning(f"Failed to record analytics event: {e}")


# ─── Rollup ───────────────────────────────────────────────────────────────────

def _refresh_today_rollup() -> None:
    """Recompute today's rollup from raw events — called after each insert."""
    today = date.today().isoformat()
    try:
        with _db() as conn:
            rows = conn.execute("""
                SELECT monthly_leak, subscription_count, has_overdraft_fees,
                       has_bank_fees, ai_provider_used, bank_format, country,
                       health_score, category_totals, annual_savings
                FROM analysis_events
                WHERE date(created_at) = ?
            """, (today,)).fetchall()

            if not rows:
                return

            leaks = [r["monthly_leak"] or 0 for r in rows]
            sorted_leaks = sorted(leaks)
            n = len(sorted_leaks)
            median = sorted_leaks[n // 2] if n else 0

            bank_counts: dict[str, int] = {}
            country_counts: dict[str, int] = {}
            ai_counts: dict[str, int] = {}
            cat_sums: dict[str, float] = {}
            leak_hist: dict[str, int] = {}

            total_subs = 0
            overdraft_count = 0
            bank_fee_count = 0
            health_scores = []
            total_savings = 0

            for r in rows:
                bank_counts[r["bank_format"]] = bank_counts.get(r["bank_format"], 0) + 1
                country_counts[r["country"]] = country_counts.get(r["country"], 0) + 1
                ai_counts[r["ai_provider_used"]] = ai_counts.get(r["ai_provider_used"], 0) + 1
                total_subs += r["subscription_count"] or 0
                overdraft_count += r["has_overdraft_fees"] or 0
                bank_fee_count += r["has_bank_fees"] or 0
                if r["health_score"] is not None:
                    health_scores.append(r["health_score"])
                total_savings += r["annual_savings"] or 0
                bucket = _leak_bucket(r["monthly_leak"] or 0)
                leak_hist[bucket] = leak_hist.get(bucket, 0) + 1
                try:
                    cats = json.loads(r["category_totals"] or "{}")
                    for cat, amt in cats.items():
                        cat_sums[cat] = cat_sums.get(cat, 0) + amt
                except Exception:
                    pass

            conn.execute("""
                INSERT OR REPLACE INTO daily_rollups
                (rollup_date, analyses_count, avg_monthly_leak, median_monthly_leak,
                 total_savings_found, avg_subscription_count, overdraft_rate,
                 bank_fee_rate, avg_health_score, bank_format_counts,
                 country_counts, ai_provider_counts, category_totals_sum, leak_histogram)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                today,
                n,
                round(sum(leaks) / n, 2),
                round(median, 2),
                round(total_savings, 2),
                round(total_subs / n, 2),
                round(overdraft_count / n, 4),
                round(bank_fee_count / n, 4),
                round(sum(health_scores) / len(health_scores), 1) if health_scores else None,
                json.dumps(bank_counts),
                json.dumps(country_counts),
                json.dumps(ai_counts),
                json.dumps({k: round(v, 2) for k, v in cat_sums.items()}),
                json.dumps(leak_hist),
            ))
    except Exception as e:
        logger.warning(f"Rollup error: {e}")


# ─── Read — Admin API ─────────────────────────────────────────────────────────

def get_summary_stats(days: int = 30) -> dict:
    """Return high-level stats for the admin dashboard summary cards."""
    try:
        with _db() as conn:
            since = (date.today() - timedelta(days=days)).isoformat()

            row = conn.execute("""
                SELECT
                    COUNT(*)                        AS total_analyses,
                    ROUND(AVG(monthly_leak), 2)     AS avg_monthly_leak,
                    ROUND(MAX(monthly_leak), 2)     AS max_monthly_leak,
                    ROUND(SUM(annual_savings), 2)   AS total_savings_identified,
                    ROUND(AVG(subscription_count), 1) AS avg_subscriptions,
                    ROUND(AVG(CASE WHEN has_overdraft_fees=1 THEN 100.0 ELSE 0 END), 1) AS overdraft_pct,
                    ROUND(AVG(health_score), 1)     AS avg_health_score,
                    COUNT(DISTINCT country)         AS countries_seen,
                    COUNT(DISTINCT bank_format)     AS bank_formats_seen
                FROM analysis_events
                WHERE date(created_at) >= ?
            """, (since,)).fetchone()

            return dict(row) if row else {}
    except Exception as e:
        logger.warning(f"get_summary_stats error: {e}")
        return {}


def get_daily_trend(days: int = 30) -> list[dict]:
    """Return daily rollups for trend charts."""
    try:
        with _db() as conn:
            since = (date.today() - timedelta(days=days)).isoformat()
            rows = conn.execute("""
                SELECT rollup_date, analyses_count, avg_monthly_leak,
                       median_monthly_leak, total_savings_found,
                       avg_subscription_count, overdraft_rate, avg_health_score
                FROM daily_rollups
                WHERE rollup_date >= ?
                ORDER BY rollup_date ASC
            """, (since,)).fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        logger.warning(f"get_daily_trend error: {e}")
        return []


def get_bank_distribution(days: int = 30) -> list[dict]:
    """Return bank format usage counts."""
    try:
        with _db() as conn:
            since = (date.today() - timedelta(days=days)).isoformat()
            rows = conn.execute("""
                SELECT bank_format, COUNT(*) AS count,
                       ROUND(AVG(monthly_leak), 2) AS avg_leak
                FROM analysis_events
                WHERE date(created_at) >= ?
                GROUP BY bank_format
                ORDER BY count DESC
            """, (since,)).fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        return []


def get_country_distribution(days: int = 30) -> list[dict]:
    """Return geographic distribution."""
    try:
        with _db() as conn:
            since = (date.today() - timedelta(days=days)).isoformat()
            rows = conn.execute("""
                SELECT country, COUNT(*) AS count,
                       ROUND(AVG(monthly_leak), 2) AS avg_leak,
                       ROUND(AVG(health_score), 1) AS avg_health_score
                FROM analysis_events
                WHERE date(created_at) >= ?
                GROUP BY country
                ORDER BY count DESC
            """, (since,)).fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        return []


def get_category_aggregates(days: int = 30) -> list[dict]:
    """Return aggregate spending totals by category across all users."""
    try:
        with _db() as conn:
            since = (date.today() - timedelta(days=days)).isoformat()
            rows = conn.execute("""
                SELECT category_totals FROM analysis_events
                WHERE date(created_at) >= ?
                  AND category_totals IS NOT NULL
            """, (since,)).fetchall()

            totals: dict[str, float] = {}
            for r in rows:
                try:
                    cats = json.loads(r["category_totals"])
                    for cat, amt in cats.items():
                        totals[cat] = totals.get(cat, 0) + amt
                except Exception:
                    pass

            return sorted(
                [{"category": k, "total": round(v, 2)} for k, v in totals.items()],
                key=lambda x: x["total"],
                reverse=True,
            )
    except Exception as e:
        return []


def get_ai_provider_stats(days: int = 30) -> list[dict]:
    """Return which AI providers are being used — for monitoring AI router health."""
    try:
        with _db() as conn:
            since = (date.today() - timedelta(days=days)).isoformat()
            rows = conn.execute("""
                SELECT ai_provider_used AS provider,
                       COUNT(*) AS count,
                       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS pct
                FROM analysis_events
                WHERE date(created_at) >= ?
                GROUP BY ai_provider_used
                ORDER BY count DESC
            """, (since,)).fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        return []


def get_leak_histogram(days: int = 30) -> list[dict]:
    """Return distribution of monthly leak amounts — shows where most users fall."""
    try:
        with _db() as conn:
            since = (date.today() - timedelta(days=days)).isoformat()
            rows = conn.execute("""
                SELECT monthly_leak FROM analysis_events
                WHERE date(created_at) >= ?
            """, (since,)).fetchall()

            hist: dict[str, int] = {}
            for r in rows:
                bucket = _leak_bucket(r["monthly_leak"] or 0)
                hist[bucket] = hist.get(bucket, 0) + 1

            bucket_order = [label for _, _, label in _LEAK_BUCKETS]
            return [
                {"bucket": b, "count": hist.get(b, 0)}
                for b in bucket_order
            ]
    except Exception as e:
        return []


def get_full_dashboard(days: int = 30) -> dict:
    """Assemble all metrics for the admin dashboard in one call."""
    return {
        "period_days": days,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "summary": get_summary_stats(days),
        "daily_trend": get_daily_trend(days),
        "by_bank": get_bank_distribution(days),
        "by_country": get_country_distribution(days),
        "by_category": get_category_aggregates(days),
        "by_ai_provider": get_ai_provider_stats(days),
        "leak_distribution": get_leak_histogram(days),
    }
