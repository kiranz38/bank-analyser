import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo - in production, use a database
const waitlist: Array<{ email: string; country: string; timestamp: string }> = []

// Rate limiting - simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

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

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

const VALID_COUNTRIES = ['US', 'UK', 'AU', 'CA', 'DE', 'FR', 'NZ', 'OTHER']

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, country } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate country
    if (!country || !VALID_COUNTRIES.includes(country)) {
      return NextResponse.json(
        { error: 'Please select a valid country' },
        { status: 400 }
      )
    }

    // Check for duplicate (in production, use database unique constraint)
    const exists = waitlist.find(entry => entry.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      // Don't reveal if email exists - just return success
      return NextResponse.json({ success: true })
    }

    // Add to waitlist
    waitlist.push({
      email: email.toLowerCase(),
      country,
      timestamp: new Date().toISOString()
    })

    // In production, you would:
    // 1. Store in database
    // 2. Send confirmation email
    // 3. Notify admin

    console.log(`[Waitlist] New signup: ${country} (total: ${waitlist.length})`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Waitlist] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

// GET endpoint to check waitlist count (admin only in production)
export async function GET() {
  return NextResponse.json({
    count: waitlist.length,
    countries: waitlist.reduce((acc, entry) => {
      acc[entry.country] = (acc[entry.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })
}
