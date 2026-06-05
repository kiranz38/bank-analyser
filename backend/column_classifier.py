"""ML-powered CSV column type classifier.

Given a CSV column (its header name + a sample of values), predicts which role
the column plays in a bank statement:

    0  date        — transaction date
    1  description — merchant / narration text
    2  debit       — money-out amount (positive numbers in a debit-only column)
    3  credit      — money-in amount (positive numbers in a credit-only column)
    4  amount      — signed amount column (negative = debit, positive = credit)
    5  balance     — running account balance
    6  unknown     — reference number, batch ID, etc.

Two-tier architecture
─────────────────────
  Tier 1 (always available): hand-crafted feature scorer.
    Returns a 7-class probability vector from explicit keyword + value-stat rules.
    Zero external dependencies, deterministic.

  Tier 2 (when sklearn is installed + model file exists): Random Forest.
    Trained on labelled examples generated from our test CSV bank files.
    Loads the 20-feature vector produced by extract_features() and returns
    a probability vector that overrides Tier 1.

Model file: backend/data/column_classifier.pkl
Training:   python column_classifier.py  (standalone mode)
"""

import re
import os
import math
import logging
from typing import Optional
from datetime import datetime

import numpy as np

logger = logging.getLogger(__name__)

# ── Column-type labels ────────────────────────────────────────────────────────

LABELS = ["date", "description", "debit", "credit", "amount", "balance", "unknown"]
DATE = 0
DESCRIPTION = 1
DEBIT = 2
CREDIT = 3
AMOUNT = 4
BALANCE = 5
UNKNOWN = 6

MODEL_PATH = os.path.join(os.path.dirname(__file__), "data", "column_classifier.pkl")

# ── Keyword vocabularies ──────────────────────────────────────────────────────

_DATE_KW = {"date", "posted", "posting", "trans", "transaction", "value", "val",
            "settlement", "effective", "processing", "txn", "entry"}
_DESC_KW = {"description", "desc", "narrative", "narration", "narr", "memo",
            "details", "particulars", "remarks", "payee", "merchant",
            "reference", "ref", "info", "message", "text", "note"}
_DEBIT_KW = {"debit", "withdrawal", "dr", "out", "spent", "charge",
             "payment", "debitamount", "withdrawalamount", "debitamt",
             "withdrawamt", "outflow"}
_CREDIT_KW = {"credit", "deposit", "cr", "in", "received", "creditamount",
              "depositamount", "creditamt", "depositamt", "inflow", "addition"}
_AMOUNT_KW = {"amount", "amt", "sum", "total", "txnamount", "transactionamount",
              "money", "value", "net"}
_BALANCE_KW = {"balance", "bal", "runningbalance", "runningbal", "closingbalance",
               "availablebalance", "ledgerbalance", "availbal", "bookbalance"}


def _kw_score(header: str, vocab: set) -> float:
    """Score header against a keyword vocabulary (0.0 – 1.0)."""
    clean = re.sub(r'[^a-z0-9]', '', header.lower())
    for kw in vocab:
        if kw in clean:
            return 1.0
    return 0.0


# ── Date / numeric value detectors ───────────────────────────────────────────

_DATE_FMTS = [
    "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y",
    "%d %b %Y", "%d %B %Y", "%b %d, %Y", "%Y%m%d",
    "%d/%m/%y", "%m/%d/%y",
]


def _looks_like_date(s: str) -> bool:
    s = s.strip()
    if not s or len(s) < 6:
        return False
    # Quick digit check: at least 4 digits
    if sum(c.isdigit() for c in s) < 4:
        return False
    for fmt in _DATE_FMTS:
        try:
            datetime.strptime(s, fmt)
            return True
        except ValueError:
            pass
    return False


def _parse_num(s: str) -> Optional[float]:
    s = str(s).strip()
    # Handle Unicode minus (U+2212)
    s = s.replace('−', '-')
    s = re.sub(r'[£$€₹¥,\s]', '', s)
    if s.startswith('(') and s.endswith(')'):
        s = '-' + s[1:-1]
    try:
        return float(s)
    except ValueError:
        return None


# ── Feature extraction ────────────────────────────────────────────────────────

