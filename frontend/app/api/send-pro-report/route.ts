import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendReportEmail } from '@/lib/sendReportEmail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

// Rate limit: max 3 send attempts per session ID (prevents email flooding)
const _sessionAttempts = new Map<string, number>()

const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionId = formData.get('sessionId') as string | null
    const email = formData.get('email') as string | null
    const pdfFile = formData.get('pdf') as File | null

    // --- Input validation ---
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 200) {
      return NextResponse.json({ error: 'Missing or invalid sessionId' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 })
    }
    if (!pdfFile) {
      return NextResponse.json({ error: 'Missing PDF file' }, { status: 400 })
    }

    // --- Rate limit per session ---
    const attempts = _sessionAttempts.get(sessionId) ?? 0
    if (attempts >= 3) {
      return NextResponse.json({ error: 'Too many send attempts for this session' }, { status: 429 })
    }

    // --- Stripe verification: session must be paid ---
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch {
      return NextResponse.json({ error: 'Invalid payment session' }, { status: 403 })
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 403 })
    }

    // --- Email must match Stripe session ---
    const stripeEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase()
    if (stripeEmail && stripeEmail !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match payment record' }, { status: 403 })
    }

    // --- PDF size guard ---
    const arrayBuffer = await pdfFile.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'PDF too large' }, { status: 400 })
    }
    const buffer = Buffer.from(arrayBuffer)

    // Record attempt before sending
    _sessionAttempts.set(sessionId, attempts + 1)

    const result = await sendReportEmail({
      toEmail: email,
      subject: 'Your Leaky Wallet Pro Report',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0ea5e9; font-size: 24px; margin-bottom: 8px;">
            Your Pro Report is attached
          </h1>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Thank you for purchasing the Leaky Wallet Pro Report. Your personalized spending analysis is attached as a PDF.
          </p>
          <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
              <strong>What&apos;s inside:</strong> Monthly spending trends, subscription ROI scores, savings projections, priority action plan, behavioral insights, category deep dives, and a 12-week roadmap.
            </p>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            If you have any questions about your report, simply reply to this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            Leaky Wallet &mdash; Find hidden subscriptions and spending leaks.<br />
            This report is for informational purposes only and does not constitute financial advice.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'leaky-wallet-pro-report.pdf',
          content: buffer,
          contentType: 'application/pdf',
        },
      ],
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: 'Failed to send email', code: result.errorCode },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: result.resendMessageId,
      usedFallback: result.usedFallback,
    })
  } catch (error) {
    console.error('[SendProReport] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
