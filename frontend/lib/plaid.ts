/**
 * Plaid Link integration utilities
 *
 * Handles:
 * - Link token creation
 * - Token exchange
 * - Transaction fetching and analysis
 */

export interface PlaidLinkResult {
  success: boolean
  result?: unknown
  transaction_count?: number
  date_range?: {
    start: string
    end: string
  }
  error?: string
}

/**
 * Create a Plaid Link token
 */
export async function createLinkToken(): Promise<{ link_token: string; expiration: string } | null> {
  try {
    const response = await fetch('/api/plaid/create-link-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to initialize bank connection')
    }

    return await response.json()
  } catch (error) {
    console.error('[Plaid] Create link token error:', error)
    return null
  }
}

/**
 * Exchange public token and get analysis results
 */
export async function exchangeTokenAndAnalyze(publicToken: string): Promise<PlaidLinkResult> {
  try {
    const response = await fetch('/api/plaid/exchange-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token: publicToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to process bank data',
      }
    }

    return {
      success: true,
      result: data.result,
      transaction_count: data.transaction_count,
      date_range: data.date_range,
    }
  } catch (error) {
    console.error('[Plaid] Exchange token error:', error)
    return {
      success: false,
      error: 'Failed to connect to bank',
    }
  }
}

/**
 * Check if Plaid is available (feature flag + region)
 */
export function isPlaidAvailable(): boolean {
  const betaEnabled = process.env.NEXT_PUBLIC_BANK_CONNECT_BETA === 'true'
  // In production, you would also check user's region
  return betaEnabled
}

/**
 * Supported countries for Plaid
 */
export const PLAID_SUPPORTED_COUNTRIES = ['US', 'GB'] as const
export type PlaidCountry = typeof PLAID_SUPPORTED_COUNTRIES[number]

/**
 * Check if user's country is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return PLAID_SUPPORTED_COUNTRIES.includes(countryCode as PlaidCountry)
}