def extract_features(header: str, values: list) -> np.ndarray:
    """Produce a 20-element feature vector for a single CSV column.

    Args:
        header: column name string (e.g. "Debit Amount")
        values: sample of cell values (strings or scalars, up to ~50)

    Returns:
        numpy float32 array of shape (20,)
    """
    # ── Keyword features (6) ──────────────────────────────────────────────────
    date_kw = _kw_score(header, _DATE_KW)
    desc_kw = _kw_score(header, _DESC_KW)
    debit_kw = _kw_score(header, _DEBIT_KW)
    credit_kw = _kw_score(header, _CREDIT_KW)
    amount_kw = _kw_score(header, _AMOUNT_KW)
    balance_kw = _kw_score(header, _BALANCE_KW)

    # ── Value analysis ────────────────────────────────────────────────────────
    str_vals = [str(v).strip() for v in values if v is not None and str(v).strip() != '']
    n = len(str_vals) or 1

    date_count = sum(_looks_like_date(v) for v in str_vals)
    num_vals = [_parse_num(v) for v in str_vals]
    numeric = [x for x in num_vals if x is not None]
    n_numeric = len(numeric) or 1

    pct_date = date_count / n                                    # f7
    pct_numeric = len(numeric) / n                               # f8
    pct_empty = 1 - n / max(1, len(values))                     # f9
    pct_negative = sum(x < 0 for x in numeric) / n_numeric      # f10
    pct_positive = sum(x > 0 for x in numeric) / n_numeric      # f11
    pct_zero = sum(x == 0 for x in numeric) / n_numeric         # f12
    avg_length = sum(len(v) for v in str_vals) / n              # f13
    unique_ratio = len(set(str_vals)) / n                        # f14
    has_currency = float(any(re.search(r'[$£€₹¥]', v) for v in str_vals))  # f15

    # Numeric statistics
    if numeric:
        num_mean = abs(sum(numeric) / len(numeric))
        num_std = (sum((x - sum(numeric) / len(numeric)) ** 2 for x in numeric) / len(numeric)) ** 0.5
        num_range = max(numeric) - min(numeric)
    else:
        num_mean = num_std = num_range = 0.0

    num_mean_norm = min(num_mean / 10000, 1.0)                   # f16  (normalised)
    num_std_norm = min(num_std / 5000, 1.0)                      # f17
    num_range_norm = min(num_range / 50000, 1.0)                 # f18

    # Monotonic score: balance columns tend to monotonically trend up or down
    if len(numeric) >= 3:
        inc = sum(b > a for a, b in zip(numeric, numeric[1:]))
        dec = sum(b < a for a, b in zip(numeric, numeric[1:]))
        monotonic_score = max(inc, dec) / (len(numeric) - 1)
    else:
        monotonic_score = 0.0                                     # f19

    # Balance columns often have only slightly varying values (tight std relative to mean)
    cv = (num_std / num_mean) if num_mean > 0 else 1.0           # coefficient of variation
    low_cv = float(cv < 0.3)                                      # f20

    feat = np.array([
        date_kw, desc_kw, debit_kw, credit_kw, amount_kw, balance_kw,   # 0-5
        pct_date, pct_numeric, pct_empty, pct_negative, pct_positive,    # 6-10
        pct_zero, avg_length / 50.0, unique_ratio, has_currency,         # 11-14
        num_mean_norm, num_std_norm, num_range_norm,                      # 15-17
        monotonic_score, low_cv,                                          # 18-19
    ], dtype=np.float32)

    return feat


# ── Rule-based scorer (Tier 1) ────────────────────────────────────────────────

