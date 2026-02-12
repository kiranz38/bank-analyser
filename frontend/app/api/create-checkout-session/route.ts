import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

const PRICE_CENTS = parseInt(process.env.PRO_REPORT_PRICE_CENTS || '499', 10)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body as { email?: string }

    // Build the origin from the request
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Leaky Wallet Pro Report',
              description:
                'Full spending analysis with monthly trends, subscription ROI, savings projections, priority action plan, behavioral insights, and 12-week roadmap.',
            },
            unit_amount: PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}?pro_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?pro_payment=cancelled`,
    }

    // Pre-fill email if provided
    if (email && typeof email === 'string') {
      sessionParams.customer_email = email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe] Checkout session error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
