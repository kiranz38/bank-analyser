'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import UploadForm from '@/components/UploadForm'
import ResultCards from '@/components/ResultCards'
import LoadingOverlay from '@/components/LoadingOverlay'
import ExamplePreview from '@/components/ExamplePreview'
import MethodChooser from '@/components/MethodChooser'
import WaitlistForm from '@/components/WaitlistForm'
import PlaidLink from '@/components/PlaidLink'
import ErrorBoundary from '@/components/ErrorBoundary'
import ErrorMessage from '@/components/ErrorMessage'
import ExportPdfButton from '@/components/ExportPdfButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlaidLinkResult } from '@/lib/plaid'
import { saveToSession, loadFromSession, clearSession } from '@/lib/sessionCache'
import { hashFiles, getCachedResult, setCachedResult } from '@/lib/analysisCache'
import { useCountry } from '@/lib/useCountry'
import { sampleDataToCSV } from '@/lib/sampleData'
import { DEMO_RESULTS } from '@/lib/demoResults'
import { AnalysisResult } from '@/lib/types'
import { useSession } from 'next-auth/react'
import {
  trackCTAClicked,
  trackUploadStarted,
  trackUploadCompleted,
  trackAnalysisGenerated,
  trackResultsViewed,
  trackRecurringDetected,
  trackSampleRunStarted,
  trackDemoResultsViewed,
  trackConsentChecked,
  trackProCheckoutCompleted,
} from '@/lib/analytics'
import {
  Search,
  Play,
  Check,
  Info,
  Wallet,
  Home,
  Trash2,
  Save,
  Heart,
  Coffee,
  ChevronRight,
  Shield,
  Zap,
  Upload,
  TrendingDown,
} from 'lucide-react'

// Feature flags
const BANK_CONNECT_ENABLED = process.env.NEXT_PUBLIC_BANK_CONNECT_BETA === 'true'

type ViewState = 'landing' | 'method-chooser' | 'upload' | 'waitlist' | 'plaid' | 'results'

