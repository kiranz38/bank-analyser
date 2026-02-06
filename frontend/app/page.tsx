'use client'

import { useState } from 'react'
import UploadForm from '@/components/UploadForm'
import ResultCards from '@/components/ResultCards'
import LoadingOverlay from '@/components/LoadingOverlay'

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
  }>
  easy_wins: Array<{
    title: string
    estimated_yearly_savings: number
    action: string
  }>
  recovery_plan: string[]
  disclaimer: string
}

export default function Home() {
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (data: File | string) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()

      if (data instanceof File) {
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
        <header className="header">
          <a
            href="https://buymeacoffee.com/joh38"
            target="_blank"
            rel="noopener noreferrer"
            className="header-support-link"
            title="Support this project"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            Support
          </a>
          <div className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <h1>Bank Statement Analyzer – Find Hidden Subscriptions & Spending Leaks</h1>
          <h2 className="brand-tagline">Where's My Money Going?</h2>
          <p className="subtitle">
            Upload your bank statement and discover unnecessary fees, forgotten subscriptions, and spending leaks.
            Get a personalized plan to save money.
          </p>
          <div className="trust-badges">
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure processing (no data stored)</span>
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Data never stored</span>
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Free to use</span>
            </div>
          </div>
        </header>

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

        {!results && <UploadForm onAnalyze={handleAnalyze} loading={loading} />}

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

        <div className="support-section">
          <div className="support-content">
            <svg className="support-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <div className="support-message">
              <p className="support-title">Built with care, free for everyone</p>
              <p className="support-text">This tool is maintained by independent developers. If it helped you find savings, consider supporting us to keep it free and ad-free.</p>
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
            Buy us a coffee
          </a>
        </div>
      </main>
    </>
  )
}
