import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayment, updatePayment, logEvent } from '@/lib/paymentStore'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, email, reason } = body as { sessionId: string; email?: string; reason?: string }

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 200) {
      return NextResponse.json({ error: 'Missing or invalid sessionId' }, { status: 400 })
    }

    // Always fetch from Stripe to get authoritative payment email — never trust client-supplied data alone
    let stripeSession: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    } catch {
      return NextResponse.json({ error: 'Invalid payment session' }, { status: 403 })
    }

    // Require caller to prove ownership by supplying the email that matches the Stripe record
    const confirmedEmail = stripeSession.customer_details?.email || stripeSession.customer_email
    if (!confirmedEmail || !email || email.toLowerCase() !== confirmedEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only refund paid sessions
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'No paid payment found for this session' }, { status: 400 })
    }

    // Look up payment record
    const record = getPayment(sessionId)

    const paymentIntentId = record?.paymentIntentId ||
      (typeof stripeSession.payment_intent === 'string'
        ? stripeSession.payment_intent
        : stripeSession.payment_intent?.id || null)

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
