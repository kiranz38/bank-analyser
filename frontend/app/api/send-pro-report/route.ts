import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || 'Leaky Wallet <onboarding@resend.dev>'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string | null
    const pdfFile = formData.get('pdf') as File | null

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    if (!pdfFile) {
      return NextResponse.json({ error: 'Missing PDF file' }, { status: 400 })
    }

    // Convert File to Buffer for Resend attachment
    const arrayBuffer = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
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
              <strong>What's inside:</strong> Monthly spending trends, subscription ROI scores, savings projections, priority action plan, behavioral insights, category deep dives, and a 12-week roadmap.
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

    if (error) {
      console.error('[Resend] Email send error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    console.log('[Resend] Pro Report sent successfully:', data?.id)
    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('[Resend] Error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
