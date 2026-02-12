import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayment, updatePayment, logEvent } from '@/lib/paymentStore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, reason } = body as { sessionId: string; reason?: string }

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // Look up payment record
    const record = getPayment(sessionId)

    // Get payment intent ID — either from our store or by retrieving the session
    let paymentIntentId = record?.paymentIntentId

    if (!paymentIntentId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null
    }

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'No payment intent found for this session' }, { status: 400 })
    }

    // Issue refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
    })

    if (record) {
      updatePayment(sessionId, { status: 'refunded' })
      logEvent(sessionId, 'refund_issued', `refund_id=${refund.id} reason=${reason || 'pdf_generation_failed'}`)
    }

    console.log(`[Refund] Issued: session=${sessionId} refund=${refund.id} reason=${reason}`)

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
    })
  } catch (error) {
    console.error('[Refund] Error:', error)
    const message = error instanceof Error ? error.message : 'Refund failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
