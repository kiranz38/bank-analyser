import { NextRequest, NextResponse } from 'next/server'
import { getFailedDeliveries, updateDelivery } from '@/lib/deliveryStore'
import { sendReportEmail } from '@/lib/sendReportEmail'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (in prod) or an admin token
  const authHeader = request.headers.get('authorization')
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const failed = await getFailedDeliveries()

  if (failed.length === 0) {
    return NextResponse.json({ retried: 0, message: 'No failed deliveries to retry' })
  }

  const results: Array<{ sessionId: string; email: string; success: boolean; error?: string }> = []

  for (const delivery of failed) {
    const { stripeSessionId, email, pdfBlobUrl, retryCount } = delivery

    try {
      // Fetch PDF from Vercel Blob for retry attachment
      let pdfBuffer: Buffer | null = null
      if (pdfBlobUrl) {
        const blobRes = await fetch(pdfBlobUrl)
        if (blobRes.ok) {
          pdfBuffer = Buffer.from(await blobRes.arrayBuffer())
        }
      }

      const emailResult = await sendReportEmail({
        toEmail: email,
        subject: `Your Leaky Wallet report (retry #${retryCount + 1})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 32px 32px 24px; border-radius: 12px 12px 0 0;">
              <p style="color: #a7f3d0; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 8px;">Leaky Wallet</p>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.3;">
                Your savings report is ready
              </h1>
            </div>
            <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Apologies for the delay — we ran into a delivery issue earlier.
                Your personalised financial report is attached to this email.
              </p>
              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 28px 0;" />
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Leaky Wallet · whereismymoneygo.com<br />
                This report is for informational purposes only and does not constitute financial advice.
              </p>
            </div>
          </div>
        `,
        attachments: pdfBuffer
          ? [{ filename: 'leaky-wallet-pro-report.pdf', content: pdfBuffer, contentType: 'application/pdf' }]
          : [],
      })

      const newStatus = emailResult.ok ? 'sent' : 'failed'
      await updateDelivery(stripeSessionId, {
        emailStatus: newStatus,
        retryCount: retryCount + 1,
        lastAttemptAt: new Date(),
        errorMessage: emailResult.ok ? undefined : (emailResult.errorMessage || emailResult.errorCode),
      })

      results.push({ sessionId: stripeSessionId, email, success: emailResult.ok })
      console.log(`[CronRetry] session=${stripeSessionId} email=${email} success=${emailResult.ok} retry=${retryCount + 1}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await updateDelivery(stripeSessionId, {
        retryCount: retryCount + 1,
        lastAttemptAt: new Date(),
        errorMessage: msg,
      }).catch(() => {})
      results.push({ sessionId: stripeSessionId, email, success: false, error: msg })
      console.error(`[CronRetry] Failed for session=${stripeSessionId}:`, msg)
    }
  }

  const succeeded = results.filter(r => r.success).length
  return NextResponse.json({
    retried: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  })
}
