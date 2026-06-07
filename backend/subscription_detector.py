"""Improved recurring subscription detection."""

import math
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional
import re


def parse_date(date_str: str) -> Optional[datetime]:
    """Parse various date formats to datetime."""
    if not date_str:
        return None

    date_str = str(date_str).strip()

    # Common date formats
    formats = [
        "%Y-%m-%d",       # 2025-01-15
        "%d/%m/%Y",       # 15/01/2025
        "%m/%d/%Y",       # 01/15/2025
        "%d/%m/%y",       # 15/01/25
        "%m/%d/%y",       # 01/15/25
        "%d-%m-%Y",       # 15-01-2025
        "%d %b %Y",       # 15 Jan 2025
        "%d %B %Y",       # 15 January 2025
        "%b %d, %Y",      # Jan 15, 2025
        "%d %b",          # 15 Jan (assume current year)
        "%d/%m",          # 15/01 (assume current year)
        "%m/%d",          # 01/15 (assume current year)
    ]

    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            # If no year, assume current year
            if parsed.year == 1900:
                parsed = parsed.replace(year=datetime.now().year)
            return parsed
        except ValueError:
            continue

    return None


def detect_subscriptions(transactions: list[dict]) -> list[dict]:
    """
    Detect recurring subscriptions from transaction list.

    Uses:
    - Merchant grouping
    - Monthly periodicity detection (25-35 days)
    - Amount consistency (within 5% or $2)
    - Known subscription keywords

    Returns list of detected subscriptions with:
    - merchant, monthly_cost, annual_cost, confidence, last_date, occurrences
    """
    # Comprehensive subscription brand catalog.
    # Maps uppercase keyword → (canonical_display_name, category)
    # When a merchant string contains a keyword (whole-word match), we:
    #   1. Confirm it is a real service (validation)
    #   2. Replace the messy extracted name with the clean display name
    SUBSCRIPTION_CATALOG: dict[str, tuple[str, str]] = {
        # ── Streaming / Video ─────────────────────────────────────────────
        "NETFLIX": ("Netflix", "streaming"),
        "HULU": ("Hulu", "streaming"),
        "DISNEY+": ("Disney+", "streaming"),
        "DISNEYPLUS": ("Disney+", "streaming"),
        "DISNEY PLUS": ("Disney+", "streaming"),
        "DISNEY": ("Disney+", "streaming"),
        "HBO": ("HBO Max", "streaming"),
        "AMAZON PRIME VIDEO": ("Amazon Prime Video", "streaming"),
        "AMAZON PRIME": ("Amazon Prime", "streaming"),
        "APPLE TV+": ("Apple TV+", "streaming"),
        "APPLE TV PLUS": ("Apple TV+", "streaming"),
        "APPLETV": ("Apple TV+", "streaming"),
        "YOUTUBE PREMIUM": ("YouTube Premium", "streaming"),
        "YOUTUBE": ("YouTube Premium", "streaming"),
        "PARAMOUNT+": ("Paramount+", "streaming"),
        "PARAMOUNT PLUS": ("Paramount+", "streaming"),
        "PARAMOUNT": ("Paramount+", "streaming"),
        "PEACOCK": ("Peacock", "streaming"),
        "STAN": ("Stan", "streaming"),
        "BINGE": ("Binge", "streaming"),
        "FOXTEL": ("Foxtel Now", "streaming"),
        "KAYO": ("Kayo Sports", "streaming"),
        "BRITBOX": ("BritBox", "streaming"),
        "SHUDDER": ("Shudder", "streaming"),
        "HAYU": ("Hayu", "streaming"),
        "AMC+": ("AMC+", "streaming"),
        "CRUNCHYROLL": ("Crunchyroll", "streaming"),
        "FUNIMATION": ("Funimation", "streaming"),
        "MUBI": ("Mubi", "streaming"),
        "CURIOSITY STREAM": ("CuriosityStream", "streaming"),
        "DISCOVERY+": ("Discovery+", "streaming"),
        "TUBI": ("Tubi", "streaming"),
        "PLEX": ("Plex", "streaming"),
        "SHOWTIME": ("Showtime", "streaming"),
        "STARZ": ("Starz", "streaming"),
        "CRITERION": ("Criterion Channel", "streaming"),
        "ESPN+": ("ESPN+", "streaming"),
        # ── Music / Audio ────────────────────────────────────────────────
        "SPOTIFY": ("Spotify", "music"),
        "APPLE MUSIC": ("Apple Music", "music"),
        "AMAZON MUSIC": ("Amazon Music", "music"),
        "YOUTUBE MUSIC": ("YouTube Music", "music"),
        "TIDAL": ("Tidal", "music"),
        "DEEZER": ("Deezer", "music"),
        "PANDORA": ("Pandora", "music"),
        "SOUNDCLOUD": ("SoundCloud", "music"),
        "AUDIBLE": ("Audible", "audiobooks"),
        "SCRIBD": ("Scribd", "reading"),
        "KINDLE UNLIMITED": ("Kindle Unlimited", "reading"),
        "STORYTEL": ("Storytel", "audiobooks"),
        # ── Cloud Storage ────────────────────────────────────────────────
        "DROPBOX": ("Dropbox", "cloud_storage"),
        "GOOGLE ONE": ("Google One", "cloud_storage"),
        "ICLOUD": ("iCloud", "cloud_storage"),
        "ONEDRIVE": ("OneDrive", "cloud_storage"),
        "BOX": ("Box", "cloud_storage"),
        "BACKBLAZE": ("Backblaze", "cloud_storage"),
        "CARBONITE": ("Carbonite", "backup"),
        "IDRIVE": ("IDrive", "backup"),
        # ── Software / Productivity ───────────────────────────────────────
        "ADOBE": ("Adobe Creative Cloud", "software"),
        "ADOBE CREATIVE": ("Adobe Creative Cloud", "software"),
        "MICROSOFT 365": ("Microsoft 365", "software"),
        "MICROSOFT": ("Microsoft 365", "software"),
        "OFFICE 365": ("Microsoft 365", "software"),
        "GOOGLE WORKSPACE": ("Google Workspace", "software"),
        "GSUITE": ("Google Workspace", "software"),
        "NOTION": ("Notion", "software"),
        "EVERNOTE": ("Evernote", "software"),
        "TODOIST": ("Todoist", "software"),
        "ASANA": ("Asana", "software"),
        "SLACK": ("Slack", "software"),
        "ZOOM": ("Zoom", "software"),
        "CANVA": ("Canva", "software"),
        "FIGMA": ("Figma", "software"),
        "GITHUB": ("GitHub", "software"),
        "GITHUB COPILOT": ("GitHub Copilot", "software"),
        "JETBRAINS": ("JetBrains", "software"),
        "GRAMMARLY": ("Grammarly", "software"),
        "LASTPASS": ("LastPass", "password_manager"),
        "1PASSWORD": ("1Password", "password_manager"),
        "DASHLANE": ("Dashlane", "password_manager"),
        "BITWARDEN": ("Bitwarden", "password_manager"),
        "NORDVPN": ("NordVPN", "vpn"),
        "EXPRESSVPN": ("ExpressVPN", "vpn"),
        "SURFSHARK": ("Surfshark", "vpn"),
        "MULLVAD": ("Mullvad VPN", "vpn"),
        "PROTONVPN": ("ProtonVPN", "vpn"),
        "PROTON": ("Proton", "software"),
        # ── AI Tools ────────────────────────────────────────────────────
        "CLAUDE.AI": ("Claude.ai", "ai_tools"),
        "CLAUDE": ("Claude.ai", "ai_tools"),
        "ANTHROPIC": ("Claude.ai", "ai_tools"),
        "CHATGPT": ("ChatGPT Plus", "ai_tools"),
        "OPENAI": ("ChatGPT Plus", "ai_tools"),
        "MIDJOURNEY": ("Midjourney", "ai_tools"),
        "PERPLEXITY": ("Perplexity AI", "ai_tools"),
        "COPILOT": ("Microsoft Copilot", "ai_tools"),
        "JASPER": ("Jasper AI", "ai_tools"),
        "ELEVENLABS": ("ElevenLabs", "ai_tools"),
        # ── Fitness / Wellness ───────────────────────────────────────────
        "PLANET FITNESS": ("Planet Fitness", "fitness"),
        "ANYTIME FITNESS": ("Anytime Fitness", "fitness"),
        "EQUINOX": ("Equinox", "fitness"),
        "PELOTON": ("Peloton", "fitness"),
        "CLASSPASS": ("ClassPass", "fitness"),
        "LA FITNESS": ("LA Fitness", "fitness"),
        "24 HOUR FITNESS": ("24 Hour Fitness", "fitness"),
        "FITNESS FIRST": ("Fitness First", "fitness"),
        "CRUNCH FITNESS": ("Crunch Fitness", "fitness"),
        "F45": ("F45 Training", "fitness"),
        "ORANGE THEORY": ("Orangetheory Fitness", "fitness"),
        "CROSSFIT": ("CrossFit", "fitness"),
        "HEADSPACE": ("Headspace", "wellness"),
        "CALM": ("Calm", "wellness"),
        "NOOM": ("Noom", "wellness"),
        "BETTERHELP": ("BetterHelp", "wellness"),
        "TALKSPACE": ("Talkspace", "wellness"),
        "APPLE FITNESS": ("Apple Fitness+", "fitness"),
        # ── Food / Meal Kits ─────────────────────────────────────────────
        "HELLOFRESH": ("HelloFresh", "food"),
        "HELLO FRESH": ("HelloFresh", "food"),
        "BLUE APRON": ("Blue Apron", "food"),
        "MARLEY SPOON": ("Marley Spoon", "food"),
        "EVERY PLATE": ("EveryPlate", "food"),
        "DINNERLY": ("Dinnerly", "food"),
        "FACTOR": ("Factor Meals", "food"),
        # ── BNPL ─────────────────────────────────────────────────────────
        "AFTERPAY": ("Afterpay", "bnpl"),
        "KLARNA": ("Klarna", "bnpl"),
        "AFFIRM": ("Affirm", "bnpl"),
        "LAYBUY": ("Laybuy", "bnpl"),
        "SPLITIT": ("Splitit", "bnpl"),
        "ZIP": ("Zip Pay", "bnpl"),
        "ZIPPAY": ("Zip Pay", "bnpl"),
        "HUMM": ("Humm", "bnpl"),
        # ── Utilities / Telecom (AU) ──────────────────────────────────────
        "TELSTRA": ("Telstra", "telecom"),
        "OPTUS": ("Optus", "telecom"),
        "VODAFONE": ("Vodafone", "telecom"),
        "TPG": ("TPG", "telecom"),
        "AUSSIE BROADBAND": ("Aussie Broadband", "telecom"),
        "AGL": ("AGL Energy", "utilities"),
        "ORIGIN ENERGY": ("Origin Energy", "utilities"),
        "ENERGY AUSTRALIA": ("EnergyAustralia", "utilities"),
        # ── Gaming ──────────────────────────────────────────────────────
        "PLAYSTATION PLUS": ("PlayStation Plus", "gaming"),
        "PLAYSTATION NOW": ("PlayStation Now", "gaming"),
        "XBOX GAME PASS": ("Xbox Game Pass", "gaming"),
        "XBOX GAMEPASS": ("Xbox Game Pass", "gaming"),
        "NINTENDO": ("Nintendo Switch Online", "gaming"),
        "STEAM": ("Steam", "gaming"),
        "EA PLAY": ("EA Play", "gaming"),
        "UBISOFT": ("Ubisoft+", "gaming"),
        # ── Creator / Community ──────────────────────────────────────────
        "PATREON": ("Patreon", "creator"),
        "ONLYFANS": ("OnlyFans", "creator"),
        "TWITCH": ("Twitch", "creator"),
        "SUBSTACK": ("Substack", "newsletter"),
        "MEDIUM": ("Medium", "newsletter"),
    }

    # Build the keyword list from the catalog keys for backwards-compat
    KNOWN_SUBSCRIPTIONS = list(SUBSCRIPTION_CATALOG.keys())

    # Sanity cap: subscriptions above this monthly amount are almost certainly
    # not a digital/streaming subscription (catches BNPL totals, groceries, etc.)
    # Raised for gym/fitness/insurance which can be legitimately high.
    SUBSCRIPTION_AMOUNT_CAP = 500.0

    # Non-subscription merchants — keyword match high-confidence kill-switch
    NOT_SUBSCRIPTION_PATTERNS = [
        "WOOLWORTHS", "COLES", "ALDI", "IGA", "COSTCO",
        "MCDONALD", "KFC", "SUBWAY", "BURGER KING", "HUNGRY",
        "UBER EATS", "DOORDASH", "MENULOG", "DELIVEROO",
        "PETROL", "SHELL", "CALTEX", "BP ", "MOBIL", "AMPOL",
        "PHARMACY", "CHEMIST", "PRICELINE",
        "HARVEY NORMAN", "JB HI-FI", "KMART", "BUNNINGS", "IKEA",
        "HOSPITAL", "CLINIC", "MEDICAL", "DENTAL",
        # Investment/brokerage services — recurring debits are contributions, not subscriptions
        "COMMSEC", "COMMONWEALTH SEC", "VANGUARD", "BETASHARES", "RAIZ",
        "STAKE", "SUPERHERO", "PEARLER", "SELFWEALTH",
        "FIDELITY", "SCHWAB", "VANGUARD", "ROBINHOOD", "WEBULL",
        "SPACESHIP", "BAREFOOT", "ACORNS",
    ]

    # Recurring payment patterns (may have variable amounts)
    RECURRING_PATTERNS = ["DIRECT DEBIT", "BPAY", "AUTOPAY", "AUTO PAY"]

    def _is_known_sub(merchant_upper: str) -> tuple[bool, str | None, str | None]:
        """Whole-word match against subscription catalog.
        Returns (matched, canonical_name, category)."""
        for kw, (canonical, category) in SUBSCRIPTION_CATALOG.items():
            pattern = r'(?<![A-Z0-9])' + re.escape(kw) + r'(?![A-Z0-9])'
            if re.search(pattern, merchant_upper):
                return True, canonical, category
        return False, None, None

    def _is_non_subscription(merchant_upper: str) -> bool:
        """Return True if the merchant is clearly not a subscription service."""
        return any(pat in merchant_upper for pat in NOT_SUBSCRIPTION_PATTERNS)

    # Group transactions by canonical merchant (falls back to raw merchant if normalizer unavailable)
    merchant_groups: dict[str, list] = defaultdict(list)

    for txn in transactions:
        # Prefer canonical name set by merchant normalizer; fall back to raw
        merchant = (
            txn.get("canonical_merchant")
            or txn.get("normalized_merchant")
            or txn.get("merchant", "")
        )
        if not merchant:
            continue
        merchant_groups[merchant.upper()].append(txn)

    subscriptions = []

    for merchant, txns in merchant_groups.items():
        if len(txns) == 0:
            continue

        # Hard-exclude obvious non-subscription merchants
        if _is_non_subscription(merchant):
            continue

        # Reject suspiciously long merchant names — these are parser concatenation
        # artifacts where multiple transaction lines were merged into one string
        # (e.g. "IVACS AUSTRALIA RAMKUMAR RA CLAUDE.AI"). Real subscription names
        # are usually 1–4 tokens.
        token_count = len(re.split(r'[\s.]+', merchant.strip()))
        if token_count > 7:
            continue

        # Get amounts and dates (filter out NaN values)
        amounts = [t.get("amount", 0) for t in txns]
        amounts = [a for a in amounts if a is not None and not math.isnan(a)]
        dates = [parse_date(t.get("date", "")) for t in txns]
        dates = [d for d in dates if d is not None]

        if not amounts:
            continue

        avg_amount = sum(amounts) / len(amounts)
        max_amount = max(amounts)
        min_amount = min(amounts)

        # Reject obviously non-subscription amounts unless it's a high-ticket
        # known service (insurance, software licences) — cap at $500/mo
        if avg_amount > SUBSCRIPTION_AMOUNT_CAP:
            continue

        # Check if amounts are consistent (within 5% or $2 tolerance)
        amount_variance = max_amount - min_amount
        is_consistent = (
            amount_variance <= 2.0 or
            (avg_amount > 0 and amount_variance / avg_amount <= 0.05)
        )

        # Check for known subscription keywords (whole-word match) → returns canonical name
        known_sub, canonical_name, sub_category = _is_known_sub(merchant)

        # Use the canonical display name when we have a catalog match;
        # otherwise keep the (already-cleaned) raw merchant string.
        display_name = canonical_name if canonical_name else merchant.title()

        # Check for recurring payment patterns (more lenient - 15% variance allowed)
        is_recurring_pattern = any(kw in merchant for kw in RECURRING_PATTERNS)
        is_loosely_consistent = (
            amount_variance <= 10.0 or
            (avg_amount > 0 and amount_variance / avg_amount <= 0.15)
        )

        # Check periodicity if we have dates
        is_periodic = False
        avg_interval = 0
        if len(dates) >= 2:
            dates.sort()
            intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
            avg_interval = sum(intervals) / len(intervals) if intervals else 0
            # Monthly: 25-35 days average
            is_periodic = 25 <= avg_interval <= 35

        # Determine if this is a subscription
        confidence = 0.0
        reason = ""

        if known_sub and is_consistent and len(txns) >= 2:
            confidence = 0.95
            reason = "Known subscription service"
        elif known_sub and is_periodic:
            confidence = 0.9
            reason = "Known subscription service (periodic)"
        elif known_sub:
            confidence = 0.75
            reason = "Known subscription service (single charge)"
        elif is_recurring_pattern and len(txns) >= 3 and is_periodic:
            confidence = 0.9
            reason = f"Recurring payment: {len(txns)} charges, ~{avg_interval:.0f} days apart"
        elif len(txns) >= 3 and is_consistent and is_periodic:
            confidence = 0.85
            reason = f"Recurring pattern: {len(txns)} charges, ~{avg_interval:.0f} days apart"
        elif is_recurring_pattern and len(txns) >= 3 and is_loosely_consistent:
            confidence = 0.75
            reason = f"Direct debit: {len(txns)} charges of ~${avg_amount:.2f}"
        elif len(txns) >= 2 and is_consistent:
            confidence = 0.7
            reason = f"Consistent amounts: {len(txns)} charges of ~${avg_amount:.2f}"

        # Add if confidence is high enough and amount is valid
        if confidence >= 0.5 and avg_amount > 0 and not math.isnan(avg_amount):
            last_date = max(dates).strftime("%Y-%m-%d") if dates else ""

            subscriptions.append({
                "merchant": display_name,
                "monthly_cost": round(avg_amount, 2),
                "annual_cost": round(avg_amount * 12, 2),
                "confidence": confidence,
                "last_date": last_date,
                "occurrences": len(txns),
                "reason": reason,
                "category": sub_category or "other",
            })

    # Sort by monthly cost descending
    subscriptions.sort(key=lambda x: x["monthly_cost"], reverse=True)

    return subscriptions


