/**
 * Sample transaction dataset for "Try with sample data" mode.
 *
 * Full 12-month annual statement (Jan–Dec 2024) with realistic spending
 * patterns across all categories.  Entirely fictional merchants and data.
 */

export interface SampleTransaction {
  date: string
  description: string
  amount: number
  category?: string
}

// ---------------------------------------------------------------------------
// Helper: generate one month of recurring subscriptions
// ---------------------------------------------------------------------------
function subsForMonth(y: number, m: string, streamflixPrice: number): SampleTransaction[] {
  return [
    { date: `${y}-${m}-03`, description: 'NETFLIX', amount: -streamflixPrice },
    { date: `${y}-${m}-03`, description: 'SPOTIFY PREMIUM', amount: -11.99 },
    { date: `${y}-${m}-05`, description: 'ANYTIME FITNESS MEMBERSHIP', amount: -49.99 },
    { date: `${y}-${m}-07`, description: 'ADOBE CREATIVE CLOUD', amount: -54.99 },
    { date: `${y}-${m}-10`, description: 'ICLOUD STORAGE', amount: -3.99 },
    { date: `${y}-${m}-12`, description: 'HELLO FRESH MEAL KIT', amount: -59.99 },
    { date: `${y}-${m}-15`, description: 'MICROSOFT 365', amount: -12.99 },
    { date: `${y}-${m}-18`, description: 'HEADSPACE APP', amount: -14.99 },
  ]
}

