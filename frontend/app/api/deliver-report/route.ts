import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayment, updatePayment, logEvent, storePdf, createPayment } from '@/lib/paymentStore'
import { sendReportEmail } from '@/lib/sendReportEmail'
import { getDelivery, updateDelivery } from '@/lib/deliveryStore'
import { trackMetric } from '@/lib/metrics'
import { logger } from '@/lib/logger'
import { put } from '@vercel/blob'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionId = formData.get('sessionId') as string | null
    const email = formData.get('email') as string | null
    const pdfFile = formData.get('pdf') as File | null

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 200) {
      return NextResponse.json({ error: 'Missing or invalid sessionId' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 })
    }
    if (!pdfFile) {
      return NextResponse.json({ error: 'Missing PDF file' }, { status: 400 })
    }

    // Verify Stripe payment — accept cached paid record to avoid extra API calls on retry
    let record = getPayment(sessionId)
    if (!record || record.status !== 'paid') {
      let stripeSession: Stripe.Checkout.Session
      try {
        stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
      } catch {
        return NextResponse.json({ error: 'Invalid payment session' }, { status: 403 })
      }
      if (stripeSession.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment not completed' }, { status: 403 })
      }
      // Stripe confirms payment — create or promote local record
      if (!record) {
        record = createPayment(sessionId, email)
      }
      updatePayment(sessionId, { status: 'paid' })
    }

    // PDF size guard
    const sizeCheck = await pdfFile.arrayBuffer()
    if (sizeCheck.byteLength > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'PDF too large' }, { status: 400 })
    }

    const reportId = crypto.randomBytes(16).toString('hex')
    const buffer = Buffer.from(sizeCheck)

    // Store in-memory for immediate download
    storePdf(reportId, buffer)

    // Upload to Vercel Blob for persistent retry storage
    let pdfBlobUrl: string | null = null
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`pro-reports/${sessionId}/${reportId}.pdf`, buffer, {
          access: 'public',
          contentType: 'application/pdf',
        })
        pdfBlobUrl = blob.url
      } catch (blobErr) {
        console.error('[DeliverReport] Blob upload failed (non-fatal):', blobErr)
      }
    }

    updatePayment(sessionId, { reportId, pdfStatus: 'generated' })
    logEvent(sessionId, 'pdf_generated', `reportId=${reportId} size=${buffer.length}`)

    // Persist PDF status to DB
    const delivery = await getDelivery(sessionId)
    if (delivery) {
      await updateDelivery(sessionId, {
        reportId,
        pdfStatus: 'generated',
        pdfSizeBytes: buffer.length,
        pdfBlobUrl: pdfBlobUrl || undefined,
        lastAttemptAt: new Date(),
      }).catch(err => console.error('[DeliverReport] DB pdfStatus update failed:', err))
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const downloadUrl = `${origin}/api/download-report/${reportId}`

    const emailResult = await sendReportEmail({
      toEmail: email,
      subject: 'Your Leaky Wallet savings report is ready',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 32px 32px 24px; border-radius: 12px 12px 0 0;">
            <p style="color: #a7f3d0; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 8px;">Leaky Wallet</p>
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.3;">
              Your savings report is ready
            </h1>
          </div>
          <!-- Body -->
          <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Your personalised financial report is attached to this email as a PDF.
              It includes your full spending breakdown, every recurring charge we found, and a step-by-step savings plan.
            </p>
            <div style="margin: 28px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #059669; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Download Your Report
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
              The PDF is also attached directly to this email if the button doesn't work.
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
              If you didn't expect this email, you can safely ignore it.
            </p>
            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 28px 0;" />
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Leaky Wallet · whereismymoneygo.com<br />
              This report is for informational purposes only and does not constitute financial advice.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'leaky-wallet-pro-report.pdf',
          content: buffer,
          contentType: 'application/pdf',
        },
      ],
      downloadUrl,
    })

    const emailStatus: 'sent' | 'failed' = emailResult.ok ? 'sent' : 'failed'
    updatePayment(sessionId, { emailStatus })

    // Persist email outcome to DB
    await updateDelivery(sessionId, {
      emailStatus,
      errorMessage: emailResult.ok ? undefined : (emailResult.errorMessage || emailResult.errorCode),
      lastAttemptAt: new Date(),
    }).catch(err => logger.error('DB emailStatus update failed', { sessionId, error: String(err) }))

    if (emailResult.ok) {
      const detail = emailResult.usedFallback
        ? `messageId=${emailResult.resendMessageId} usedFallback=true`
        : `messageId=${emailResult.resendMessageId}`
      logEvent(sessionId, 'email_sent', detail)
      await trackMetric('email_sent', { sessionId, email })
      logger.info('Report email sent', { sessionId, email, usedFallback: emailResult.usedFallback ?? false, blobStored: !!pdfBlobUrl })
    } else {
      logEvent(sessionId, 'email_failed', emailResult.errorMessage || emailResult.errorCode || 'unknown')
      await trackMetric('email_failed', { sessionId, email, errorCode: emailResult.errorCode })
      logger.error('Report email failed', { sessionId, email, error: emailResult.errorMessage || emailResult.errorCode || 'unknown' })
    }

    return NextResponse.json({
      success: true,
      reportId,
      downloadUrl,
      emailStatus,
      emailError: emailResult.ok ? null : (emailResult.errorMessage || emailResult.errorCode),
      usedFallback: emailResult.usedFallback,
    })
  } catch (error) {
    console.error('[DeliverReport] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to deliver report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
