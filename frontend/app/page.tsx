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
import { PlaidLinkResult } from '@/lib/plaid'
import { saveToSession, loadFromSession, clearSession } from '@/lib/sessionCache'
import { sampleDataToCSV } from '@/lib/sampleData'
import { DEMO_RESULTS } from '@/lib/demoResults'
import { AnalysisResult } from '@/lib/types'
import {
  trackCTAClicked,
  trackUploadStarted,
  trackUploadCompleted,
  trackAnalysisGenerated,
  trackResultsViewed,
  trackRecurringDetected,
  trackSampleRunStarted,
  trackConsentChecked,
  trackProCheckoutCompleted,
} from '@/lib/analytics'

// Feature flags
const BANK_CONNECT_ENABLED = process.env.NEXT_PUBLIC_BANK_CONNECT_BETA === 'true'

type ViewState = 'landing' | 'method-chooser' | 'upload' | 'waitlist' | 'plaid' | 'results'

export default function Home() {
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>('landing')
  const [isSampleRun, setIsSampleRun] = useState(false)
  const [proPaymentStatus, setProPaymentStatus] = useState<'success' | 'cancelled' | null>(null)
  const [proSessionId, setProSessionId] = useState<string | null>(null)
  const [proCustomerEmail, setProCustomerEmail] = useState<string | null>(null)

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
      }
      trackResultsViewed()
      if (results.subscriptions) {
        trackRecurringDetected(results.subscriptions.length)
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

    // Demo mode: short animated delay then show hardcoded results
    setTimeout(() => {
      trackAnalysisGenerated({
        monthlyLeak: DEMO_RESULTS.monthly_leak,
        annualSavings: DEMO_RESULTS.annual_savings,
        subscriptionCount: DEMO_RESULTS.subscriptions?.length || 0
      })

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
      // Show Plaid Link when beta is enabled
      setViewState('plaid')
    } else {
      // Show waitlist for users not in beta
      setViewState('waitlist')
    }
  }

  const handleBackToMethodChooser = () => {
    setViewState('method-chooser')
  }

  const handlePlaidSuccess = (plaidResult: PlaidLinkResult) => {
    if (plaidResult.success && plaidResult.result) {
      // Track the analysis
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
    // User cancelled Plaid - go back to method chooser
    setViewState('method-chooser')
  }

  const handlePlaidError = (errorMessage: string) => {
    setError(errorMessage)
    setViewState('method-chooser')
  }

  const handleAnalyze = async (data: File[] | string) => {
    if (Array.isArray(data)) {
      trackUploadStarted({
        file_count: data.length,
        type: 'file'
      })
    } else {
      trackUploadStarted({
        file_count: 1,
        type: 'text'
      })
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      if (Array.isArray(data)) {
        // Multi-file upload
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

      // Track upload completion
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
    clearSession() // Clear cached results
    setViewState('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDismissError = () => {
    setError(null)
  }

  return (
    <>
      <LoadingOverlay isLoading={loading} isDemo={isSampleRun} />

      <main className="container">
        {/* Hero Section - Always visible on landing */}
        {viewState === 'landing' && (
          <div className="hero-wrapper">
            <section className="hero hero-enhanced">
              <div className="hero-title">
                <svg className="hero-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                  <path d="M3 7V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                  <rect x="15" y="10" width="6" height="4" rx="1" />
                  <circle cx="6" cy="21" r="1.2" fill="currentColor" fillOpacity="0.45" stroke="none" />
                  <circle cx="10" cy="22" r="1" fill="currentColor" fillOpacity="0.35" stroke="none" />
                  <circle cx="13.5" cy="21.5" r="0.8" fill="currentColor" fillOpacity="0.25" stroke="none" />
                </svg>
                <h1>Leaky Wallet</h1>
              </div>

              <h2 className="hero-headline">
                Find hidden subscriptions and spending leaks in seconds.
              </h2>
              <p className="hero-tagline">
                Upload your bank statement to instantly see where money quietly disappears.
              </p>

              {/* Micro trust line */}
              <p className="hero-micro-trust">
                No signup &bull; Files auto-deleted &bull; AI analysis
              </p>

              {/* Primary CTA */}
              <button
                className="btn btn-primary btn-hero"
                onClick={handleCTAClick}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Find My Money Leaks
              </button>
              <p className="hero-cta-subtext">
                Your file is processed temporarily and deleted immediately.
              </p>

              {/* Sample Run CTA */}
              <button
                className="btn btn-secondary btn-sample"
                onClick={handleSampleRun}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Try Demo
              </button>

              {/* Trust Strip */}
              <div className="trust-strip">
                <span className="trust-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  No signup required
                </span>
                <span className="trust-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Files auto-deleted
                </span>
                <span className="trust-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Privacy-first
                </span>
              </div>

              <p className="shock-motivator">
                Most people discover <strong>$200–$600/month</strong> in hidden spending.
              </p>

              <ExamplePreview />
            </section>
          </div>
        )}

        {/* Method Chooser */}
        {viewState === 'method-chooser' && (
          <div className="workspace">
            <nav className="breadcrumb">
              <button className="breadcrumb-link" onClick={() => setViewState('landing')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
              </button>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Choose Method</span>
            </nav>
            <MethodChooser
              onSelectUpload={handleSelectUpload}
              onSelectBankConnect={handleSelectBankConnect}
              bankConnectEnabled={BANK_CONNECT_ENABLED}
            />
          </div>
        )}

        {/* Waitlist Form */}
        {viewState === 'waitlist' && (
          <div className="workspace">
            <WaitlistForm
              onClose={() => setViewState('landing')}
              onBack={handleBackToMethodChooser}
            />
          </div>
        )}

        {/* Plaid Bank Connect */}
        {viewState === 'plaid' && (
          <div className="workspace">
            <nav className="breadcrumb">
              <button className="breadcrumb-link" onClick={() => setViewState('landing')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
              </button>
              <span className="breadcrumb-sep">/</span>
              <button className="breadcrumb-link" onClick={handleBackToMethodChooser}>Choose Method</button>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Bank Connect</span>
            </nav>
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
          <div className="workspace">
            <nav className="breadcrumb">
              <button className="breadcrumb-link" onClick={() => setViewState('landing')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
              </button>
              <span className="breadcrumb-sep">/</span>
              <button className="breadcrumb-link" onClick={handleBackToMethodChooser}>Choose Method</button>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Upload</span>
            </nav>
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
          <div className="workspace">
            <nav className="breadcrumb">
              <button className="breadcrumb-link" onClick={handleReset}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
              </button>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{isSampleRun ? 'Demo Results' : 'Analysis Results'}</span>
            </nav>
            {isSampleRun && (
              <div className="sample-data-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>Demo mode &mdash; these results are from a fictional dataset, not your real transactions.</span>
              </div>
            )}
            <ErrorBoundary>
              <ResultCards
                results={results}
                proPaymentStatus={proPaymentStatus}
                proSessionId={proSessionId}
                proCustomerEmail={proCustomerEmail}
                isDemo={isSampleRun}
              />
            </ErrorBoundary>
            <p className="results-disclaimer">
              For informational purposes only. Not financial advice.
            </p>
            <div className="results-actions">
              <ExportPdfButton results={results} chartContainerId="pdf-chart-capture" />
              <button
                className="btn btn-primary"
                onClick={handleReset}
              >
                {isSampleRun ? 'Analyze My Own Statement' : 'Analyze Another Statement'}
              </button>
              {!isSampleRun && (
                <button
                  className="btn btn-text btn-clear-session"
                  onClick={handleReset}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Clear my data
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Disclaimer - Only on landing */}
        {viewState === 'landing' && (
          <>
            <footer className="disclaimer">
              <div className="disclaimer-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className="disclaimer-text">
                <strong>Privacy First:</strong> Your financial data is processed entirely in your browser session and our server memory.
                We never store, log, or share your bank statement data. This tool is for informational purposes only and does not constitute financial advice.
              </div>
            </footer>

            <div className="info-box">
              <p>
                This free <Link href="/bank-statement-analyzer">bank statement analyzer</Link> helps you upload CSV or PDF files to find hidden subscriptions,
                analyze spending patterns, and understand where your money goes each month.
              </p>
            </div>

            <div className="support-section">
              <div className="support-content">
                <svg className="support-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <div className="support-message">
                  <p className="support-title">Built independently, kept free for everyone</p>
                  <p className="support-text">If this helped you find savings, consider supporting the project to keep it running.</p>
                </div>
              </div>
              <a
                href="https://buymeacoffee.com/joh38"
                target="_blank"
                rel="noopener noreferrer"
                className="bmc-button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
                Support this project
              </a>
            </div>
          </>
        )}
      </main>
    </>
  )
}
