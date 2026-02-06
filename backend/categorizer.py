"""Transaction categorization with keyword rules and merchant normalization."""

import re
from typing import Optional
from dataclasses import dataclass
from enum import Enum


class Category(str, Enum):
    INCOME = "Income"
    TRANSFERS = "Transfers"
    SUBSCRIPTIONS = "Subscriptions"
    FEES = "Fees"
    GROCERIES = "Groceries"
    DINING = "Dining & Delivery"
    TRANSPORT = "Transport"
    SHOPPING = "Shopping"
    UTILITIES = "Utilities & Bills"
    HEALTH = "Health & Fitness"
    ENTERTAINMENT = "Entertainment"
    TRAVEL = "Travel"
    OTHER = "Other"


@dataclass
class CategoryResult:
    category: Category
    confidence: float  # 0.0 to 1.0
    reason: str
    normalized_merchant: str


# Merchant name noise to strip
NOISE_PATTERNS = [
    r'\bPOS\b', r'\bEFTPOS\b', r'\bVISA\b', r'\bMASTERCARD\b', r'\bDEBIT\b',
    r'\bCARD\b', r'\bPURCHASE\b', r'\bPAYMENT\b', r'\bAU\b', r'\bAUS\b',
    r'\bUSA\b', r'\bGBR\b', r'\bUSD\b', r'\bAUD\b', r'\bNZD\b',
    r'\bPTY\b', r'\bLTD\b', r'\bINC\b', r'\bLLC\b', r'\bCORP\b',
    r'\b\d{4,}\b',  # Remove long numbers (card numbers, refs)
    r'\*+', r'#\d+', r'\bREF:?\s*\w+',
    r'\bCONF[:#]?\s*\w+', r'\bTRANS[:#]?\s*\w+',
    r'\bXX+\d*', r'\b\d{2}/\d{2}\b',  # Dates in description
]

