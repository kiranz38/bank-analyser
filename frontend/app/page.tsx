'use client'

import { useState } from 'react'
import Link from 'next/link'
import UploadForm from '@/components/UploadForm'
import ResultCards from '@/components/ResultCards'
import LoadingOverlay from '@/components/LoadingOverlay'
import ExamplePreview from '@/components/ExamplePreview'

// Event tracking hooks (can be wired to analytics later)
// Supported events: analyze_clicked, upload_started, analysis_completed,
// category_viewed, share_card_generated, share_clicked
const trackEvent = (event: string, data?: Record<string, unknown>) => {
  console.log(`[Analytics] ${event}`, data || '')
  // Wire to your analytics service here (e.g., Google Analytics, Mixpanel, etc.)
  // Example: window.gtag?.('event', event, data)
}

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
}

export default function Home() {
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (data: File | string) => {
    trackEvent('analyze_clicked', { type: data instanceof File ? 'file' : 'text' })
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()

      if (data instanceof File) {
        trackEvent('upload_started', { filename: data.name, size: data.size })
        formData.append('file', data)
      } else {
        formData.append('text', data)
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Analysis failed')
      }

      const result = await response.json()
      trackEvent('analysis_completed', { monthly_leak: result.monthly_leak, annual_savings: result.annual_savings })
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingOverlay isLoading={loading} />

      <main className="container">
        <div className="hero-wrapper">
          <section className="hero">
            <h1>Bank Statement Analyzer</h1>
            <p className="hero-tagline">Where's My Money Going?</p>
            <p className="subtitle">
              Find hidden subscriptions, unexpected fees, and spending leaks — plus estimated yearly savings.
            </p>
            <div className="trust-badges">
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>No data stored</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Secure processing</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Free to use</span>
              </div>
            </div>
            <p className="shock-motivator">Most people discover <strong>$200–$600/month</strong> in hidden spending.</p>
          </section>
        </div>

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

        {!results && (
          <>
            <UploadForm onAnalyze={handleAnalyze} loading={loading} />
            <ExamplePreview />
          </>
        )}

        {results && (
          <>
            <ResultCards results={results} />
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setResults(null)
                  setError(null)
                }}
              >
                Analyze Another Statement
              </button>
            </div>
          </>
        )}
        </div>

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
      </main>
    </>
  )
}
