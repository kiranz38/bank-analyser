import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayment, updatePayment, logEvent, createPayment } from '@/lib/paymentStore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (webhookSecret && signature) {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else if (!webhookSecret) {
      // No webhook secret configured — parse event without verification (dev only)
      console.warn('[Webhook] No STRIPE_WEBHOOK_SECRET configured — skipping signature verification')
      event = JSON.parse(body) as Stripe.Event
    } else {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('[Webhook] Signature error:', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const sessionId = session.id
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null

      let record = getPayment(sessionId)
      if (!record) {
        // Payment record may not exist if created before store was initialized
        const email = session.customer_details?.email || session.customer_email || ''
        record = createPayment(sessionId, email, session.metadata?.legal_accepted_at)
      }

      updatePayment(sessionId, {
        paymentIntentId,
        status: 'paid',
        email: session.customer_details?.email || record.email,
      })
      logEvent(sessionId, 'payment_success', `intent=${paymentIntentId}`)
      logEvent(sessionId, 'payment_webhook_verified')

      console.log(`[Webhook] Payment confirmed: session=${sessionId} intent=${paymentIntentId}`)
      break
    }

    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      console.log(`[Webhook] PaymentIntent succeeded: ${intent.id}`)
      break
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