// ---------------------------------------------------------------------------
// Build the full year
// ---------------------------------------------------------------------------
function buildAnnualTransactions(): SampleTransaction[] {
  const txns: SampleTransaction[] = []
  const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
  const y = 2024

  for (const m of months) {
    const mi = parseInt(m)

    // Netflix price hike in July ($15.99 -> $22.99) — triggers price-change detection
    const netflixPrice = mi >= 7 ? 22.99 : 15.99
    txns.push(...subsForMonth(y, m, netflixPrice))

    // --- Income (twice a month) ---
    txns.push({ date: `${y}-${m}-01`, description: 'SALARY DEPOSIT', amount: 4500.00 })
    txns.push({ date: `${y}-${m}-15`, description: 'SALARY DEPOSIT', amount: 4500.00 })

    // --- Fees (every month) ---
    txns.push({ date: `${y}-${m}-01`, description: 'MONTHLY ACCOUNT FEE', amount: -10.00 })
    txns.push({ date: `${y}-${m}-15`, description: 'ATM WITHDRAWAL FEE', amount: -2.50 })
    if (mi % 2 === 0) {
      txns.push({ date: `${y}-${m}-20`, description: 'INTERNATIONAL TXN FEE', amount: -4.50 })
    }
    if (mi % 3 === 0) {
      txns.push({ date: `${y}-${m}-25`, description: 'OVERDRAFT FEE', amount: -15.00 })
    }

    // --- Groceries (weekly-ish, varies seasonally) ---
    const groceryBase = mi >= 11 || mi <= 1 ? 1.15 : 1.0 // holiday inflation
    txns.push({ date: `${y}-${m}-02`, description: 'WOOLWORTHS SUPERMARKET', amount: -(87.45 * groceryBase) })
    txns.push({ date: `${y}-${m}-06`, description: 'COLES SUPERMARKET', amount: -(62.30 * groceryBase) })
    txns.push({ date: `${y}-${m}-10`, description: 'WOOLWORTHS SUPERMARKET', amount: -(95.12 * groceryBase) })
    txns.push({ date: `${y}-${m}-14`, description: 'ALDI', amount: -(48.90 * groceryBase) })
    txns.push({ date: `${y}-${m}-18`, description: 'COLES SUPERMARKET', amount: -(71.85 * groceryBase) })
    txns.push({ date: `${y}-${m}-22`, description: 'WOOLWORTHS SUPERMARKET', amount: -(103.20 * groceryBase) })
    txns.push({ date: `${y}-${m}-26`, description: 'COLES SUPERMARKET', amount: -(54.60 * groceryBase) })
    if (mi % 2 === 0) {
      txns.push({ date: `${y}-${m}-28`, description: 'COSTCO WHOLESALE', amount: -(185.40 * groceryBase) })
    }

    // --- Dining & Delivery ---
    txns.push({ date: `${y}-${m}-04`, description: 'UBER EATS', amount: -34.50 })
    txns.push({ date: `${y}-${m}-08`, description: 'STARBUCKS', amount: -7.80 })
    txns.push({ date: `${y}-${m}-11`, description: 'UBER EATS', amount: -28.90 })
    txns.push({ date: `${y}-${m}-14`, description: 'DOORDASH', amount: -45.00 })
    txns.push({ date: `${y}-${m}-17`, description: 'STARBUCKS', amount: -6.50 })
    txns.push({ date: `${y}-${m}-19`, description: 'UBER EATS', amount: -41.20 })
    txns.push({ date: `${y}-${m}-22`, description: 'DOMINOS PIZZA', amount: -32.00 })
    txns.push({ date: `${y}-${m}-25`, description: 'UBER EATS', amount: -26.75 })
    txns.push({ date: `${y}-${m}-27`, description: 'STARBUCKS', amount: -8.20 })
    if (mi % 2 === 1) {
      txns.push({ date: `${y}-${m}-29`, description: 'MENULOG', amount: -38.50 })
    }

    // --- Transport ---
    txns.push({ date: `${y}-${m}-03`, description: 'UBER TRIP', amount: -18.50 })
    txns.push({ date: `${y}-${m}-07`, description: 'UBER TRIP', amount: -22.30 })
    txns.push({ date: `${y}-${m}-10`, description: 'OPAL CARD TOP UP', amount: -50.00 })
    txns.push({ date: `${y}-${m}-16`, description: 'UBER TRIP', amount: -15.80 })
    txns.push({ date: `${y}-${m}-20`, description: 'WILSON PARKING', amount: -12.00 })
    txns.push({ date: `${y}-${m}-24`, description: 'UBER TRIP', amount: -24.60 })
    txns.push({ date: `${y}-${m}-28`, description: 'SHELL PETROL', amount: -(65.40 + (mi % 3) * 8) })

    // --- Shopping (varies by month) ---
    txns.push({ date: `${y}-${m}-05`, description: 'AMAZON PURCHASE', amount: -(29.95 + mi * 5) })
    if (mi % 2 === 0) {
      txns.push({ date: `${y}-${m}-12`, description: 'KMART', amount: -47.50 })
    }
    if (mi % 3 === 0) {
      txns.push({ date: `${y}-${m}-19`, description: 'IKEA', amount: -189.00 })
    }
    // Holiday shopping spike
    if (mi === 11 || mi === 12) {
      txns.push({ date: `${y}-${m}-08`, description: 'MYER DEPARTMENT STORE', amount: -245.00 })
      txns.push({ date: `${y}-${m}-15`, description: 'APPLE STORE', amount: -399.00 })
      txns.push({ date: `${y}-${m}-20`, description: 'AMAZON PURCHASE', amount: -189.99 })
    }

    // --- Utilities (quarterly or monthly) ---
    txns.push({ date: `${y}-${m}-10`, description: 'AGL ELECTRICITY', amount: -(145.00 + (mi >= 6 && mi <= 8 ? 55 : 0)) })
    if (mi % 3 === 0) {
      txns.push({ date: `${y}-${m}-15`, description: 'SYDNEY WATER', amount: -185.00 })
    }
    txns.push({ date: `${y}-${m}-20`, description: 'TELSTRA INTERNET', amount: -79.99 })
    txns.push({ date: `${y}-${m}-25`, description: 'OPTUS MOBILE', amount: -55.00 })

    // --- Health & Fitness ---
    if (mi % 2 === 0) {
      txns.push({ date: `${y}-${m}-08`, description: 'PRICELINE PHARMACY', amount: -32.50 })
    }
    if (mi % 3 === 1) {
      txns.push({ date: `${y}-${m}-12`, description: 'DR SMITH MEDICAL', amount: -85.00 })
    }
    if (mi % 4 === 0) {
      txns.push({ date: `${y}-${m}-18`, description: 'BUPA HEALTH INSURANCE', amount: -186.50 })
    }

    // --- Entertainment ---
    txns.push({ date: `${y}-${m}-09`, description: 'STEAM GAME PURCHASE', amount: -(14.99 + (mi % 4) * 10) })
    if (mi % 2 === 0) {
      txns.push({ date: `${y}-${m}-16`, description: 'EVENT CINEMAS', amount: -28.00 })
    }
    if (mi % 3 === 2) {
      txns.push({ date: `${y}-${m}-21`, description: 'TICKETMASTER EVENT', amount: -95.00 })
    }

    // --- Travel (occasional) ---
    if (mi === 4) {
      txns.push({ date: `${y}-04-02`, description: 'QANTAS AIRWAYS', amount: -485.00 })
      txns.push({ date: `${y}-04-03`, description: 'AIRBNB BOOKING', amount: -620.00 })
      txns.push({ date: `${y}-04-05`, description: 'HERTZ CAR RENTAL', amount: -195.00 })
    }
    if (mi === 9) {
      txns.push({ date: `${y}-09-10`, description: 'JETSTAR FLIGHT', amount: -289.00 })
      txns.push({ date: `${y}-09-11`, description: 'BOOKING.COM HOTEL', amount: -340.00 })
    }

    // --- Micro-leaks: frequent small coffee/convenience (triggers micro-leak detection) ---
    txns.push({ date: `${y}-${m}-01`, description: 'STARBUCKS', amount: -5.50 })
    txns.push({ date: `${y}-${m}-03`, description: 'STARBUCKS', amount: -6.20 })
    txns.push({ date: `${y}-${m}-05`, description: 'STARBUCKS', amount: -5.80 })
    txns.push({ date: `${y}-${m}-09`, description: 'STARBUCKS', amount: -7.10 })
    txns.push({ date: `${y}-${m}-12`, description: 'STARBUCKS', amount: -5.90 })
    txns.push({ date: `${y}-${m}-16`, description: 'STARBUCKS', amount: -6.40 })
    txns.push({ date: `${y}-${m}-19`, description: 'STARBUCKS', amount: -5.70 })
    txns.push({ date: `${y}-${m}-23`, description: 'STARBUCKS', amount: -7.30 })

    // --- Transfers (outgoing, not leaks) ---
    if (mi % 2 === 0) {
      txns.push({ date: `${y}-${m}-01`, description: 'TRANSFER TO SAVINGS', amount: -500.00 })
    }

    // --- BNPL / Buy Now Pay Later ---
    if (mi >= 3 && mi <= 8) {
      txns.push({ date: `${y}-${m}-14`, description: 'AFTERPAY PAYMENT', amount: -37.25 })
    }
  }

  // Sort by date
  txns.sort((a, b) => a.date.localeCompare(b.date))

  // Round all amounts to 2 decimal places
  for (const t of txns) {
    t.amount = Math.round(t.amount * 100) / 100
  }

  return txns
}

export const SAMPLE_TRANSACTIONS: SampleTransaction[] = buildAnnualTransactions()

/**
 * Convert sample transactions to CSV text for the analysis pipeline.
 */
export function sampleDataToCSV(): string {
  const header = 'Date,Description,Amount'
  const rows = SAMPLE_TRANSACTIONS.map(
    t => `${t.date},"${t.description}",${t.amount.toFixed(2)}`
  )
  return [header, ...rows].join('\n')
}
