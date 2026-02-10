import { NextRequest, NextResponse } from 'next/server'

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox'

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW = 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  // Check if Plaid is configured
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    return NextResponse.json(
      { error: 'Bank connect is not configured' },
      { status: 503 }
    )
  }

  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { public_token } = body

    if (!public_token || typeof public_token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const plaidHost = PLAID_ENV === 'production'
      ? 'https://production.plaid.com'
      : PLAID_ENV === 'development'
        ? 'https://development.plaid.com'
        : 'https://sandbox.plaid.com'

    // Exchange public token for access token
    const exchangeResponse = await fetch(`${plaidHost}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token,
      }),
    })

    const exchangeData = await exchangeResponse.json()

    if (!exchangeResponse.ok) {
      console.error('[Plaid] Token exchange error:', exchangeData)
      return NextResponse.json(
        { error: 'Failed to connect bank account' },
        { status: 500 }
      )
    }

    const accessToken = exchangeData.access_token

    // Fetch transactions (last 90 days)
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const transactionsResponse = await fetch(`${plaidHost}/transactions/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 500,
          offset: 0,
        },
      }),
    })

    const transactionsData = await transactionsResponse.json()

    if (!transactionsResponse.ok) {
      // Handle case where transactions aren't ready yet
      if (transactionsData.error_code === 'PRODUCT_NOT_READY') {
        return NextResponse.json(
          { error: 'Transactions are being prepared. Please try again in a moment.' },
          { status: 202 }
        )
      }

      console.error('[Plaid] Transactions error:', transactionsData)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // IMPORTANT: Immediately revoke access token - we don't store it
    await fetch(`${plaidHost}/item/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: accessToken,
      }),
    })

    // Convert Plaid transactions to our format
    const normalizedTransactions = transactionsData.transactions
      .filter((tx: { amount: number }) => tx.amount > 0) // Plaid uses positive for debits
      .map((tx: {
        date: string
        name: string
        merchant_name?: string
        amount: number
        category?: string[]
      }) => ({
        date: tx.date,
        merchant: normalizemerchant(tx.merchant_name || tx.name),
        original_merchant: tx.merchant_name || tx.name,
        amount: tx.amount,
        category: tx.category?.[0] || 'Other',
      }))

    // Send to backend for analysis
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const analysisResponse = await fetch(`${apiUrl}/analyze/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: transactionsToCSV(normalizedTransactions),
      }),
    })

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json()
      console.error('[Plaid] Analysis error:', errorData)
      return NextResponse.json(
        { error: 'Failed to analyze transactions' },
        { status: 500 }
      )
    }

    const analysisResult = await analysisResponse.json()

    return NextResponse.json({
      success: true,
      result: analysisResult,
      transaction_count: normalizedTransactions.length,
      date_range: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error('[Plaid] Exchange token error:', error)
    return NextResponse.json(
      { error: 'Failed to process bank data' },
      { status: 500 }
    )
  }
}

// Normalize merchant names (same logic as backend)
function normalizemerchant(merchant: string): string {
  let normalized = merchant.toUpperCase().trim()
  // Remove card numbers, reference numbers
  normalized = normalized.replace(/\d{4,}/g, '')
  normalized = normalized.replace(/\s+/g, ' ')
  // Remove common prefixes
  const prefixes = ['SQ *', 'SP ', 'PAYPAL *', 'STRIPE *', 'PP*']
  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length)
    }
  }
  return normalized.trim()
}

// Convert transactions to CSV format for backend
function transactionsToCSV(transactions: Array<{
  date: string
  original_merchant: string
  amount: number
}>): string {
  const header = 'Date,Description,Amount'
  const rows = transactions.map(tx =>
    `${tx.date},"${tx.original_merchant.replace(/"/g, '""')}",${tx.amount}`
  )
  return [header, ...rows].join('\n')
}
