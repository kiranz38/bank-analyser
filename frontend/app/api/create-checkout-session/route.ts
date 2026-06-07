import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createPayment } from '@/lib/paymentStore'
import { upsertDelivery, saveAnalysisSnapshot } from '@/lib/deliveryStore'
import { trackMetric } from '@/lib/metrics'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

const PRICE_CENTS = parseInt(process.env.PRO_REPORT_PRICE_CENTS || '199', 10)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, legalAcceptedAt, analysisResults } = body as {
      email?: string
      legalAcceptedAt?: string
      analysisResults?: object
    }

    if (!legalAcceptedAt) {
      return NextResponse.json(
        { error: 'Legal acknowledgement required before checkout' },
        { status: 400 }
      )
    }

    // Use the canonical app URL from env — never trust the client-supplied Origin header,
    // as it can be spoofed to redirect Stripe callbacks to an attacker's domain.
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://whereismymoneygo.com'

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
      success_url: `${appOrigin}?pro_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}?pro_payment=cancelled`,
      metadata: {
        legal_accepted_at: legalAcceptedAt,
      },
    }

    if (email && typeof email === 'string') {
      sessionParams.customer_email = email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Create in-memory payment record (fast path)
    createPayment(session.id, email || '', legalAcceptedAt)

    // Persist to DB immediately — email captured before Stripe redirect
    const delivery = await upsertDelivery(session.id, email || '', legalAcceptedAt)

    // Store analysis snapshot if provided so we can re-generate later
    if (analysisResults && delivery) {
      await saveAnalysisSnapshot(delivery.id, analysisResults).catch(err =>
        logger.error('Failed to save analysis snapshot', { sessionId: session.id, error: String(err) })
      )
    }

    await trackMetric('checkout_started', {
      sessionId: session.id,
      email: email || undefined,
      valueUsd: PRICE_CENTS / 100,
    })

    logger.info('Checkout session created', { sessionId: session.id, email: email || 'unknown' })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('[Stripe] Checkout session error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