def detect_date_range(transactions: list[dict]) -> tuple[Optional[datetime], Optional[datetime], int]:
    """
    Detect the date range covered by transactions.

    Returns: (start_date, end_date, days_covered)
    """
    dates = []
    for txn in transactions:
        parsed = parse_date(txn.get("date", ""))
        if parsed:
            dates.append(parsed)

    if not dates:
        return None, None, 0

    start_date = min(dates)
    end_date = max(dates)
    days_covered = (end_date - start_date).days

    return start_date, end_date, days_covered


def generate_month_comparison(transactions: list[dict]) -> Optional[dict]:
    """
    Generate month-over-month comparison if data spans > 60 days.

    Returns comparison data or None if insufficient data.
    """
    start_date, end_date, days_covered = detect_date_range(transactions)

    if days_covered < 60:
        return None

    # Group transactions by month
    monthly_data = defaultdict(lambda: {
        "total": 0,
        "count": 0,
        "categories": defaultdict(float)
    })

    for txn in transactions:
        date = parse_date(txn.get("date", ""))
        if not date:
            continue

        month_key = date.strftime("%Y-%m")
        amount = txn.get("amount", 0)
        category = txn.get("category", "Other")

        # Skip income for spending comparison
        if category == "Income":
            continue

        monthly_data[month_key]["total"] += amount
        monthly_data[month_key]["count"] += 1
        monthly_data[month_key]["categories"][category] += amount

    if len(monthly_data) < 2:
        return None

    # Sort months
    sorted_months = sorted(monthly_data.keys())

    # Get last two complete months (or most recent)
    if len(sorted_months) >= 2:
        prev_month = sorted_months[-2]
        curr_month = sorted_months[-1]
    else:
        return None

    prev_data = monthly_data[prev_month]
    curr_data = monthly_data[curr_month]

    # Calculate changes
    total_change = curr_data["total"] - prev_data["total"]
    total_change_pct = (total_change / prev_data["total"] * 100) if prev_data["total"] > 0 else 0

    # Find category changes
    category_changes = []
    all_categories = set(prev_data["categories"].keys()) | set(curr_data["categories"].keys())

    for cat in all_categories:
        prev_amt = prev_data["categories"].get(cat, 0)
        curr_amt = curr_data["categories"].get(cat, 0)
        change = curr_amt - prev_amt
        change_pct = (change / prev_amt * 100) if prev_amt > 0 else (100 if curr_amt > 0 else 0)

        category_changes.append({
            "category": cat,
            "previous": round(prev_amt, 2),
            "current": round(curr_amt, 2),
            "change": round(change, 2),
            "change_percent": round(change_pct, 1)
        })

    # Sort by absolute change
    category_changes.sort(key=lambda x: abs(x["change"]), reverse=True)

    # Detect spikes (> 30% increase)
    spikes = [c for c in category_changes if c["change_percent"] > 30 and c["change"] > 20]

    return {
        "previous_month": prev_month,
        "current_month": curr_month,
        "previous_total": round(prev_data["total"], 2),
        "current_total": round(curr_data["total"], 2),
        "total_change": round(total_change, 2),
        "total_change_percent": round(total_change_pct, 1),
        "top_changes": category_changes[:5],
        "spikes": spikes[:3],
        "months_analyzed": len(sorted_months)
    }


