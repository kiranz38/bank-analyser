'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  Star, Mail, FileText, Activity, Clock, TrendingUp, LayoutGrid,
  CreditCard, Lock, Download, CheckCircle, XCircle, Loader2, AlertCircle,
} from 'lucide-react'
import {
  trackProUpsellViewed,
  trackProReportGenerated,
  trackProReportDownloaded,
  trackProCheckoutStarted,
  trackProLegalAccepted,
  trackProPdfDownloadClicked,
  trackProRefundIssued,
  trackProBuyClicked,
  trackProPayClicked,
} from '@/lib/analytics'
import type { AnalysisResult } from '@/lib/types'

type ProCardState = 'upsell' | 'checkout' | 'generating' | 'success' | 'error'

interface ProReportSectionProps {
  results: AnalysisResult
  proPaymentStatus?: 'success' | 'cancelled' | null
  proSessionId?: string | null
  proCustomerEmail?: string | null
}

export default function ProReportSection({ results, proPaymentStatus, proSessionId, proCustomerEmail }: ProReportSectionProps) {
  const [cardState, setCardState] = useState<ProCardState>('upsell')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [modalSuccess, setModalSuccess] = useState(false)

  const [legalData, setLegalData] = useState(false)
  const [legalNoRefund, setLegalNoRefund] = useState(false)

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<'sent' | 'failed' | 'pending' | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

  const [upsellTracked, setUpsellTracked] = useState(false)
  const [paymentHandled, setPaymentHandled] = useState(false)

  const bothLegalChecked = legalData && legalNoRefund

  useEffect(() => {
    if (!upsellTracked) {
      trackProUpsellViewed()
      setUpsellTracked(true)
    }
  }, [upsellTracked])

  useEffect(() => {
    if (paymentHandled) return
    if (proPaymentStatus === 'cancelled') {
      setErrorMsg('Payment was cancelled. You can try again whenever you\'re ready.')
      const timer = setTimeout(() => setErrorMsg(null), 6000)
      setPaymentHandled(true)
      return () => clearTimeout(timer)
    }
    if (proPaymentStatus === 'success' && proSessionId) {
      setPaymentHandled(true)
      generateAndDeliver(proSessionId, proCustomerEmail || '')
    }
  }, [proPaymentStatus, proSessionId, proCustomerEmail, paymentHandled])

  const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const generateAndDeliver = async (sessionId: string, customerEmail: string) => {
    setCardState('generating')
    setErrorMsg(null)
    setProgress(0)
    setProgressLabel('Loading modules...')

    let blob: Blob
    try {
      const { generateProReportWithWarnings } = await import('@/lib/proReportGenerator')
      const { validateReportData } = await import('@/lib/reportValidation')
      const { generateProPdf } = await import('@/lib/generateProPdf')
      const { runReportQa, applyQaResult } = await import('@/lib/reportQaClaude')
      const { trackEvent } = await import('@/lib/analytics')

      setProgress(15)
      setProgressLabel('Analyzing spending data...')
      const { report: rawReport, warnings } = generateProReportWithWarnings(results)

      setProgress(30)
      setProgressLabel('Validating report data...')
      const validation = validateReportData(rawReport)

      setProgress(40)
      setProgressLabel('Running quality checks...')
      const qaResult = await runReportQa(validation.safeData, validation)

      setProgress(60)
      setProgressLabel('Finalizing insights...')
      const { report: finalReport, omittedSections, isSafeMode } = applyQaResult(
        validation.safeData, qaResult, validation.failedSections
      )

      const reportMeta = {
        event: 'pro_report_quality_gate',
        valid: validation.valid, qa_pass: qaResult.pass, severity: qaResult.severity,
        omitted_sections_count: omittedSections.length, warnings_count: warnings.length,
        safe_mode: isSafeMode,
        section_counts: {
          monthly_trends: finalReport.monthly_trends.length,
          subscriptions: finalReport.subscription_insights.length,
          actions: finalReport.action_plan.length,
          categories: finalReport.category_deep_dives.length,
        },
      }
      console.log('[ProReport]', JSON.stringify(reportMeta))

      if (!validation.valid || !qaResult.pass || omittedSections.length > 0) {
        trackEvent('pro_report_quality_gate', {
          valid: validation.valid, qa_pass: qaResult.pass, severity: qaResult.severity,
          omitted_sections_count: omittedSections.length, warnings_count: warnings.length,
          safe_mode: isSafeMode,
        })
      }

      trackProReportGenerated()

      setProgress(70)
      setProgressLabel('Building your PDF...')
      blob = await generateProPdf(finalReport, {
        omittedSections, isSafeMode, warnings,
        narrativeBullets: qaResult.narrativeBullets, qaNote: qaResult.notesForUser,
      })
      setPdfBlob(blob)
    } catch (err) {
      console.error('Pro PDF generation failed:', err)
      const msg = err instanceof Error ? err.message : String(err)
      try {
        const refundRes = await fetch('/api/refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, reason: 'pdf_generation_failed' }),
        })
        if (refundRes.ok) {
          trackProRefundIssued()
          setErrorMsg(`Report generation failed: ${msg}. A full refund has been issued to your card.`)
        } else {
          setErrorMsg(`Report generation failed: ${msg}. Please contact support for a refund.`)
        }
      } catch {
        setErrorMsg(`Report generation failed: ${msg}. Please contact support for a refund.`)
      }
      setCardState('error')
      return
    }

    setProgress(85)
    setProgressLabel('Sending to your email...')
    try {
      const formData = new FormData()
      formData.append('sessionId', sessionId)
      formData.append('email', customerEmail)
      formData.append('pdf', blob, 'leaky-wallet-pro-report.pdf')

      const res = await fetch('/api/deliver-report', { method: 'POST', body: formData })
      const data = await res.json()

      setProgress(100)
      setProgressLabel('Done!')

      if (!res.ok) {
        console.warn('Deliver-report returned error:', data.error)
        setEmailStatus('failed')
      } else {
        setDownloadUrl(data.downloadUrl || null)
        setEmailStatus(data.emailStatus || null)
      }

      setModalSuccess(true)
      await new Promise(r => setTimeout(r, 2000))
      setModalSuccess(false)
      setCardState('success')
    } catch (deliveryErr) {
      console.warn('Deliver-report fetch failed (PDF still available):', deliveryErr)
      setProgress(100)
      setProgressLabel('Done!')
      setEmailStatus('failed')
      setModalSuccess(true)
      await new Promise(r => setTimeout(r, 2000))
      setModalSuccess(false)
      setCardState('success')
    }
  }

  const handleStartCheckout = () => {
    setEmailError(null)
    setErrorMsg(null)
    if (!email.trim()) { setEmailError('Please enter your email address'); return }
    if (!validateEmail(email.trim())) { setEmailError('Please enter a valid email address'); return }
    if (!bothLegalChecked) return
    trackProLegalAccepted()
    trackProBuyClicked()
    setCardState('checkout')
  }

  const handlePay = async () => {
    setLoading(true)
    setErrorMsg(null)
    trackProPayClicked()

    try {
      const legalAcceptedAt = new Date().toISOString()
      if (process.env.NODE_ENV === 'development') {
        await generateAndDeliver('dev-session-' + Date.now(), email.trim())
        setLoading(false)
        return
      }
      trackProCheckoutStarted()
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), legalAcceptedAt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
      if (data.url) { window.location.href = data.url } else { throw new Error('No checkout URL returned') }
    } catch (err) {
      console.error('Checkout failed:', err)
      setErrorMsg(`Checkout failed: ${err instanceof Error ? err.message : String(err)}`)
      setCardState('upsell')
      setLoading(false)
    }
  }

  const handleDownload = () => {
    trackProPdfDownloadClicked()
    trackProReportDownloaded('pdf')
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'leaky-wallet-pro-report.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  const showModal = cardState === 'checkout' || cardState === 'generating' || modalSuccess
  const showResult = cardState === 'success' || cardState === 'error'

  const proFeatures = [
    { icon: <Mail className="h-4 w-4" />, text: 'Send full report to your email' },
    { icon: <FileText className="h-4 w-4" />, text: 'Downloadable PDF summary' },
    { icon: <Activity className="h-4 w-4" />, text: 'Deeper spending insights' },
    { icon: <Clock className="h-4 w-4" />, text: 'Recurring charges detection' },
    { icon: <TrendingUp className="h-4 w-4" />, text: 'Personalised saving suggestions' },
    { icon: <LayoutGrid className="h-4 w-4" />, text: 'Category deep dives with trends' },
  ]

  return (
    <>
      {/* Checkout / Generating Modal */}
      <Dialog open={showModal} onOpenChange={(open) => {
        if (!open && cardState === 'checkout' && !loading) {
          setCardState('upsell')
          setLoading(false)
        }
      }}>
        <DialogContent className="max-w-sm">
          {modalSuccess ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle className="mb-3 h-12 w-12 text-emerald-500" />
              <h3 className="text-lg font-semibold">Your report is ready!</h3>
              {emailStatus === 'sent' && (proCustomerEmail || email) && (
                <p className="mt-1 text-sm text-muted-foreground">Sent to {proCustomerEmail || email}</p>
              )}
              {emailStatus === 'failed' && (
                <p className="mt-1 text-sm text-muted-foreground">Download available below</p>
              )}
            </div>
          ) : cardState === 'generating' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Loader2 className="mb-3 h-9 w-9 animate-spin text-primary" />
              <h3 className="text-lg font-semibold">Generating your report...</h3>
              <Progress value={progress} className="mt-4 h-2" />
              <p className="mt-2 text-sm text-muted-foreground">{progressLabel}</p>
              <p className="text-xs font-medium text-muted-foreground">{progress}%</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Confirm & Pay</h3>
              <p className="text-sm text-muted-foreground">
                Report will be sent to <strong>{email}</strong>
              </p>
              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Pro Financial Report (PDF)</span>
                  <span>$1.99</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
                  <span>Total</span>
                  <span>$1.99</span>
                </div>
              </div>
              <Button className="w-full" onClick={handlePay} disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting to Stripe...</>
                ) : (
                  <><CreditCard className="mr-2 h-4 w-4" /> Pay $1.99 — Secure Checkout</>
                )}
              </Button>
              <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secure payment via Stripe. We never see your card details.
              </p>
              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pro Upsell Card */}
      <Card className="relative overflow-hidden">
        <Badge className="absolute right-4 top-4 bg-amber-500 text-white">PRO</Badge>

        <CardContent className="p-6" style={showResult ? { opacity: 0.3, pointerEvents: 'none' } : undefined}>
          <div className="space-y-5">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Star className="h-5 w-5" />
                Get Your Full Report via Email
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Send the full detailed report straight to your inbox.
              </p>
            </div>

            {/* Blurred preview */}
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              {[
                { label: 'Health Score', value: '72 / 100' },
                { label: 'Savings Projection (12 mo)', value: '$2,847' },
                { label: 'Priority Actions', value: '8 items' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="select-none blur-sm">{item.value}</span>
                </div>
              ))}
              <p className="mt-1 text-center text-xs font-medium text-primary">Unlock with Pro Report</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2">
              {proFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {feature.icon}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Email input */}
            <div className="space-y-1.5">
              <Input
                type="email"
                placeholder="your@email.com — we'll send the report here"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null) }}
              />
              {emailError && <p className="text-xs text-destructive">{emailError}</p>}
            </div>

            {/* Legal */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox id="legal-data" checked={legalData} onCheckedChange={(c) => setLegalData(c === true)} />
                <Label htmlFor="legal-data" className="text-xs leading-tight">
                  I understand my data is processed only for this report and not stored.
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="legal-refund" checked={legalNoRefund} onCheckedChange={(c) => setLegalNoRefund(c === true)} />
                <Label htmlFor="legal-refund" className="text-xs leading-tight">
                  I agree this is a one-time digital purchase delivered instantly via email.
                </Label>
              </div>
            </div>

            <Button className="w-full" onClick={handleStartCheckout} disabled={!bothLegalChecked || !email.trim()}>
              <Mail className="mr-2 h-4 w-4" />
              Get report via email — $1.99
            </Button>
            <p className="text-center text-xs text-muted-foreground">Early access price — helping us build v1</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Secure payment via Stripe. We never see your card details.
            </p>

            {errorMsg && !showResult && <p className="text-sm text-destructive">{errorMsg}</p>}
          </div>
        </CardContent>

        {/* Success state */}
        {cardState === 'success' && (
          <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6 text-center">
            <CheckCircle className="mb-3 h-8 w-8 text-emerald-500" />
            <h2 className="text-lg font-semibold">Your report is ready.</h2>
            <Button className="mt-4" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </Button>
            {emailStatus === 'sent' && (proCustomerEmail || email) && (
              <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                We&apos;ve also sent this to {proCustomerEmail || email}.
              </p>
            )}
            {emailStatus === 'failed' && (
              <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                Email delivery may be delayed — your download is available now.
              </p>
            )}
          </CardContent>
        )}

        {/* Error state */}
        {cardState === 'error' && (
          <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6 text-center">
            <XCircle className="mb-3 h-8 w-8 text-destructive" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            {errorMsg && <p className="mt-2 text-sm text-muted-foreground">{errorMsg}</p>}
            {pdfBlob && (
              <Button className="mt-4" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF Report
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </>
  )
}