# Category keyword mappings (order matters - more specific first)
CATEGORY_KEYWORDS = {
    Category.INCOME: [
        "SALARY", "PAYROLL", "WAGE", "DIRECT CREDIT", "EMPLOYER",
        "INTEREST EARNED", "DIVIDEND", "TAX REFUND", "CENTRELINK",
        "PENSION", "BONUS", "COMMISSION"
    ],
    Category.TRANSFERS: [
        "TRANSFER TO", "TRANSFER FROM", "TFR TO", "TFR FROM",
        "INTERNAL TRANSFER", "OSKO", "BPAY", "PAY ANYONE",
        "ZELLE", "VENMO", "CASHAPP", "BETWEEN ACCOUNTS"
    ],
    Category.SUBSCRIPTIONS: [
        # Streaming
        "NETFLIX", "SPOTIFY", "HULU", "DISNEY", "HBO", "AMAZON PRIME",
        "APPLE MUSIC", "YOUTUBE PREMIUM", "PARAMOUNT", "PEACOCK", "AUDIBLE",
        "STAN", "BINGE", "KAYO", "FOXTEL", "CRUNCHYROLL", "DAZN",
        # Software
        "ADOBE", "MICROSOFT 365", "GOOGLE ONE", "DROPBOX", "ICLOUD",
        "CANVA", "NOTION", "SLACK", "ZOOM", "GITHUB", "CHATGPT", "CLAUDE",
        # Fitness
        "PLANET FITNESS", "LA FITNESS", "ANYTIME FITNESS", "EQUINOX",
        "CROSSFIT", "PELOTON", "BEACHBODY", "GYM MEMBERSHIP",
        "F45", "ORANGETHEORY", "BARRY'S",
        # Other subscriptions
        "ONLYFANS", "PATREON", "TWITCH", "SUBSTACK",
        "HEADSPACE", "CALM", "NOOM", "WEIGHT WATCHERS",
        "AMAZON SUBSCRIBE", "HELLO FRESH", "BLUE APRON",
        # BNPL (recurring)
        "AFTERPAY", "KLARNA", "ZIP PAY", "AFFIRM", "SEZZLE", "HUMM"
    ],
    Category.FEES: [
        "FEE", "CHARGE", "OVERDRAFT", "SERVICE CHARGE", "MAINTENANCE",
        "FOREIGN TRANSACTION", "MONTHLY FEE", "ANNUAL FEE", "LATE FEE",
        "INTEREST CHARGE", "FINANCE CHARGE", "ATM FEE", "ACCOUNT KEEPING",
        "DISHONOUR", "OVERDRAWN", "NSF"
    ],
    Category.GROCERIES: [
        "WOOLWORTHS", "COLES", "ALDI", "IGA", "COSTCO", "SAMS CLUB",
        "KROGER", "SAFEWAY", "PUBLIX", "WHOLE FOODS", "TRADER JOE",
        "GIANT EAGLE", "WEGMANS", "FOOD LION", "HARRIS TEETER",
        "SPROUTS", "FRESH MARKET", "PIGGLY WIGGLY",
        "TESCO", "SAINSBURY", "ASDA", "MORRISONS", "LIDL",
        "COUNTDOWN", "PAK N SAVE", "NEW WORLD",
        "SUPERMARKET", "GROCERY", "MARKET BASKET"
    ],
    Category.DINING: [
        # Fast food
        "MCDONALD", "BURGER KING", "WENDY", "TACO BELL", "KFC",
        "CHICK-FIL-A", "SUBWAY", "CHIPOTLE", "PANDA EXPRESS",
        "DOMINO", "PIZZA HUT", "PAPA JOHN", "FIVE GUYS",
        "SHAKE SHACK", "IN-N-OUT", "CARL'S JR", "JACK IN THE BOX",
        # Coffee
        "STARBUCKS", "DUNKIN", "COSTA", "PRET", "TIM HORTONS",
        "CARIBOU", "GLORIA JEAN", "COFFEE BEAN",
        # Delivery
        "UBER EATS", "UBEREATS", "DOORDASH", "MENULOG", "DELIVEROO",
        "GRUBHUB", "POSTMATES", "SEAMLESS", "JUST EAT", "SKIP THE DISHES",
        "INSTACART", "GOPUFF", "CAVIAR",
        # Generic
        "RESTAURANT", "CAFE", "DINER", "PIZZERIA", "SUSHI", "THAI",
        "CHINESE", "INDIAN", "MEXICAN", "ITALIAN", "BAR", "PUB", "GRILL"
    ],
    Category.TRANSPORT: [
        "UBER", "LYFT", "DIDI", "OLA", "GRAB", "BOLT",
        "TAXI", "CAB",
        "SHELL", "BP", "CHEVRON", "EXXON", "MOBIL", "TEXACO",
        "CALTEX", "7-ELEVEN GAS", "SPEEDWAY", "WAWA", "RACETRAC",
        "PETROL", "FUEL", "GAS STATION",
        "PARKING", "PARK", "METER",
        "TOLL", "E-TAG", "ETOLL", "LINKT",
        "TRANSIT", "METRO", "SUBWAY", "BUS", "TRAIN", "RAIL",
        "MYKI", "OPAL", "GO CARD", "CLIPPER",
        "CAR WASH", "AUTO REPAIR", "MECHANIC", "JIFFY LUBE"
    ],
    Category.SHOPPING: [
        "AMAZON", "EBAY", "ETSY", "WALMART", "TARGET", "BEST BUY",
        "KMART", "BIG W", "MYER", "DAVID JONES",
        "MACY'S", "NORDSTROM", "JC PENNEY", "KOHL'S", "TJ MAXX",
        "ROSS", "MARSHALLS", "BURLINGTON",
        "IKEA", "HOME DEPOT", "LOWE'S", "BUNNINGS", "MITRE 10",
        "OFFICEWORKS", "STAPLES", "OFFICE DEPOT",
        "APPLE STORE", "MICROSOFT STORE",
        "NIKE", "ADIDAS", "ZARA", "H&M", "UNIQLO", "GAP",
        "OLD NAVY", "FOREVER 21", "SHEIN", "ASOS",
        "SEPHORA", "ULTA", "BATH & BODY", "LUSH",
        "CHEMIST", "CVS", "WALGREENS", "RITE AID", "PRICELINE"
    ],
    Category.UTILITIES: [
        "ELECTRIC", "POWER", "ENERGY", "GAS BILL", "WATER BILL",
        "AGL", "ORIGIN", "ENERGY AUSTRALIA", "ALINTA",
        "PG&E", "CON EDISON", "DUKE ENERGY", "SOUTHERN COMPANY",
        "INTERNET", "BROADBAND", "NBN", "COMCAST", "XFINITY",
        "AT&T", "VERIZON", "T-MOBILE", "SPRINT", "TELSTRA", "OPTUS", "VODAFONE",
        "PHONE BILL", "MOBILE PLAN", "CELL PHONE",
        "INSURANCE", "GEICO", "STATE FARM", "ALLSTATE", "PROGRESSIVE",
        "NRMA", "RACV", "RACQ", "AAMI", "SUNCORP",
        "RENT", "MORTGAGE", "HOME LOAN", "PROPERTY",
        "COUNCIL", "RATES", "STRATA"
    ],
    Category.HEALTH: [
        "PHARMACY", "DOCTOR", "MEDICAL", "HOSPITAL", "CLINIC",
        "DENTAL", "DENTIST", "OPTOMETRIST", "VISION", "EYE",
        "PHYSIO", "CHIROPRACTOR", "MASSAGE", "SPA",
        "VITAMIN", "SUPPLEMENT", "GNC",
        "MEDIBANK", "BUPA", "NIB", "HCF", "AHSA",
        "UNITED HEALTH", "CIGNA", "AETNA", "HUMANA", "KAISER"
    ],
    Category.ENTERTAINMENT: [
        "CINEMA", "MOVIE", "THEATRE", "THEATER", "AMC", "REGAL",
        "EVENT CINEMAS", "HOYTS", "VILLAGE",
        "CONCERT", "TICKET", "TICKETMASTER", "LIVE NATION",
        "EVENTBRITE", "STUBHUB",
        "STEAM", "PLAYSTATION", "XBOX", "NINTENDO", "EPIC GAMES",
        "APP STORE", "GOOGLE PLAY", "ITUNES",
        "BOOK", "KINDLE", "AUDIBLE", "BARNES NOBLE",
        "BOWLING", "ARCADE", "MINI GOLF", "LASER TAG",
        "MUSEUM", "ZOO", "AQUARIUM", "THEME PARK"
    ],
    Category.TRAVEL: [
        "AIRLINE", "FLIGHT", "QANTAS", "VIRGIN", "JETSTAR", "REX",
        "UNITED", "DELTA", "AMERICAN", "SOUTHWEST", "ALASKA",
        "BRITISH AIRWAYS", "LUFTHANSA", "EMIRATES", "SINGAPORE",
        "HOTEL", "MOTEL", "AIRBNB", "VRBO", "BOOKING.COM", "EXPEDIA",
        "MARRIOTT", "HILTON", "HYATT", "IHG", "WYNDHAM", "BEST WESTERN",
        "CAR RENTAL", "HERTZ", "AVIS", "ENTERPRISE", "BUDGET", "ALAMO",
        "CRUISE", "CARNIVAL", "ROYAL CARIBBEAN"
    ]
}