def _rule_based_probs(feat: np.ndarray) -> np.ndarray:
    """Convert feature vector → class probability vector using hand-crafted rules.

    Returns float array shape (7,) summing to ~1.
    """
    scores = np.zeros(7, dtype=np.float64)

    date_kw, desc_kw, debit_kw, credit_kw, amount_kw, balance_kw = feat[:6]
    pct_date, pct_numeric, pct_empty, pct_negative, pct_positive = feat[6:11]
    pct_zero, avg_len, unique_ratio, has_currency = feat[11:15]
    num_mean_norm, num_std_norm, num_range_norm = feat[15:18]
    monotonic_score, low_cv = feat[18:20]

    # --- DATE ---
    scores[DATE] = date_kw * 3.0 + pct_date * 4.0

    # --- DESCRIPTION ---
    scores[DESCRIPTION] = desc_kw * 3.0 + (unique_ratio if unique_ratio > 0.7 else 0) * 2.0
    if avg_len > 0.3 and pct_numeric < 0.1:   # long text, not numeric
        scores[DESCRIPTION] += 1.5
    if pct_date < 0.1 and pct_numeric < 0.2:  # definitely not numeric or date
        scores[DESCRIPTION] += 0.5

    # --- DEBIT ---
    scores[DEBIT] = debit_kw * 4.0
    if pct_zero >= 0.3 and pct_numeric > 0.7:   # debit/credit columns have many zeros
        scores[DEBIT] += 1.0
        scores[CREDIT] += 1.0
    if pct_negative < 0.05 and pct_positive > 0.5:   # all positive → debit-only col
        scores[DEBIT] += 0.5

    # --- CREDIT ---
    scores[CREDIT] = credit_kw * 4.0

    # --- AMOUNT (signed) ---
    scores[AMOUNT] = amount_kw * 3.0
    if pct_negative > 0.2 and pct_positive > 0.2:   # mix of neg/pos → signed amount
        scores[AMOUNT] += 2.0
    if pct_zero < 0.15 and pct_numeric > 0.7:        # mostly populated numbers
        scores[AMOUNT] += 0.5

    # --- BALANCE ---
    scores[BALANCE] = balance_kw * 4.0
    scores[BALANCE] += monotonic_score * 2.0
    if low_cv and pct_numeric > 0.8:                  # tight variation = running total
        scores[BALANCE] += 1.0
    if num_mean_norm > 0.05:                           # balance columns tend to have larger values
        scores[BALANCE] += 0.5

    # --- UNKNOWN ---
    scores[UNKNOWN] = 0.1   # small default bias

    # Softmax
    exp_s = np.exp(scores - scores.max())
    return exp_s / exp_s.sum()


# ── Random Forest tier (Tier 2) ───────────────────────────────────────────────

_rf_model = None
_rf_tried = False


def _load_rf_model():
    global _rf_model, _rf_tried
    if _rf_tried:
        return _rf_model
    _rf_tried = True
    if not os.path.exists(MODEL_PATH):
        return None
    try:
        import pickle
        with open(MODEL_PATH, "rb") as f:
            _rf_model = pickle.load(f)
        logger.info(f"Column classifier: RF model loaded from {MODEL_PATH}")
    except Exception as e:
        logger.warning(f"Column classifier: could not load RF model: {e}")
        _rf_model = None
    return _rf_model


# ── Public API ────────────────────────────────────────────────────────────────

def predict_column_type(
    header: str,
    values: list,
    return_probs: bool = False,
) -> str | tuple[str, dict]:
    """Classify a CSV column into one of the LABELS categories.

    Args:
        header: column header name
        values: list of sample cell values (up to 50 recommended)
        return_probs: if True, return (label, probability_dict)

    Returns:
        Label string, e.g. "debit".  Or (label, probs) if return_probs=True.
    """
    feat = extract_features(header, values)
    model = _load_rf_model()

    if model is not None:
        try:
            probs = model.predict_proba(feat.reshape(1, -1))[0]
        except Exception as e:
            logger.warning(f"RF predict error: {e}, falling back to rule-based")
            probs = _rule_based_probs(feat)
    else:
        probs = _rule_based_probs(feat)

    idx = int(probs.argmax())
    label = LABELS[idx]

    if return_probs:
        prob_dict = {LABELS[i]: round(float(probs[i]), 3) for i in range(7)}
        return label, prob_dict

    return label


def classify_all_columns(
    df,   # pandas DataFrame
    sample_rows: int = 50,
) -> dict[str, str]:
    """Classify every column in a DataFrame.

    Returns dict: {original_column_name: predicted_type}
    """
    result = {}
    for col in df.columns:
        sample = df[col].dropna().head(sample_rows).tolist()
        result[col] = predict_column_type(str(col), sample)
    return result


# ── Training infrastructure ───────────────────────────────────────────────────

