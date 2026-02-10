'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import UploadForm from '@/components/UploadForm'
import ResultCards from '@/components/ResultCards'
import LoadingOverlay from '@/components/LoadingOverlay'
import ExamplePreview from '@/components/ExamplePreview'
import MethodChooser from '@/components/MethodChooser'
import WaitlistForm from '@/components/WaitlistForm'
import {
  trackCTAClicked,
  trackUploadStarted,
  trackUploadCompleted,
  trackAnalysisGenerated,
  trackResultsViewed,
  trackRecurringDetected,
} from '@/lib/analytics'

// Feature flags
const BANK_CONNECT_ENABLED = process.env.NEXT_PUBLIC_BANK_CONNECT_BETA === 'true'

// Hero copy variants for A/B testing
const HERO_VARIANTS = {
  A: 'Find where your money is leaking: subscriptions, fees, and silent overspending.',
  B: 'See where your money goes and fix the leaks in minutes.',
}

// Use variant A by default - can be randomized for A/B testing later
const ACTIVE_VARIANT = 'A'

interface AnalysisResult {
  monthly_leak: number
  annual_savings: number
  top_leaks: Array<{
    category: string
    merchant: string
    monthly_cost: number
    yearly_cost: number
    explanation: string
  }>
  top_spending: Array<{
    date: string
    merchant: string
    amount: number
    category?: string
  }>
  easy_wins: Array<{
    title: string
    estimated_yearly_savings: number
    action: string
  }>
  recovery_plan: string[]
  disclaimer: string
  category_summary?: Array<{
    category: string
    total: number
    percent: number
    transaction_count: number
    top_merchants: Array<{ name: string; total: number }>
  }>
  subscriptions?: Array<{
    merchant: string
    monthly_cost: number
    annual_cost: number
    confidence: number
    last_date: string
    occurrences: number
    reason: string
  }>
  comparison?: {
    previous_month: string
    current_month: string
    previous_total: number
    current_total: number
    total_change: number
    total_change_percent: number
    top_changes: Array<{
      category: string
      previous: number
      current: number
      change: number
      change_percent: number
    }>
    spikes: Array<{
      category: string
      previous: number
      current: number
      change: number
      change_percent: number
    }>
    months_analyzed: number
  } | null
  share_summary?: {
    monthly_leak: number
    annual_savings: number
    top_categories: Array<{ category: string; monthly: number }>
    subscription_count: number
    tagline: string
  } | null
  alternatives?: Array<{
    original: string
    alternative: string
    current_price: number
    alternative_price: number
    monthly_savings: number
    yearly_savings: number
    note: string
    category: string
  }>
  price_changes?: Array<{
    merchant: string
    old_price: number
    new_price: number
    increase: number
    percent_change: number
    first_date: string
    latest_date: string
    yearly_impact: number
  }>
  duplicate_subscriptions?: Array<{
    category: string
    services: string[]
    count: number
    combined_monthly: number
    combined_yearly: number
    suggestion: string
  }>
}

type ViewState = 'landing' | 'method-chooser' | 'upload' | 'waitlist' | 'results'

export default function Home() {
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>('landing')

  // Track results viewed when results are shown
  useEffect(() => {
    if (results) {
      trackResultsViewed()
      if (results.subscriptions) {
        trackRecurringDetected(results.subscriptions.length)
      }
    }
  }, [results])

  const handleCTAClick = () => {
    trackCTAClicked()
    setViewState('method-chooser')
  }

  const handleSelectUpload = () => {
    setViewState('upload')
  }

  const handleSelectBankConnect = () => {
    // For now, always show waitlist since Plaid integration is not complete
    setViewState('waitlist')
  }

  const handleBackToMethodChooser = () => {
    setViewState('method-chooser')
  }

  const handleAnalyze = async (data: File[] | string) => {
    if (Array.isArray(data)) {
      const totalSize = data.reduce((sum, f) => sum + f.size, 0)
      trackUploadStarted({
        filename: data.map(f => f.name).join(', '),
        size: totalSize,
        type: 'file'
      })
    } else {
      trackUploadStarted({
        filename: 'pasted-text',
        size: data.length,
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
    setViewState('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <LoadingOverlay isLoading={loading} />

      <main className="container">
        {/* Hero Section - Always visible on landing */}
        {viewState === 'landing' && (
          <div className="hero-wrapper">
            <section className="hero hero-enhanced">
              <div className="hero-title">
                <svg className="hero-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  {/* Wallet body */}
                  <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                  {/* Wallet fold/flap */}
                  <path d="M3 7V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                  {/* Card clasp */}
                  <rect x="15" y="10" width="6" height="4" rx="1" />
                  {/* Leak drops */}
                  <circle cx="6" cy="21" r="1.2" fill="currentColor" fillOpacity="0.45" stroke="none" />
                  <circle cx="10" cy="22" r="1" fill="currentColor" fillOpacity="0.35" stroke="none" />
                  <circle cx="13.5" cy="21.5" r="0.8" fill="currentColor" fillOpacity="0.25" stroke="none" />
                </svg>
                <h1>Leaky Wallet</h1>
              </div>

              <p className="hero-tagline">
                {HERO_VARIANTS[ACTIVE_VARIANT]}
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
                Find my money leaks
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
                  Data not stored
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
            </section>
          </div>
        )}

        {/* Method Chooser */}
        {viewState === 'method-chooser' && (
          <div className="workspace">
            <MethodChooser
              onSelectUpload={handleSelectUpload}
              onSelectBankConnect={handleSelectBankConnect}
              bankConnectEnabled={BANK_CONNECT_ENABLED}
            />
            <button
              className="btn btn-text back-link"
              onClick={() => setViewState('landing')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
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

        {/* Upload Form */}
        {viewState === 'upload' && (
          <div className="workspace">
            {error && (
              <div className="error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <UploadForm onAnalyze={handleAnalyze} loading={loading} />
            <ExamplePreview />

            <button
              className="btn btn-text back-link"
              onClick={handleBackToMethodChooser}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to options
            </button>
          </div>
        )}

        {/* Results */}
        {viewState === 'results' && results && (
          <div className="workspace">
            <ResultCards results={results} />
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleReset}
              >
                Analyze Another Statement
              </button>
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
