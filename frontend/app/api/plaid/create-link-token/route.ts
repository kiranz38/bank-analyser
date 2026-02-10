import { NextRequest, NextResponse } from 'next/server'

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox'

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10
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
    const plaidHost = PLAID_ENV === 'production'
      ? 'https://production.plaid.com'
      : PLAID_ENV === 'development'
        ? 'https://development.plaid.com'
        : 'https://sandbox.plaid.com'

    // Generate a unique user ID for this session
    const clientUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const response = await fetch(`${plaidHost}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        user: {
          client_user_id: clientUserId,
        },
        client_name: 'Leaky Wallet',
        products: ['transactions'],
        country_codes: ['US', 'GB'],
        language: 'en',
        // Webhook for production (optional)
        // webhook: 'https://yourapp.com/api/plaid/webhook',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Plaid] Link token error:', data)
      return NextResponse.json(
        { error: 'Failed to initialize bank connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      link_token: data.link_token,
      expiration: data.expiration,
    })
  } catch (error) {
    console.error('[Plaid] Create link token error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to bank service' },
      { status: 500 }
    )
  }
}