def generate_training_examples() -> tuple[list, list]:
    """Build labelled training data from our test CSV bank files.

    Scans backend/tests/statements/**/*.csv, matches known column patterns
    to generate (feature_vector, label) pairs.
    """
    import pandas as pd

    test_root = os.path.join(os.path.dirname(__file__), "..", "tests", "statements")
    X, y = [], []

    # Known ground-truth column maps for each bank format
    # Tuples: (column_header_substring → label)
    known_maps = [
        # (header_contains, label, notes)
        ("date", DATE),
        ("posted", DATE),
        ("trans date", DATE),
        ("transaction date", DATE),
        ("description", DESCRIPTION),
        ("narrative", DESCRIPTION),
        ("narration", DESCRIPTION),
        ("merchant", DESCRIPTION),
        ("memo", DESCRIPTION),
        ("payee", DESCRIPTION),
        ("particulars", DESCRIPTION),
        ("details", DESCRIPTION),
        ("debit", DEBIT),
        ("withdrawal", DEBIT),
        ("dr", DEBIT),
        ("credit", CREDIT),
        ("deposit", CREDIT),
        ("cr", CREDIT),
        ("amount", AMOUNT),
        ("balance", BALANCE),
        ("running bal", BALANCE),
        ("available balance", BALANCE),
    ]

    if not os.path.exists(test_root):
        logger.warning(f"Training data root not found: {test_root}")
        return X, y

    for dirpath, _, files in os.walk(test_root):
        for fname in files:
            if not fname.endswith(".csv"):
                continue
            fpath = os.path.join(dirpath, fname)
            try:
                df = pd.read_csv(fpath, nrows=60, header=None)
                # Detect header row (same logic as parser.py)
                header_row = 0
                best_score = 0
                for i in range(min(10, len(df))):
                    row_str = " ".join(str(v).lower() for v in df.iloc[i].values)
                    score = sum(1 for _, _, _ in
                                [(kw, lbl, None) for kw, lbl in known_maps
                                 if kw in row_str])
                    if score > best_score:
                        best_score = score
                        header_row = i

                if best_score < 2:
                    continue

                headers = [str(v).strip() for v in df.iloc[header_row].values]
                data_df = pd.DataFrame(
                    df.iloc[header_row + 1:].values,
                    columns=headers
                )

                for col in data_df.columns:
                    col_lower = col.lower().strip()
                    # Find the ground-truth label for this column
                    lbl = None
                    for kw, label in known_maps:
                        if kw in col_lower:
                            lbl = label
                            break
                    if lbl is None:
                        lbl = UNKNOWN

                    sample = data_df[col].dropna().head(50).tolist()
                    if not sample:
                        continue

                    feat = extract_features(col, sample)
                    X.append(feat)
                    y.append(lbl)

            except Exception as e:
                logger.debug(f"Skipping {fpath}: {e}")

    logger.info(f"Generated {len(X)} training examples from CSV files")
    return X, y


def invalidate_model_cache() -> None:
    """Force-reload the model on next predict call (call after retraining)."""
    global _rf_model, _rf_tried
    _rf_model = None
    _rf_tried = False


