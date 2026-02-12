import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      paid: session.payment_status === 'paid',
      customer_email: session.customer_details?.email || session.customer_email || null,
      amount_total: session.amount_total,
      currency: session.currency,
    })
  } catch (error) {
    console.error('[Stripe] Payment verification error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to verify payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
