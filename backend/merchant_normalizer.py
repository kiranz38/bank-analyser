"""Merchant normalization using sentence transformer embeddings.

Phase 2 of the ML parser plan.

Problem: Banks write the same merchant in dozens of ways:
  - "SQ *STARBUCKS #4821 SAN JOSE CA"
  - "STARBUCKS STORE 00004821"
  - "SBUX**MOBILE ORDER"
  → all the same entity, but the subscription detector treats them as 3 merchants.

Solution: Embed merchant strings into a shared vector space.
  Strings that mean the same thing land close together regardless of formatting.
  No training data needed — the model already knows "SBUX" ≈ "Starbucks".

Model: all-MiniLM-L6-v2
  - 22MB, runs on CPU in ~5ms per batch
  - Pre-trained on 1B+ sentence pairs from Common Crawl, Reddit, Wikipedia
  - Cosine similarity threshold 0.82 → same entity (tuned empirically)
"""

import re
import hashlib
import logging
from typing import Optional
from functools import lru_cache

logger = logging.getLogger(__name__)

# Cosine similarity threshold for "same merchant"
SIMILARITY_THRESHOLD = 0.82

# Pre-cleaning rules applied before embedding
# Removes noise that would push embeddings apart despite being the same entity
_NOISE_PATTERNS = [
    (r'\bSQ\s*\*\s*', ''),           # Square payment prefix
    (r'\bSP\s+', ''),                # Stripe payment prefix
    (r'\bPAYPAL\s*\*\s*', ''),       # PayPal
    (r'\bPP\*', ''),
    (r'#\d+', ''),                   # Location numbers (#4821)
    (r'\b\d{4,}\b', ''),             # Long digit strings (card refs)
    (r'\b[A-Z]{2,3}\b$', ''),        # Trailing country codes (CA, AU, US, GBR)
    (r'\*+', ' '),                   # Asterisks used as separators
    (r'[/\\]', ' '),                 # Slashes
    (r'\.COM\b', ''),                # .com suffix
    (r'\.NET\b', ''),
    (r'\.IO\b', ''),
    (r'\s+', ' '),                   # Normalize whitespace
]

# Known abbreviation/alias expansions — Groq populates this at runtime.
# Maps short bank codes / tickers / abbreviations → full brand name.
# This is the "learning database": every time Groq resolves a new alias,
# it's added here and served instantly forever after.
MERCHANT_ALIASES: dict[str, str] = {
    # Tickers that banks use as merchant codes
    "SBUX": "STARBUCKS",
    "MCD": "MCDONALDS",
    "AMZ": "AMAZON",
    "AMZN": "AMAZON",
    "GOOGL": "GOOGLE",
    "GOOG": "GOOGLE",
    "MSFT": "MICROSOFT",
    "AAPL": "APPLE",
    "META": "FACEBOOK",
    # Common bank shorthand
    "MCDS": "MCDONALDS",
    "WFM": "WHOLE FOODS",
    "TJ": "TRADER JOES",
    "TGT": "TARGET",
    "WMT": "WALMART",
    "CVS": "CVS PHARMACY",
    "WLGRN": "WALGREENS",
    # Streaming shorthand
    "NFLX": "NETFLIX",
    "SPOT": "SPOTIFY",
    "DSNP": "DISNEY PLUS",
    "PRMT": "PARAMOUNT PLUS",
}


def _pre_clean(merchant: str) -> str:
    """Pre-cleaning before embedding: remove payment processor noise + expand aliases."""
    text = merchant.upper().strip()
    for pattern, replacement in _NOISE_PATTERNS:
        text = re.sub(pattern, replacement, text)
    text = text.strip()
    # Alias expansion: replace known tickers/abbreviations with full names
    # so "SBUX MOBILE ORDER" → "STARBUCKS MOBILE ORDER" before embedding
    words = text.split()
    expanded = [MERCHANT_ALIASES.get(w, w) for w in words]
    return ' '.join(expanded).strip()


def _load_model():
    """Lazy-load the sentence transformer model."""
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("Sentence transformer model loaded (22MB, CPU)")
        return model
    except ImportError:
        logger.warning("sentence-transformers not installed — merchant normalization disabled")
        return None
    except Exception as e:
        logger.warning(f"Could not load sentence transformer: {e}")
        return None


_model = None


def _get_model():
    global _model
    if _model is None:
        _model = _load_model()
    return _model


