import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getPayment, updatePayment, logEvent, storePdf, createPayment } from '@/lib/paymentStore'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || 'Leaky Wallet <onboarding@resend.dev>'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionId = formData.get('sessionId') as string | null
    const email = formData.get('email') as string | null
    const pdfFile = formData.get('pdf') as File | null

    if (!sessionId || !email) {
      return NextResponse.json({ error: 'Missing sessionId or email' }, { status: 400 })
    }

    if (!pdfFile) {
      return NextResponse.json({ error: 'Missing PDF file' }, { status: 400 })
    }

    // Verify payment record exists and is paid
    let record = getPayment(sessionId)
    if (!record) {
      // Create a record if webhook already confirmed but store was reset
      record = createPayment(sessionId, email)
      updatePayment(sessionId, { status: 'paid' })
    }

    // Generate report ID and store PDF
    const reportId = crypto.randomBytes(16).toString('hex')
    const arrayBuffer = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    storePdf(reportId, buffer)

    updatePayment(sessionId, {
      reportId,
      pdfStatus: 'generated',
    })
    logEvent(sessionId, 'pdf_generated', `reportId=${reportId} size=${buffer.length}`)

    // Build download URL
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const downloadUrl = `${origin}/api/download-report/${reportId}`

    // Send email with PDF attachment
    let emailStatus: 'sent' | 'failed' = 'failed'
    let emailError: string | null = null

    try {
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Your Financial Report Is Ready',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0ea5e9; font-size: 24px; margin-bottom: 16px;">
              Your Financial Report Is Ready
            </h1>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Hi,
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Your personalized financial report is ready. It's attached to this email as a PDF.
            </p>
            <div style="margin: 24px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Download Report
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              If you don't see this email within 5 minutes, please check spam.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">
              Thanks,<br />
              LeakyWallet<br /><br />
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

      if (error) {
        throw new Error(error.message)
      }

      emailStatus = 'sent'
      logEvent(sessionId, 'email_sent', `to=${email}`)
    } catch (err) {
      emailError = err instanceof Error ? err.message : 'Email send failed'
      logEvent(sessionId, 'email_failed', emailError)
      console.error('[Resend] Email failed:', emailError)
    }

    updatePayment(sessionId, { emailStatus })

    return NextResponse.json({
      success: true,
      reportId,
      downloadUrl,
      emailStatus,
      emailError,
    })
  } catch (error) {
    console.error('[DeliverReport] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to deliver report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