def detect_price_changes(transactions: list[dict]) -> list[dict]:
    """
    Detect subscription price increases over time.

    Looks for merchants with:
    - Multiple transactions at different amounts
    - Later transactions higher than earlier ones
    - Amount change > $1 (to filter out rounding)
    """
    # Group by merchant
    merchant_txns = defaultdict(list)
    for txn in transactions:
        merchant = txn.get("normalized_merchant") or txn.get("merchant", "")
        if not merchant:
            continue
        date = parse_date(txn.get("date", ""))
        amount = txn.get("amount", 0)
        if date and amount > 0 and not math.isnan(amount):
            merchant_txns[merchant.upper()].append({
                "date": date,
                "amount": amount
            })

    price_changes = []

    for merchant, txns in merchant_txns.items():
        if len(txns) < 2:
            continue

        # Sort by date
        txns.sort(key=lambda x: x["date"])

        # Get unique amounts in chronological order
        unique_amounts = []
        last_amount = None
        for t in txns:
            if last_amount is None or abs(t["amount"] - last_amount) > 0.50:
                unique_amounts.append({
                    "amount": t["amount"],
                    "date": t["date"]
                })
                last_amount = t["amount"]

        if len(unique_amounts) < 2:
            continue

        # Check if latest price is higher than earliest
        first = unique_amounts[0]
        last = unique_amounts[-1]

        price_diff = last["amount"] - first["amount"]
        pct_change = (price_diff / first["amount"] * 100) if first["amount"] > 0 else 0

        # Only report significant increases (> $1 or > 5%)
        if price_diff >= 1.0 or pct_change >= 5:
            price_changes.append({
                "merchant": merchant,
                "old_price": round(first["amount"], 2),
                "new_price": round(last["amount"], 2),
                "increase": round(price_diff, 2),
                "percent_change": round(pct_change, 1),
                "first_date": first["date"].strftime("%Y-%m-%d"),
                "latest_date": last["date"].strftime("%Y-%m-%d"),
                "yearly_impact": round(price_diff * 12, 2)
            })

    # Sort by yearly impact
    price_changes.sort(key=lambda x: x["yearly_impact"], reverse=True)
    return price_changes[:10]


