"""AI Router — cascading multi-provider strategy for cost-efficient, reliable AI.

Routing logic (cheapest/fastest first):
  1. DB cache (0ms, $0) — known merchant/pattern
  2. Ollama local (200ms, $0) — self-hosted, infinite quota
  3. Groq free tier (300ms, $0) — 14,400 req/day free, Llama 70B quality
  4. Gemini Flash free tier (500ms, $0) — 1,500 req/day free
  5. Claude Haiku (1s, $0.0003) — paid fallback, 10× cheaper than Sonnet
  6. Claude Sonnet (2s, $0.015) — premium feature only

Each provider is tried in order. Failed/unavailable providers are skipped.
Results from any provider are written back to the DB cache for future requests.
"""

import os
import json
import logging
import hashlib
import time
import re
from typing import Optional
from abc import ABC, abstractmethod
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ─── Task types ──────────────────────────────────────────────────────────────

class TaskType:
    CATEGORIZE_MERCHANT   = "categorize_merchant"    # Tier 1-3 sufficient
    BATCH_ENRICHMENT      = "batch_enrichment"        # Groq free tier ideal
    SAVINGS_STRATEGY      = "savings_strategy"        # Gemini+ quality needed
    PREMIUM_STRATEGY      = "premium_strategy"        # Claude Sonnet only
    PDF_EXTRACTION        = "pdf_extraction"          # Extract transactions from messy PDF text


# ─── Provider base class ─────────────────────────────────────────────────────

@dataclass
class AIResult:
    content: dict
    provider: str
    latency_ms: int
    cost_usd: float = 0.0
    confidence: float = 1.0


class AIProvider(ABC):
    name: str = "base"
    cost_per_1k_tokens: float = 0.0

    @abstractmethod
    def is_available(self) -> bool:
        """Check if this provider can handle a request right now."""
        ...

    @abstractmethod
    def complete(self, prompt: str, task: str, max_tokens: int = 800) -> Optional[dict]:
        """Run the prompt and return parsed JSON dict, or None on failure."""
        ...

    def run(self, prompt: str, task: str, max_tokens: int = 800) -> Optional[AIResult]:
        if not self.is_available():
            return None
        start = time.monotonic()
        try:
            result = self.complete(prompt, task, max_tokens)
            if result is None:
                return None
            ms = int((time.monotonic() - start) * 1000)
            estimated_tokens = len(prompt.split()) + max_tokens
            cost = (estimated_tokens / 1000) * self.cost_per_1k_tokens
            return AIResult(content=result, provider=self.name, latency_ms=ms, cost_usd=cost)
        except Exception as e:
            logger.warning(f"[{self.name}] failed: {e}")
            return None


def _extract_json(text: str) -> Optional[dict]:
    """Extract JSON from LLM response, handling markdown code blocks."""
    text = text.strip()
    # Strip markdown code fences
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    # Find first { ... } block
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


# ─── Provider implementations ─────────────────────────────────────────────────

