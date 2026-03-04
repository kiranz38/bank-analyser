'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'

// Feature flags
const BANK_CONNECT_ENABLED = process.env.NEXT_PUBLIC_BANK_CONNECT_BETA === 'true'

type ViewState = 'landing' | 'method-chooser' | 'upload' | 'waitlist' | 'plaid' | 'results'

export default function HomePage() {
  const { data: session } = useSession()
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

  // Load cached results from session storage on mount
  useEffect(() => {
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

      setResults(result)
      setViewState('results')
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
    clearSession()
    setViewState('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDismissError = () => {
    setError(null)
  }

  const handleSaveAnalysis = async () => {
    if (!results || analysisSaved || savingAnalysis) return
    setSavingAnalysis(true)
    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Analysis – ${new Date().toLocaleDateString('en-AU')}`,
          results,
        }),
      })
      if (res.ok) {
        setAnalysisSaved(true)
      }
    } catch {
      // Silently fail — non-critical
    } finally {
      setSavingAnalysis(false)
    }
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

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        {viewState === 'landing' && (
          <div className="flex flex-col items-center text-center">
            <section className="space-y-6 py-12">
              <div className="flex items-center justify-center gap-2">
                <Wallet className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Leaky Wallet</h1>
              </div>

              <h2 className="text-xl text-muted-foreground sm:text-2xl">
                Find hidden subscriptions and spending leaks in seconds.
              </h2>
              <p className="text-muted-foreground">
                Upload your bank statement to instantly see where money quietly disappears.
              </p>

              <p className="text-xs text-muted-foreground">
                No signup &bull; Files auto-deleted &bull; AI analysis
              </p>

              <div className="flex flex-col items-center gap-3">
                <Button size="lg" onClick={handleCTAClick}>
                  <Search className="mr-2 h-4 w-4" />
                  Find My Money Leaks
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your file is processed temporarily and deleted immediately.
                </p>

                <Button variant="outline" onClick={handleSampleRun} disabled={loading}>
                  <Play className="mr-2 h-4 w-4" />
                  Try Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  No signup required
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Files auto-deleted
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Privacy-first
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Most people discover <strong className="text-foreground">$200–$600/month</strong> in hidden spending.
              </p>

              <ExamplePreview />
            </section>
          </div>
        )}

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
            {error && (
              <ErrorMessage
                message={error}
                onDismiss={handleDismissError}
              />
            )}
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

        {/* Footer Disclaimer - Only on landing */}
        {viewState === 'landing' && (
          <>
            <footer className="mt-8 flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <strong>Privacy First:</strong> Your financial data is processed entirely in your browser session and our server memory.
                We never store, log, or share your bank statement data. This tool is for informational purposes only and does not constitute financial advice.
              </div>
            </footer>

            <div className="mt-4 rounded-lg border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                This free <Link href="/bank-statement-analyzer" className="text-primary hover:underline">bank statement analyzer</Link> helps you upload CSV or PDF files to find hidden subscriptions,
                analyze spending patterns, and understand where your money goes each month.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Built independently, kept free for everyone</p>
                  <p className="text-xs text-muted-foreground">If this helped you find savings, consider supporting the project to keep it running.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://buymeacoffee.com/joh38" target="_blank" rel="noopener noreferrer">
                  <Coffee className="mr-2 h-4 w-4" />
                  Support this project
                </a>
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  )
}