def detect_duplicate_subscriptions(subscriptions: list[dict]) -> list[dict]:
    """
    Detect potential duplicate or overlapping subscriptions.

    Groups subscriptions by service category:
    - Multiple streaming services
    - Multiple music services
    - Multiple cloud storage
    - Multiple fitness memberships
    """
    # Category keywords
    CATEGORIES = {
        "streaming": ["NETFLIX", "HULU", "DISNEY", "HBO", "MAX", "PARAMOUNT", "PEACOCK", "APPLE TV", "AMAZON PRIME VIDEO", "STAN", "BINGE"],
        "music": ["SPOTIFY", "APPLE MUSIC", "AMAZON MUSIC", "YOUTUBE MUSIC", "TIDAL", "DEEZER", "PANDORA"],
        "cloud": ["DROPBOX", "GOOGLE ONE", "ICLOUD", "ONEDRIVE", "BOX"],
        "fitness": ["GYM", "FITNESS", "PELOTON", "PLANET FITNESS", "LA FITNESS", "ANYTIME FITNESS", "EQUINOX", "CLASSPASS", "APPLE FITNESS"],
        "food_delivery": ["DOORDASH", "UBER EATS", "GRUBHUB", "POSTMATES", "MENULOG", "DELIVEROO", "JUST EAT"],
        "password_manager": ["1PASSWORD", "LASTPASS", "DASHLANE", "BITWARDEN"],
        "vpn": ["NORDVPN", "EXPRESSVPN", "SURFSHARK", "PRIVATE INTERNET ACCESS"]
    }

    duplicates = []

    # Categorize subscriptions
    categorized = defaultdict(list)

    for sub in subscriptions:
        merchant = sub.get("merchant", "").upper()
        for category, keywords in CATEGORIES.items():
            if any(kw in merchant for kw in keywords):
                categorized[category].append(sub)
                break

    # Find categories with multiple subscriptions
    for category, subs in categorized.items():
        if len(subs) >= 2:
            total_monthly = sum(s.get("monthly_cost", 0) for s in subs)
            total_yearly = total_monthly * 12

            duplicates.append({
                "category": category.replace("_", " ").title(),
                "services": [s.get("merchant", "") for s in subs],
                "count": len(subs),
                "combined_monthly": round(total_monthly, 2),
                "combined_yearly": round(total_yearly, 2),
                "suggestion": _get_duplicate_suggestion(category, subs)
            })

    # Sort by combined yearly cost
    duplicates.sort(key=lambda x: x["combined_yearly"], reverse=True)
    return duplicates


def _get_duplicate_suggestion(category: str, subs: list[dict]) -> str:
    """Generate suggestion for duplicate subscriptions."""
    count = len(subs)

    suggestions = {
        "streaming": f"Consider keeping only 1-2 streaming services and rotating monthly. You have {count} active.",
        "music": f"Most music services have similar catalogs. Pick one favorite and cancel the rest.",
        "cloud": f"Consolidate to one cloud storage provider. {count} services likely means duplicate backups.",
        "fitness": f"You're paying for {count} fitness memberships. Consider keeping only the one you use most.",
        "food_delivery": f"Pick one delivery service for best rewards. {count} services may mean no loyalty benefits.",
        "password_manager": f"One password manager is enough. Using {count} reduces security benefits.",
        "vpn": f"Multiple VPN subscriptions provide no extra benefit. Keep the fastest one."
    }

    return suggestions.get(category, f"Consider consolidating these {count} similar services.")