export default function HomePage() {
  const { data: session } = useSession()
  const countryConfig = useCountry()
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>('landing')
  const [isSampleRun, setIsSampleRun] = useState(false)
  const [proPaymentStatus, setProPaymentStatus] = useState<'success' | 'cancelled' | null>(null)
  const [proSessionId, setProSessionId] = useState<string | null>(null)
  const [proCustomerEmail, setProCustomerEmail] = useState<string | null>(null)
  const [analysisSaved, setAnalysisSaved] = useState(false)
  const [savingAnalysis, setSavingAnalysis] = useState(false)

  // Load cached results or handle ?start=upload from dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('start') === 'upload') {
      window.history.replaceState({}, '', '/')
      setViewState('upload')
      return
    }
    const cached = loadFromSession<AnalysisResult>()
    if (cached) {
      setResults(cached)
      setViewState('results')
    }
  }, [])

  // Handle Stripe payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const proPayment = params.get('pro_payment')
    const sessionId = params.get('session_id')

    if (!proPayment) return

    // Clean URL params immediately
    const cleanUrl = window.location.pathname
    window.history.replaceState({}, '', cleanUrl)

    if (proPayment === 'cancelled') {
      setProPaymentStatus('cancelled')
      return
    }

    if (proPayment === 'success' && sessionId) {
      // Verify payment with backend
      fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`)
        .then(res => res.json())
        .then(data => {
          if (data.paid) {
            trackProCheckoutCompleted(data.amount_total ? data.amount_total / 100 : 1.99)
            setProSessionId(sessionId)
            if (data.customer_email) {
              setProCustomerEmail(data.customer_email)
            }
            setProPaymentStatus('success')
          } else {
            setProPaymentStatus('cancelled')
          }
        })
        .catch(err => {
          console.error('Payment verification failed:', err)
          setProPaymentStatus('cancelled')
        })
    }
  }, [])

  // Save results to session storage when they change (skip demo data)
  useEffect(() => {
    if (results) {
      if (!isSampleRun) {
        saveToSession(results)
        trackResultsViewed()
        if (results.subscriptions) {
          trackRecurringDetected(results.subscriptions.length)
        }
      }
    }
  }, [results, isSampleRun])

  const handleCTAClick = () => {
    trackCTAClicked()
    setViewState('method-chooser')
  }

  const handleSampleRun = () => {
    trackSampleRunStarted()
    setIsSampleRun(true)
    setLoading(true)
    setError(null)
    setResults(null)

    setTimeout(() => {
      trackDemoResultsViewed()
      setResults(DEMO_RESULTS as AnalysisResult)
      setViewState('results')
      setLoading(false)
    }, 2500)
  }

  const handleSelectUpload = () => {
    setViewState('upload')
  }

  const handleSelectBankConnect = () => {
    if (BANK_CONNECT_ENABLED) {
      setViewState('plaid')
    } else {
      setViewState('waitlist')
    }
  }

  const handleBackToMethodChooser = () => {
    setViewState('method-chooser')
  }

  const handlePlaidSuccess = (plaidResult: PlaidLinkResult) => {
    if (plaidResult.success && plaidResult.result) {
      const result = plaidResult.result as AnalysisResult
      trackUploadCompleted({
        fileCount: 1,
        totalTransactions: plaidResult.transaction_count || 0
      })
      trackAnalysisGenerated({
        monthlyLeak: result.monthly_leak,
        annualSavings: result.annual_savings,
        subscriptionCount: result.subscriptions?.length || 0
      })

      setResults(result)
      setViewState('results')

      if (session?.user) {
        saveAnalysisToDb(result)
      }
    }
  }

  const handlePlaidExit = () => {
    setViewState('method-chooser')
  }

  const handlePlaidError = (errorMessage: string) => {
    setError(errorMessage)
    setViewState('method-chooser')
  }

  const handleAnalyze = async (data: File[] | string) => {
    if (Array.isArray(data)) {
      trackUploadStarted({ file_count: data.length, type: 'file' })
    } else {
      trackUploadStarted({ file_count: 1, type: 'text' })
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Check file hash cache before hitting the backend
      if (Array.isArray(data) && data.length > 0) {
        const hash = await hashFiles(data)
        const cached = getCachedResult(hash)
        if (cached) {
          trackUploadCompleted({ fileCount: data.length, totalTransactions: 0 })
          trackAnalysisGenerated({
            monthlyLeak: cached.monthly_leak,
            annualSavings: cached.annual_savings,
            subscriptionCount: cached.subscriptions?.length || 0,
          })
          setResults(cached)
          setViewState('results')
          if (session?.user) saveAnalysisToDb(cached)
          setLoading(false)
          return
        }
      }

      const formData = new FormData()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      if (Array.isArray(data)) {
        data.forEach((file) => {
          formData.append('files', file)
        })
      } else {
        formData.append('text', data)
      }

      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Analysis failed')
      }

      const result = await response.json()

      trackUploadCompleted({
        fileCount: Array.isArray(data) ? data.length : 1,
        totalTransactions: result.category_summary?.reduce(
          (sum: number, cat: { transaction_count: number }) => sum + cat.transaction_count,
          0
        ) || 0
      })

      trackAnalysisGenerated({
        monthlyLeak: result.monthly_leak,
        annualSavings: result.annual_savings,
        subscriptionCount: result.subscriptions?.length || 0
      })

      // Cache result by file hash for instant re-uploads
      if (Array.isArray(data) && data.length > 0) {
        hashFiles(data).then(hash => setCachedResult(hash, result))
      }

      setResults(result)
      setViewState('results')

      if (session?.user) {
        saveAnalysisToDb(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
    setIsSampleRun(false)
    setAnalysisSaved(false)
    setSavingAnalysis(false)
    clearSession()
    setViewState('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDismissError = () => {
    setError(null)
  }

  const saveAnalysisToDb = async (result: AnalysisResult) => {
    if (analysisSaved || savingAnalysis) return
    setSavingAnalysis(true)
    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Analysis – ${new Date().toLocaleDateString('en-AU')}`,
          results: result,
        }),
      })
      if (res.ok) setAnalysisSaved(true)
    } catch {
      // Silently fail — non-critical
    } finally {
      setSavingAnalysis(false)
    }
  }

  const handleSaveAnalysis = async () => {
    if (results) await saveAnalysisToDb(results)
  }

  // Breadcrumb helper
  const Breadcrumb = ({ items }: { items: { label: string; onClick?: () => void }[] }) => (
    <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {item.onClick ? (
            <button onClick={item.onClick} className="flex items-center gap-1 hover:text-foreground">
              {i === 0 && <Home className="h-3.5 w-3.5" />}
              {item.label}
            </button>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )

  return (
    <>
      <LoadingOverlay isLoading={loading} isDemo={isSampleRun} />

      {viewState === 'landing' ? (
        <>
          {/* ── Hero — true full-viewport width, no container constraints ── */}
          <section className="relative w-full overflow-hidden min-h-[580px] md:min-h-[680px] flex items-center">
            <Image
              src="https://images.unsplash.com/photo-1762279389020-eeeb69c25813?w=1920&q=85&auto=format&fit=crop"
              alt="Abstract financial data network visualisation"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Base dark scrim — let the blue chart glow bleed through */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Stronger overlay on left where text sits */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            {/* Bottom fade into page */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />

            {/* Hero content */}
            <div className="relative z-10 w-full px-6 py-16 md:py-24">
              <div className="mx-auto max-w-6xl">
                <div className="max-w-xl">

                  {/* Pill badges */}
                  <div className="mb-6 flex flex-col items-start gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Free · No signup · Files auto-deleted
                    </span>
                    {countryConfig.name && (
                      <Link
                        href={countryConfig.regionalPage}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 backdrop-blur-sm px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                      >
                        Optimised for {countryConfig.name} · {countryConfig.banks.slice(0, 3).join(', ')} & more
                      </Link>
                    )}
                  </div>

                  <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Find where your money{' '}
                    <span className="text-emerald-400">quietly disappears</span>
                  </h1>

                  <p className="mb-8 text-lg text-white/80 sm:text-xl max-w-lg">
                    Upload your bank statement and see every hidden subscription, sneaky fee,
                    and spending leak — with a step-by-step plan to fix it.
                  </p>

                  {/* Savings callout */}
                  <div className="mb-8 inline-flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/60 backdrop-blur-sm px-5 py-3 dark:border-emerald-800">
                    <TrendingDown className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      Most people discover{' '}
                      <strong className="text-base font-bold">$200–$600/month</strong>{' '}
                      in hidden spending
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      className="h-12 w-full px-8 text-base font-semibold shadow-lg sm:w-auto"
                      onClick={handleCTAClick}
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Find My Money Leaks
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-full px-8 text-base sm:w-auto bg-background/60 backdrop-blur-sm"
                      onClick={handleSampleRun}
                      disabled={loading}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Try Demo
                    </Button>
                  </div>

                  {/* Trust badges */}
                  <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      Privacy-first
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-emerald-500" />
                      Results in 10 seconds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" />
                      No card required
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* ── Below-fold sections — constrained container ── */}
          <div className="mx-auto max-w-4xl px-4">

            {/* How it works */}
            <section className="border-t py-12">
              <h2 className="mb-8 text-center text-xl font-bold tracking-tight">How it works</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { Icon: Upload, step: '1', title: 'Upload', desc: 'Drop your CSV or PDF bank statement. We process it in memory — never stored.' },
                  { Icon: Search, step: '2', title: 'Analyze', desc: 'AI scans every transaction for subscriptions, fees, and spending patterns.' },
                  { Icon: TrendingDown, step: '3', title: 'Save', desc: 'Get a personalized action plan showing exactly what to cancel and cut.' },
                ].map(({ Icon, step, title, desc }) => (
                  <div key={step} className="flex flex-col items-center rounded-xl border bg-card p-5 text-center shadow-sm">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Step {step}</div>
                    <h3 className="mb-1.5 font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* What we detect */}
            <section className="-mx-4 bg-muted/30 px-4 py-10">
              <h2 className="mb-6 text-center text-xl font-bold tracking-tight">What we find</h2>
              <div className="mx-auto max-w-3xl grid gap-3 sm:grid-cols-2">
                {[
                  { emoji: '📺', label: 'Hidden subscriptions', desc: 'Netflix, Spotify, gym memberships you forgot you signed up for' },
                  { emoji: '💸', label: 'Bank fees & charges', desc: 'ATM fees, account fees, and overdraft charges quietly adding up' },
                  { emoji: '🔁', label: 'Duplicate spending', desc: 'Paying twice for the same type of service or category' },
                  { emoji: '📈', label: 'Price increases', desc: 'Subscriptions that quietly raised their price without telling you' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-2xl leading-none">{item.emoji}</div>
                    <div>
                      <h3 className="mb-0.5 text-sm font-semibold">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Example preview */}
            <section className="py-10">
              <div className="mx-auto max-w-md">
                <h2 className="mb-6 text-center text-xl font-bold tracking-tight">What your report looks like</h2>
                <ExamplePreview />
              </div>
            </section>

            {/* Footer notes */}
            <footer className="space-y-4 pb-10">
              <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Privacy First:</strong> Your financial data is processed entirely
                  in your browser session and our server memory. We never store, log, or share your bank statement data.
                  This tool is for informational purposes only and does not constitute financial advice.
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">
                  This free <Link href="/bank-statement-analyzer" className="text-primary hover:underline">bank statement analyzer</Link> helps
                  you upload CSV or PDF files to find hidden subscriptions, analyze spending patterns, and understand where your money goes each month.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Built independently, kept free for everyone</p>
                    <p className="text-xs text-muted-foreground">If this helped you find savings, consider supporting the project.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://buymeacoffee.com/joh38" target="_blank" rel="noopener noreferrer">
                    <Coffee className="mr-2 h-4 w-4" />
                    Support
                  </a>
                </Button>
              </div>
            </footer>

          </div>
        </>
      ) : (
        <main className="mx-auto max-w-4xl px-4 py-8">
          {/* Method Chooser */}
          {viewState === 'method-chooser' && (
            <div>
              <Breadcrumb items={[
                { label: 'Home', onClick: () => setViewState('landing') },
                { label: 'Choose Method' },
              ]} />
              <MethodChooser
                onSelectUpload={handleSelectUpload}
                onSelectBankConnect={handleSelectBankConnect}
                bankConnectEnabled={BANK_CONNECT_ENABLED}
              />
            </div>
          )}

          {/* Waitlist Form */}
          {viewState === 'waitlist' && (
            <div>
              <WaitlistForm
                onClose={() => setViewState('landing')}
                onBack={handleBackToMethodChooser}
              />
            </div>
          )}

          {/* Plaid Bank Connect */}
          {viewState === 'plaid' && (
            <div>
              <Breadcrumb items={[
                { label: 'Home', onClick: () => setViewState('landing') },
                { label: 'Choose Method', onClick: handleBackToMethodChooser },
                { label: 'Bank Connect' },
              ]} />
              {error && <ErrorMessage message={error} onDismiss={handleDismissError} />}
              <PlaidLink
                onSuccess={handlePlaidSuccess}
                onExit={handlePlaidExit}
                onError={handlePlaidError}
              />
            </div>
          )}

          {/* Upload Form */}
          {viewState === 'upload' && (
            <div>
              <Breadcrumb items={[
                { label: 'Home', onClick: () => setViewState('landing') },
                { label: 'Choose Method', onClick: handleBackToMethodChooser },
                { label: 'Upload' },
              ]} />
              {error && (
                <ErrorMessage
                  message={error}
                  onDismiss={handleDismissError}
                  onRetry={() => setError(null)}
                />
              )}
              <UploadForm onAnalyze={handleAnalyze} loading={loading} />
              <ExamplePreview />
            </div>
          )}

          {/* Results */}
          {viewState === 'results' && results && (
            <div>
              <Breadcrumb items={[
                { label: 'Home', onClick: handleReset },
                { label: isSampleRun ? 'Demo Results' : 'Analysis Results' },
              ]} />
              {isSampleRun && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-400">
                    Demo mode &mdash; these results are from a fictional dataset, not your real transactions.
                  </span>
                </div>
              )}
              <ErrorBoundary>
                <ResultCards
                  results={results}
                  proPaymentStatus={proPaymentStatus}
                  proSessionId={proSessionId}
                  proCustomerEmail={proCustomerEmail}
                  isDemo={isSampleRun}
                  isPro={false}
                />
              </ErrorBoundary>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                For informational purposes only. Not financial advice.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <ExportPdfButton results={results} chartContainerId="pdf-chart-capture" />
                <Button onClick={handleReset}>
                  {isSampleRun ? 'Analyze My Own Statement' : 'Analyze Another Statement'}
                </Button>
                {!isSampleRun && (
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Clear my data
                  </Button>
                )}
              </div>

              {/* Save analysis prompt */}
              {!isSampleRun && (
                <div className="mt-4 text-center">
                  {session?.user ? (
                    analysisSaved ? (
                      <p className="flex items-center justify-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" />
                        Analysis saved to your dashboard
                      </p>
                    ) : (
                      <Button variant="outline" onClick={handleSaveAnalysis} disabled={savingAnalysis}>
                        <Save className="mr-2 h-4 w-4" />
                        {savingAnalysis ? 'Saving...' : 'Save to Dashboard'}
                      </Button>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link> to save your analyses and track spending over time.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      )}
    </>
  )
}