class OllamaProvider(AIProvider):
    """Local Ollama — zero cost, zero latency, infinite quota.

    Best for: merchant categorization, subscription keyword extraction.
    Runs on your own hardware — no API key, no rate limits.
    """
    name = "ollama"
    cost_per_1k_tokens = 0.0

    def __init__(self, model: str = "llama3.2:3b"):
        self.model = model
        self.base_url = os.getenv("OLLAMA_URL", "http://localhost:11434")

    def is_available(self) -> bool:
        try:
            import urllib.request
            req = urllib.request.Request(f"{self.base_url}/api/tags", method="GET")
            with urllib.request.urlopen(req, timeout=2) as r:
                data = json.loads(r.read())
                available = [m["name"] for m in data.get("models", [])]
                return any(self.model.split(":")[0] in m for m in available)
        except Exception:
            return False

    def complete(self, prompt: str, task: str, max_tokens: int = 800) -> Optional[dict]:
        import urllib.request, urllib.error
        payload = json.dumps({
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"num_predict": max_tokens, "temperature": 0.1},
        }).encode()
        req = urllib.request.Request(
            f"{self.base_url}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                response = json.loads(r.read())
                return _extract_json(response.get("response", ""))
        except Exception as e:
            logger.debug(f"Ollama error: {e}")
            return None


class GroqProvider(AIProvider):
    """Groq free tier — 14,400 req/day, Llama 3.3 70B at 750 tokens/sec.

    Best for: batch enrichment, merchant resolution, free categorization quota.
    Free signup at console.groq.com — no credit card required for free tier.
    """
    name = "groq"
    cost_per_1k_tokens = 0.0  # free tier

    MODELS = {
        "fast": "llama-3.1-8b-instant",      # 750 tok/s, great for categorization
        "quality": "llama-3.3-70b-versatile", # 280 tok/s, Claude Haiku quality
    }

    def __init__(self, quality: str = "fast"):
        self.model = self.MODELS.get(quality, self.MODELS["fast"])
        self._api_key = os.getenv("GROQ_API_KEY")

    def is_available(self) -> bool:
        return bool(self._api_key)

    def complete(self, prompt: str, task: str, max_tokens: int = 800) -> Optional[dict]:
        try:
            from groq import Groq
            client = Groq(api_key=self._api_key)
            response = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            text = response.choices[0].message.content
            return _extract_json(text) if text else None
        except Exception as e:
            logger.warning(f"Groq error: {e}")
            return None


class GeminiProvider(AIProvider):
    """Google Gemini — free tier: 1,500 req/day, 1M tokens/day.

    Best for: savings strategy fallback when Claude is down or budget-constrained.
    Free API key: aistudio.google.com
    Uses the new google-genai SDK (google.generativeai is deprecated).
    """
    name = "gemini"
    cost_per_1k_tokens = 0.000075  # Flash pricing after free tier exhausted

    MODELS = {
        "fast": "gemini-2.5-flash",
        "quality": "gemini-2.5-pro",
    }

    def __init__(self, quality: str = "fast"):
        self.model = self.MODELS.get(quality, self.MODELS["fast"])
        self._api_key = os.getenv("GEMINI_API_KEY")

    def is_available(self) -> bool:
        return bool(self._api_key)

    def complete(self, prompt: str, task: str, max_tokens: int = 800) -> Optional[dict]:
        try:
            from google import genai
            client = genai.Client(api_key=self._api_key)
            response = client.models.generate_content(
                model=self.model,
                contents=prompt + "\n\nRespond ONLY with valid JSON, no other text.",
            )
            return _extract_json(response.text) if response.text else None
        except Exception as e:
            logger.warning(f"Gemini error: {e}")
            return None


class ClaudeHaikuProvider(AIProvider):
    """Claude Haiku — 10× cheaper than Sonnet, good for standard strategies.

    Best for: paying users who need strategy but not Sonnet quality.
    Cost: ~$0.0003 per analysis vs $0.015 for Sonnet.
    """
    name = "claude_haiku"
    cost_per_1k_tokens = 0.00025

    def __init__(self):
        self._api_key = os.getenv("ANTHROPIC_API_KEY")

    def is_available(self) -> bool:
        return bool(self._api_key)

    def complete(self, prompt: str, task: str, max_tokens: int = 800) -> Optional[dict]:
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=self._api_key)
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )
            text = response.content[0].text
            return _extract_json(text) if text else None
        except Exception as e:
            logger.warning(f"Claude Haiku error: {e}")
            return None


class ClaudeSonnetProvider(AIProvider):
    """Claude Sonnet — premium quality, gated behind Pro tier.

    Best for: personalized investment plans, complex multi-month strategies.
    Do not use for basic categorization — massive cost overkill.
    """
    name = "claude_sonnet"
    cost_per_1k_tokens = 0.003

    def __init__(self):
        self._api_key = os.getenv("ANTHROPIC_API_KEY")

    def is_available(self) -> bool:
        return bool(self._api_key)

    def complete(self, prompt: str, task: str, max_tokens: int = 1500) -> Optional[dict]:
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=self._api_key)
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )
            text = response.content[0].text
            return _extract_json(text) if text else None
        except Exception as e:
            logger.warning(f"Claude Sonnet error: {e}")
            return None


# ─── In-process result cache ──────────────────────────────────────────────────

class ResultCache:
    """Thread-safe in-memory cache with TTL.

    In production: swap this backend for Redis so cache survives restarts
    and is shared across all worker processes.
    """

    def __init__(self):
        self._store: dict[str, tuple[dict, float]] = {}

    def _key(self, task: str, prompt_hash: str) -> str:
        return f"{task}:{prompt_hash}"

    def get(self, task: str, prompt: str, ttl_seconds: int = 86400) -> Optional[dict]:
        key = self._key(task, hashlib.sha256(prompt.encode()).hexdigest()[:16])
        entry = self._store.get(key)
        if entry and (time.time() - entry[1]) < ttl_seconds:
            return entry[0]
        if entry:
            del self._store[key]
        return None

    def set(self, task: str, prompt: str, value: dict) -> None:
        key = self._key(task, hashlib.sha256(prompt.encode()).hexdigest()[:16])
        # Evict oldest 10% if cache exceeds 500 entries
        if len(self._store) >= 500:
            oldest = sorted(self._store.items(), key=lambda x: x[1][1])[:50]
            for k, _ in oldest:
                del self._store[k]
        self._store[key] = (value, time.time())


# ─── The Router ───────────────────────────────────────────────────────────────

