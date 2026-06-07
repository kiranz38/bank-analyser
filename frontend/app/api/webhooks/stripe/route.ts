import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayment, updatePayment, logEvent, createPayment } from '@/lib/paymentStore'
import { upsertDelivery, updateDelivery } from '@/lib/deliveryStore'
import { trackMetric } from '@/lib/metrics'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!webhookSecret) {
      logger.error('STRIPE_WEBHOOK_SECRET not configured — rejecting webhook')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed'
    logger.error('Webhook signature error', { error: msg })
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const sessionId = session.id
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null

      let record = getPayment(sessionId)
      if (!record) {
        const email = session.customer_details?.email || session.customer_email || ''
        record = createPayment(sessionId, email, session.metadata?.legal_accepted_at)
      }

      const confirmedEmail = session.customer_details?.email || record.email
      updatePayment(sessionId, { paymentIntentId, status: 'paid', email: confirmedEmail })
      logEvent(sessionId, 'payment_success', `intent=${paymentIntentId}`)
      logEvent(sessionId, 'payment_webhook_verified')

      // Persist to DB
      await upsertDelivery(sessionId, confirmedEmail, session.metadata?.legal_accepted_at)
      await updateDelivery(sessionId, {
        paymentIntentId: paymentIntentId || undefined,
        paymentStatus: 'paid',
        email: confirmedEmail,
      }).catch(err => logger.error('DB update failed in webhook', { sessionId, error: String(err) }))

      // Track revenue metric
      await trackMetric('payment_confirmed', {
        sessionId,
        email: confirmedEmail,
        valueUsd: 1.99,
      })

      logger.info('Payment confirmed', { sessionId, email: confirmedEmail, paymentIntentId: paymentIntentId || 'none' })
      break
    }

    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      logger.info('PaymentIntent succeeded', { paymentIntentId: intent.id })
      break
    }

    default:
      logger.info('Unhandled Stripe event', { type: event.type })
  }

  return NextResponse.json({ received: true })
}
