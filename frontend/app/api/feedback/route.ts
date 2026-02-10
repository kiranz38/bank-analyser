import { NextRequest, NextResponse } from 'next/server'

// Feedback storage - in production, use a database
interface FeedbackEntry {
  id: string
  rating: 'positive' | 'negative'
  reasons: string[]
  comment: string | null
  context: {
    monthlyLeak?: number
    subscriptionCount?: number
  }
  timestamp: string
  ip: string
}

const feedbackStore: FeedbackEntry[] = []

// Rate limiting - 5 submissions per day per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW = 24 * 60 * 60 * 1000 // 24 hours

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT - record.count }
}

// Valid feedback reasons
const VALID_POSITIVE_REASONS = ['found_savings', 'easy_to_use', 'accurate', 'other']
const VALID_NEGATIVE_REASONS = ['not_accurate', 'missing_features', 'confusing', 'parsing_issues', 'other']

function validateFeedback(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  const { rating, reasons, comment } = body as Record<string, unknown>

  // Validate rating
  if (!rating || (rating !== 'positive' && rating !== 'negative')) {
    return { valid: false, error: 'Invalid rating' }
  }

  // Validate reasons
  if (reasons !== undefined) {
    if (!Array.isArray(reasons)) {
      return { valid: false, error: 'Reasons must be an array' }
    }

    const validReasons = rating === 'positive' ? VALID_POSITIVE_REASONS : VALID_NEGATIVE_REASONS
    for (const reason of reasons) {
      if (typeof reason !== 'string' || !validReasons.includes(reason)) {
        return { valid: false, error: 'Invalid reason' }
      }
    }

    if (reasons.length > 5) {
      return { valid: false, error: 'Too many reasons selected' }
    }
  }

  // Validate comment
  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string') {
      return { valid: false, error: 'Comment must be a string' }
    }
    if (comment.length > 500) {
      return { valid: false, error: 'Comment too long (max 500 characters)' }
    }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + RATE_WINDOW),
          }
        }
      )
    }

    const body = await request.json()

    // Validate feedback
    const validation = validateFeedback(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { rating, reasons, comment, context } = body

    // Create feedback entry
    const entry: FeedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rating,
      reasons: reasons || [],
      comment: comment?.trim() || null,
      context: {
        monthlyLeak: typeof context?.monthlyLeak === 'number' ? context.monthlyLeak : undefined,
        subscriptionCount: typeof context?.subscriptionCount === 'number' ? context.subscriptionCount : undefined,
      },
      timestamp: new Date().toISOString(),
      ip: ip.substring(0, 3) + '***', // Anonymize IP for storage
    }

    // Store feedback
    feedbackStore.push(entry)

    // Log for monitoring (in production, send to analytics/database)
    console.log(`[Feedback] ${rating} - Reasons: ${entry.reasons.join(', ') || 'none'} - Comment: ${entry.comment ? 'yes' : 'no'}`)

    return NextResponse.json(
      { success: true, id: entry.id },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        }
      }
    )
  } catch (error) {
    console.error('[Feedback] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

// GET endpoint for admin/analytics (in production, add authentication)
export async function GET(request: NextRequest) {
  // Simple API key check (in production, use proper auth)
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.FEEDBACK_API_KEY && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const total = feedbackStore.length
  const positive = feedbackStore.filter(f => f.rating === 'positive').length
  const negative = feedbackStore.filter(f => f.rating === 'negative').length

  // Aggregate reasons
  const reasonCounts: Record<string, number> = {}
  for (const entry of feedbackStore) {
    for (const reason of entry.reasons) {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    }
  }

  // Recent comments (anonymized)
  const recentComments = feedbackStore
    .filter(f => f.comment)
    .slice(-10)
    .map(f => ({
      rating: f.rating,
      comment: f.comment,
      timestamp: f.timestamp,
    }))

  return NextResponse.json({
    total,
    positive,
    negative,
    positiveRate: total > 0 ? Math.round((positive / total) * 100) : 0,
    reasonCounts,
    recentComments,
  })
}
