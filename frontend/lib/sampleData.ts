/**
 * Sample transaction dataset for "Try with sample data" mode.
 *
 * Contains realistic-looking but entirely fictional transactions.
 * No real brands tied to user data - uses generic/fictional merchant names.
 */

export interface SampleTransaction {
  date: string
  description: string
  amount: number
  category?: string
}

export const SAMPLE_TRANSACTIONS: SampleTransaction[] = [
  // Subscriptions (recurring)
  { date: '2025-01-03', description: 'STREAMFLIX MONTHLY', amount: -15.99 },
  { date: '2025-01-03', description: 'CLOUDTUNES PREMIUM', amount: -11.99 },
  { date: '2025-01-05', description: 'FITZONE GYM MEMBERSHIP', amount: -49.99 },
  { date: '2025-01-07', description: 'NEWSDIGEST DIGITAL', amount: -9.99 },
  { date: '2025-01-10', description: 'SECUREVAULT VPN', amount: -12.99 },
  { date: '2025-01-12', description: 'BOXFRESH MEAL KIT', amount: -59.99 },
  { date: '2025-01-15', description: 'DESIGNPRO SOFTWARE', amount: -22.99 },
  { date: '2025-01-18', description: 'LANGLEARN APP', amount: -14.99 },

  // Recurring from previous month (for detection)
  { date: '2024-12-03', description: 'STREAMFLIX MONTHLY', amount: -15.99 },
  { date: '2024-12-03', description: 'CLOUDTUNES PREMIUM', amount: -11.99 },
  { date: '2024-12-05', description: 'FITZONE GYM MEMBERSHIP', amount: -49.99 },
  { date: '2024-12-07', description: 'NEWSDIGEST DIGITAL', amount: -9.99 },
  { date: '2024-12-10', description: 'SECUREVAULT VPN', amount: -12.99 },
  { date: '2024-12-12', description: 'BOXFRESH MEAL KIT', amount: -59.99 },
  { date: '2024-12-15', description: 'DESIGNPRO SOFTWARE', amount: -22.99 },
  { date: '2024-12-18', description: 'LANGLEARN APP', amount: -14.99 },

  // Another month back
  { date: '2024-11-03', description: 'STREAMFLIX MONTHLY', amount: -15.99 },
  { date: '2024-11-03', description: 'CLOUDTUNES PREMIUM', amount: -11.99 },
  { date: '2024-11-05', description: 'FITZONE GYM MEMBERSHIP', amount: -49.99 },
  { date: '2024-11-07', description: 'NEWSDIGEST DIGITAL', amount: -9.99 },
  { date: '2024-11-10', description: 'SECUREVAULT VPN', amount: -12.99 },
  { date: '2024-11-12', description: 'BOXFRESH MEAL KIT', amount: -59.99 },
  { date: '2024-11-15', description: 'DESIGNPRO SOFTWARE', amount: -22.99 },
  { date: '2024-11-18', description: 'LANGLEARN APP', amount: -14.99 },

  // Groceries
  { date: '2025-01-02', description: 'GREENMART SUPERMARKET', amount: -87.45 },
  { date: '2025-01-06', description: 'FRESHFARE GROCERIES', amount: -62.30 },
  { date: '2025-01-09', description: 'GREENMART SUPERMARKET', amount: -95.12 },
  { date: '2025-01-13', description: 'QUICKSTOP CONVENIENCE', amount: -23.40 },
  { date: '2025-01-16', description: 'FRESHFARE GROCERIES', amount: -71.85 },
  { date: '2025-01-20', description: 'GREENMART SUPERMARKET', amount: -103.20 },
  { date: '2025-01-24', description: 'FRESHFARE GROCERIES', amount: -54.60 },
  { date: '2025-01-28', description: 'GREENMART SUPERMARKET', amount: -89.95 },

  // Dining & Delivery
  { date: '2025-01-04', description: 'QUICKBITE DELIVERY', amount: -34.50 },
  { date: '2025-01-08', description: 'CAFE CENTRAL', amount: -12.80 },
  { date: '2025-01-11', description: 'QUICKBITE DELIVERY', amount: -28.90 },
  { date: '2025-01-14', description: 'GOLDEN DRAGON RESTAURANT', amount: -45.00 },
  { date: '2025-01-17', description: 'CAFE CENTRAL', amount: -8.50 },
  { date: '2025-01-19', description: 'QUICKBITE DELIVERY', amount: -41.20 },
  { date: '2025-01-22', description: 'PIZZA PALACE', amount: -32.00 },
  { date: '2025-01-25', description: 'QUICKBITE DELIVERY', amount: -26.75 },
  { date: '2025-01-27', description: 'CAFE CENTRAL', amount: -15.20 },

  // Transport
  { date: '2025-01-02', description: 'CITYRIDE RIDESHARE', amount: -18.50 },
  { date: '2025-01-06', description: 'CITYRIDE RIDESHARE', amount: -22.30 },
  { date: '2025-01-10', description: 'METRO TRANSIT CARD', amount: -50.00 },
  { date: '2025-01-15', description: 'CITYRIDE RIDESHARE', amount: -15.80 },
  { date: '2025-01-20', description: 'PARKRIGHT PARKING', amount: -12.00 },
  { date: '2025-01-23', description: 'CITYRIDE RIDESHARE', amount: -24.60 },
  { date: '2025-01-28', description: 'FUELSTOP PETROL', amount: -65.40 },

  // Shopping
  { date: '2025-01-05', description: 'TRENDY THREADS CLOTHING', amount: -89.00 },
  { date: '2025-01-12', description: 'TECHMART ELECTRONICS', amount: -149.99 },
  { date: '2025-01-19', description: 'BOOKWORM ONLINE', amount: -34.95 },
  { date: '2025-01-26', description: 'HOMEGOODS STORE', amount: -67.50 },

  // Entertainment
  { date: '2025-01-08', description: 'CINEMAPLEX TICKETS', amount: -32.00 },
  { date: '2025-01-21', description: 'GAMESTATION PURCHASE', amount: -69.99 },

  // Fees & Charges
  { date: '2025-01-01', description: 'MONTHLY ACCOUNT FEE', amount: -10.00 },
  { date: '2025-01-15', description: 'ATM WITHDRAWAL FEE', amount: -2.50 },
  { date: '2025-01-22', description: 'INTERNATIONAL TXN FEE', amount: -4.50 },

  // Utilities
  { date: '2025-01-10', description: 'POWERCO ELECTRICITY', amount: -145.00 },
  { date: '2025-01-15', description: 'AQUAFLOW WATER', amount: -65.00 },
  { date: '2025-01-20', description: 'NETCONNECT INTERNET', amount: -79.99 },
  { date: '2025-01-25', description: 'MOBILETALK PHONE', amount: -55.00 },

  // Income
  { date: '2025-01-01', description: 'SALARY DEPOSIT', amount: 4500.00 },
  { date: '2025-01-15', description: 'SALARY DEPOSIT', amount: 4500.00 },
]

/**
 * Convert sample transactions to CSV text for the analysis pipeline.
 */
export function sampleDataToCSV(): string {
  const header = 'Date,Description,Amount'
  const rows = SAMPLE_TRANSACTIONS.map(
    t => `${t.date},${t.description},${t.amount.toFixed(2)}`
  )
  return [header, ...rows].join('\n')
}