class AIRouter:
    """Cascading multi-provider AI router.

    Routes each task to the cheapest/fastest available provider that meets
    quality requirements. Falls back up the chain only when needed.

    Usage:
        router = AIRouter()
        result = router.route(TaskType.CATEGORIZE_MERCHANT, prompt)
        result = router.route(TaskType.SAVINGS_STRATEGY, prompt, require_premium=False)
        result = router.route(TaskType.PREMIUM_STRATEGY, prompt, require_premium=True)
    """

    # Provider chains per task type (best free quality → paid)
    CHAINS: dict[str, list[str]] = {
        TaskType.CATEGORIZE_MERCHANT: [
            "groq_fast",        # Llama 3.1 8B @ 750 tok/s — free, accurate, 14K/day quota
            "groq_quality",     # Llama 3.3 70B — higher accuracy if fast quota exhausted
            "gemini",           # Gemini Flash free tier — 1,500/day fallback
            "ollama",           # Local offline fallback — no network needed, 3B less accurate
        ],
        TaskType.BATCH_ENRICHMENT: [
            "groq_quality",     # Llama 70B for overnight batch — best free quality
            "gemini",           # Fallback
            "ollama",           # Offline fallback
        ],
        TaskType.SAVINGS_STRATEGY: [
            "groq_quality",     # Llama 70B — surprisingly good for strategy, free tier
            "gemini",           # Gemini Flash — free, solid structured output
            "claude_haiku",     # Paid fallback — 10× cheaper than Sonnet
            "claude_sonnet",    # Last resort if all free tiers exhausted
        ],
        TaskType.PREMIUM_STRATEGY: [
            "claude_sonnet",    # Pro feature — always use best model
            "gemini_quality",   # Fallback only if Claude is down
            "groq_quality",     # Emergency fallback
        ],
        TaskType.PDF_EXTRACTION: [
            "groq_quality",     # Llama 70B — best free structured extraction
            "gemini",           # Gemini Flash free tier fallback
            "claude_haiku",     # Paid fallback
        ],
    }

    def __init__(self):
        self._providers: dict[str, AIProvider] = {
            "ollama":         OllamaProvider("llama3.2:3b"),
            "groq_fast":      GroqProvider("fast"),
            "groq_quality":   GroqProvider("quality"),
            "gemini":         GeminiProvider("fast"),
            "gemini_quality": GeminiProvider("quality"),
            "claude_haiku":   ClaudeHaikuProvider(),
            "claude_sonnet":  ClaudeSonnetProvider(),
        }
        self._cache = ResultCache()
        self._stats: dict[str, int] = {}   # provider → success count

    def route(
        self,
        task: str,
        prompt: str,
        max_tokens: int = 800,
        cache_ttl: int = 86400,
    ) -> Optional[AIResult]:
        """Route a task through the provider cascade.

        Returns the first successful result, or None if all providers fail.
        Successful results are cached and re-used for identical inputs.
        """
        # ── Cache check ──
        cached = self._cache.get(task, prompt, ttl_seconds=cache_ttl)
        if cached is not None:
            return AIResult(content=cached, provider="cache", latency_ms=0)

        chain = self.CHAINS.get(task, [])
        for provider_key in chain:
            provider = self._providers.get(provider_key)
            if provider is None:
                continue

            result = provider.run(prompt, task, max_tokens)
            if result is not None:
                # ── Cache the result ──
                self._cache.set(task, prompt, result.content)
                # ── Track stats ──
                self._stats[provider_key] = self._stats.get(provider_key, 0) + 1
                logger.info(
                    f"[router] task={task} provider={provider_key} "
                    f"latency={result.latency_ms}ms cost=${result.cost_usd:.5f}"
                )
                return result

        logger.warning(f"[router] all providers failed for task={task}")
        return None

    def get_stats(self) -> dict:
        """Return provider usage statistics for monitoring."""
        return {
            "provider_hits": self._stats.copy(),
            "cache_size": len(self._cache._store),
        }

    def health_check(self) -> dict:
        """Check which providers are currently available."""
        return {
            name: provider.is_available()
            for name, provider in self._providers.items()
        }


# ─── Prompt templates ─────────────────────────────────────────────────────────

def merchant_categorization_prompt(merchant_name: str) -> str:
    """Minimal prompt for fast local model categorization."""
    return f"""Categorize this bank transaction merchant. Reply with JSON only.

Merchant: "{merchant_name}"

Categories: Streaming, Music, Gaming, Software, Fitness, Food Delivery,
Groceries, Transport, Utilities, Phone/Internet, Insurance, Banking Fee,
Shopping, Travel, Health, Education, Other

JSON format:
{{"category": "...", "is_subscription": true/false, "confidence": 0.0-1.0}}"""


def savings_strategy_prompt(anonymized_summary: str) -> str:
    """Full strategy prompt for Gemini/Claude."""
    return f"""You are a smart personal finance advisor. Analyze this anonymized spending data and provide a practical savings and investment strategy.

{anonymized_summary}

Provide a JSON response with:
- "easy_wins": array of {{title, estimated_yearly_savings (number), action}}
- "recovery_plan": array of action steps (strings)
- "savings_strategy": {{
    "headline": "one punchy sentence about their opportunity",
    "monthly_plan": [{{step, amount (or null), rationale}}],
    "milestones": [{{timeframe, milestone}}],
    "investment_split": {{emergency_fund_pct, index_fund_pct, retirement_pct}}
  }}

Rules: practical advice only, no guaranteed returns, note "not financial advice".
Respond ONLY with valid JSON."""


# ─── Singleton ────────────────────────────────────────────────────────────────

_router: Optional[AIRouter] = None


def get_router() -> AIRouter:
    """Get the singleton router instance."""
    global _router
    if _router is None:
        _router = AIRouter()
    return _router