class MerchantNormalizer:
    """Normalizes merchant strings to canonical names using embedding similarity.

    Usage:
        normalizer = MerchantNormalizer()
        canonical = normalizer.normalize("SQ *STARBUCKS #4821 SAN JOSE CA")
        # → "STARBUCKS"

    For bulk transaction processing:
        transactions = normalizer.normalize_batch(transactions)
        # Adds 'canonical_merchant' and 'entity_id' fields to each transaction.
    """

    def __init__(self, similarity_threshold: float = SIMILARITY_THRESHOLD):
        self.threshold = similarity_threshold
        # Cache: pre-cleaned string → canonical name
        self._canonical_cache: dict[str, str] = {}
        # Seen canonical names and their embeddings for comparison
        self._canonical_embeddings: list[tuple[str, list]] = []

    def _embed(self, texts: list[str]):
        """Embed a list of texts. Returns numpy array or None."""
        model = _get_model()
        if model is None:
            return None
        try:
            return model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        except Exception as e:
            logger.warning(f"Embedding error: {e}")
            return None

    def _cosine_sim(self, a, b) -> float:
        """Cosine similarity between two normalized vectors (dot product)."""
        try:
            import numpy as np
            return float(np.dot(a, b))
        except Exception:
            return 0.0

    def normalize(self, merchant: str) -> str:
        """Return the canonical merchant name for a raw bank description string.

        Falls back to a cleaned version of the input if the model is unavailable.
        """
        cleaned = _pre_clean(merchant)

        # Check cache
        if cleaned in self._canonical_cache:
            return self._canonical_cache[cleaned]

        # Try embedding-based matching
        model = _get_model()
        if model is not None and self._canonical_embeddings:
            embedding = self._embed([cleaned])
            if embedding is not None:
                best_match = None
                best_score = 0.0
                for canonical_name, canonical_emb in self._canonical_embeddings:
                    score = self._cosine_sim(embedding[0], canonical_emb)
                    if score > best_score:
                        best_score = score
                        best_match = canonical_name

                if best_score >= self.threshold and best_match:
                    self._canonical_cache[cleaned] = best_match
                    return best_match

                # New canonical — add to known set
                self._canonical_embeddings.append((cleaned, embedding[0].tolist()))
                self._canonical_cache[cleaned] = cleaned
                return cleaned

        # No model or no existing canonicals — use cleaned string
        if model is not None and not self._canonical_embeddings:
            embedding = self._embed([cleaned])
            if embedding is not None:
                self._canonical_embeddings.append((cleaned, embedding[0].tolist()))

        self._canonical_cache[cleaned] = cleaned
        return cleaned

    def normalize_batch(self, transactions: list[dict]) -> list[dict]:
        """Normalize all merchants in a transaction list.

        For efficiency, embeds all unique merchants in a single batch call.
        Adds 'canonical_merchant' and 'entity_id' to each transaction.
        """
        if not transactions:
            return transactions

        # Collect unique merchants
        unique_merchants = list({t.get("merchant", "") for t in transactions if t.get("merchant")})
        if not unique_merchants:
            return transactions

        cleaned_map = {m: _pre_clean(m) for m in unique_merchants}
        unique_cleaned = list(set(cleaned_map.values()))

        model = _get_model()
        canonical_map: dict[str, str] = {}

        if model is not None:
            try:
                embeddings = self._embed(unique_cleaned)
                if embeddings is not None:
                    import numpy as np
                    # For each cleaned merchant, find the closest existing canonical
                    # or register it as a new canonical
                    for i, cleaned in enumerate(unique_cleaned):
                        emb = embeddings[i]

                        if cleaned in self._canonical_cache:
                            canonical_map[cleaned] = self._canonical_cache[cleaned]
                            continue

                        best_match = None
                        best_score = 0.0
                        for canonical_name, canonical_emb in self._canonical_embeddings:
                            score = self._cosine_sim(emb, canonical_emb)
                            if score > best_score:
                                best_score = score
                                best_match = canonical_name

                        if best_score >= self.threshold and best_match:
                            canonical_map[cleaned] = best_match
                        else:
                            # New canonical entity
                            self._canonical_embeddings.append((cleaned, emb.tolist()))
                            canonical_map[cleaned] = cleaned

                        self._canonical_cache[cleaned] = canonical_map[cleaned]
            except Exception as e:
                logger.warning(f"Batch normalization error: {e}")

        # Assign canonical merchants to transactions
        result = []
        for tx in transactions:
            raw = tx.get("merchant", "")
            cleaned = cleaned_map.get(raw, _pre_clean(raw))
            canonical = canonical_map.get(cleaned, cleaned)
            entity_id = hashlib.md5(canonical.encode()).hexdigest()[:8]
            result.append({
                **tx,
                "canonical_merchant": canonical,
                "entity_id": entity_id,
            })

        return result


# Module-level singleton
_normalizer: Optional[MerchantNormalizer] = None


def get_normalizer() -> MerchantNormalizer:
    global _normalizer
    if _normalizer is None:
        _normalizer = MerchantNormalizer()
    return _normalizer


def normalize_transactions(transactions: list[dict]) -> list[dict]:
    """Convenience function — normalize merchants in a transaction list."""
    return get_normalizer().normalize_batch(transactions)