def train_and_save(augment: bool = True) -> dict:
    """Train the Random Forest classifier and save to MODEL_PATH.

    Returns a result dict with training stats — safe to call from an API handler.
    Run as a script to retrain from CLI:
        python column_classifier.py
    """
    import time
    t0 = time.monotonic()

    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import cross_val_score
        import pickle
    except ImportError:
        return {"ok": False, "error": "scikit-learn not installed — pip install scikit-learn"}

    X, y = generate_training_examples()

    if len(X) < 20:
        return {"ok": False, "error": f"Only {len(X)} training examples — need ≥20"}

    if augment:
        X, y = _augment_training_data(X, y)

    from collections import Counter
    class_dist = {LABELS[k]: v for k, v in sorted(Counter(y).items())}

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        class_weight="balanced",
        random_state=42,
    )
    model.fit(X, y)

    cv_k = min(5, len(X) // 4)
    scores = cross_val_score(model, X, y, cv=cv_k, scoring="accuracy")
    cv_mean = round(float(scores.mean()), 4)
    cv_std = round(float(scores.std()), 4)

    feat_names = [
        "date_kw", "desc_kw", "debit_kw", "credit_kw", "amount_kw", "balance_kw",
        "pct_date", "pct_numeric", "pct_empty", "pct_negative", "pct_positive",
        "pct_zero", "avg_len", "unique_ratio", "has_currency",
        "num_mean", "num_std", "num_range", "monotonic", "low_cv",
    ]
    top_features = sorted(
        zip(feat_names, model.feature_importances_.tolist()),
        key=lambda x: -x[1],
    )[:10]

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    # Reload the in-process model immediately
    invalidate_model_cache()
    _load_rf_model()

    elapsed_ms = int((time.monotonic() - t0) * 1000)

    logger.info(
        f"Column classifier retrained: {len(X)} examples, "
        f"CV={cv_mean:.3f}±{cv_std:.3f}, {elapsed_ms}ms"
    )

    return {
        "ok": True,
        "training_examples": len(X),
        "classes": len(set(y)),
        "class_distribution": class_dist,
        "cv_accuracy": cv_mean,
        "cv_std": cv_std,
        "top_features": [{"feature": n, "importance": round(i, 4)} for n, i in top_features],
        "model_path": MODEL_PATH,
        "elapsed_ms": elapsed_ms,
    }


def _augment_training_data(X: list, y: list) -> tuple[list, list]:
    """Add synthetic examples for classes that may be under-represented."""
    import random
    rng = random.Random(42)

    synthetic = []

    # Synthetic DATE examples
    for _ in range(30):
        feat = extract_features(
            rng.choice(["Date", "Transaction Date", "Posted", "Trans Date", "Txn Date"]),
            [f"2024-{rng.randint(1,12):02d}-{rng.randint(1,28):02d}" for _ in range(30)]
        )
        synthetic.append((feat, DATE))

    # Synthetic DESCRIPTION examples
    descs = [
        "NETFLIX.COM", "AMAZON PRIME", "STARBUCKS #4821",
        "SQ *COFFEE SHOP", "UBER EATS", "WOOLWORTHS METRO",
        "SPOTIFY PREMIUM", "APPLE.COM/BILL", "DOORDASH ORDER",
    ]
    for _ in range(30):
        feat = extract_features(
            rng.choice(["Description", "Narrative", "Merchant", "Payee", "Details", "Memo"]),
            [rng.choice(descs) + f" {rng.randint(100,9999)}" for _ in range(30)]
        )
        synthetic.append((feat, DESCRIPTION))

    # Synthetic DEBIT examples (positive numbers with many zeros)
    for _ in range(25):
        vals = [str(round(rng.uniform(1, 200), 2)) if rng.random() > 0.4 else "" for _ in range(30)]
        feat = extract_features(
            rng.choice(["Debit", "Withdrawal", "DR", "Debit Amount", "Out"]),
            vals
        )
        synthetic.append((feat, DEBIT))

    # Synthetic CREDIT examples
    for _ in range(25):
        vals = [str(round(rng.uniform(1, 500), 2)) if rng.random() > 0.5 else "" for _ in range(30)]
        feat = extract_features(
            rng.choice(["Credit", "Deposit", "CR", "Credit Amount", "In"]),
            vals
        )
        synthetic.append((feat, CREDIT))

    # Synthetic AMOUNT (signed) examples
    for _ in range(25):
        vals = [str(round(rng.uniform(-300, 300), 2)) for _ in range(30)]
        feat = extract_features(
            rng.choice(["Amount", "Amt", "Transaction Amount", "Net Amount", "Value"]),
            vals
        )
        synthetic.append((feat, AMOUNT))

    # Synthetic BALANCE examples
    for _ in range(25):
        base = rng.uniform(500, 5000)
        vals = []
        for _ in range(30):
            base += rng.uniform(-100, 100)
            vals.append(str(round(base, 2)))
        feat = extract_features(
            rng.choice(["Balance", "Running Balance", "Bal", "Available Balance"]),
            vals
        )
        synthetic.append((feat, BALANCE))

    X_aug = X + [s[0] for s in synthetic]
    y_aug = y + [s[1] for s in synthetic]
    return X_aug, y_aug


# ── Standalone training entry point ───────────────────────────────────────────

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.INFO)

    print("=== Column Classifier Training ===")
    result = train_and_save(augment=True)
    if result["ok"]:
        print(f"Training examples : {result['training_examples']}")
        print(f"CV accuracy       : {result['cv_accuracy']:.3f} ± {result['cv_std']:.3f}")
        print(f"Elapsed           : {result['elapsed_ms']}ms")
        print("\nTop features:")
        for f in result["top_features"][:5]:
            print(f"  {f['feature']:<20} {f['importance']:.3f}")
    else:
        print("ERROR:", result["error"])

    # Quick self-test
    print("\n=== Self-test ===")
    test_cases = [
        ("Transaction Date", ["2024-01-15", "2024-01-16", "2024-01-17"]),
        ("Description", ["NETFLIX.COM", "STARBUCKS #4821", "AMAZON PRIME"]),
        ("Debit Amount", ["15.99", "", "49.00", "", "12.99", ""]),
        ("Credit Amount", ["", "4500.00", "", "", ""]),
        ("Amount", ["-15.99", "-49.00", "4500.00", "-12.99"]),
        ("Balance", ["4800.00", "4785.01", "4736.01", "4687.01"]),
        ("Ref No", ["TXN001234", "TXN001235", "TXN001236"]),
    ]
    for header, values in test_cases:
        label, probs = predict_column_type(header, values, return_probs=True)
        top = sorted(probs.items(), key=lambda x: -x[1])[:3]
        print(f"  {header:<20} → {label:<12}  ({', '.join(f'{k}:{v:.2f}' for k, v in top)})")