def normalize_merchant(merchant: str) -> str:
    """Normalize merchant name by removing noise and standardizing format."""
    if not merchant:
        return ""

    # Convert to uppercase for matching
    normalized = merchant.upper().strip()

    # Remove noise patterns
    for pattern in NOISE_PATTERNS:
        normalized = re.sub(pattern, '', normalized, flags=re.IGNORECASE)

    # Clean up whitespace
    normalized = re.sub(r'\s+', ' ', normalized).strip()

    # Remove leading/trailing punctuation
    normalized = re.sub(r'^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$', '', normalized)

    return normalized if normalized else merchant.upper().strip()


def categorize_transaction(merchant: str, amount: float, description: str = "") -> CategoryResult:
    """
    Categorize a transaction based on merchant name and amount.

    Returns category, confidence score, and reason.
    """
    normalized = normalize_merchant(merchant)
    search_text = f"{merchant} {description}".upper()

    # Check each category's keywords
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in search_text:
                return CategoryResult(
                    category=category,
                    confidence=0.9,
                    reason=f"keyword_match: {keyword} -> {category.value}",
                    normalized_merchant=normalized
                )

    # Heuristic fallbacks based on amount patterns
    if amount < 0:  # Credits/income
        return CategoryResult(
            category=Category.INCOME,
            confidence=0.5,
            reason="amount_negative: likely income/credit",
            normalized_merchant=normalized
        )

    # Small frequent purchases might be convenience stores
    if amount < 15:
        return CategoryResult(
            category=Category.OTHER,
            confidence=0.3,
            reason="small_amount: unclassified small purchase",
            normalized_merchant=normalized
        )

    # Default to Other
    return CategoryResult(
        category=Category.OTHER,
        confidence=0.2,
        reason="no_match: unclassified transaction",
        normalized_merchant=normalized
    )


def categorize_transactions(transactions: list[dict]) -> list[dict]:
    """
    Categorize all transactions and return enriched transaction list.

    Each transaction gets: category, confidence, reason, normalized_merchant
    """
    categorized = []

    for txn in transactions:
        merchant = txn.get("merchant", "") or txn.get("original_merchant", "")
        amount = txn.get("amount", 0)
        description = txn.get("description", "")

        result = categorize_transaction(merchant, amount, description)

        enriched = txn.copy()
        enriched["category"] = result.category.value
        enriched["confidence"] = result.confidence
        enriched["category_reason"] = result.reason
        enriched["normalized_merchant"] = result.normalized_merchant

        categorized.append(enriched)

    return categorized


def generate_category_summary(transactions: list[dict]) -> list[dict]:
    """
    Generate summary statistics per category.

    Returns: [{category, total, percent, transaction_count, top_merchants}]
    """
    from collections import defaultdict

    # Aggregate by category
    category_data = defaultdict(lambda: {
        "total": 0,
        "count": 0,
        "merchants": defaultdict(float)
    })

    total_spend = 0

    for txn in transactions:
        category = txn.get("category", Category.OTHER.value)
        amount = txn.get("amount", 0)
        merchant = txn.get("normalized_merchant") or txn.get("merchant", "Unknown")

        # Skip income for spending breakdown
        if category == Category.INCOME.value:
            continue

        category_data[category]["total"] += amount
        category_data[category]["count"] += 1
        category_data[category]["merchants"][merchant] += amount
        total_spend += amount

    # Build summary
    summary = []
    for category, data in category_data.items():
        # Get top 3 merchants for this category
        sorted_merchants = sorted(
            data["merchants"].items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]

        top_merchants = [
            {"name": name, "total": round(total, 2)}
            for name, total in sorted_merchants
        ]

        summary.append({
            "category": category,
            "total": round(data["total"], 2),
            "percent": round(data["total"] / total_spend * 100, 1) if total_spend > 0 else 0,
            "transaction_count": data["count"],
            "top_merchants": top_merchants
        })

    # Sort by total spend descending
    summary.sort(key=lambda x: x["total"], reverse=True)

    return summary
