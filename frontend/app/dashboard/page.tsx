'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SavedAnalysis {
  id: string
  title: string | null
  createdAt: string
  results: {
    monthly_leak?: number
    annual_savings?: number
    subscriptions?: { name: string }[]
    category_summary?: { category: string; total: number }[]
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analyses')
      .then((res) => res.json())
      .then((data) => {
        setAnalyses(data.analyses || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0'
    return `$${Math.round(amount).toLocaleString()}`
  }

  return (
    <main className="container">
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}
            </p>
          </div>
          <Link href="/" className="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Analysis
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner" />
            <p>Loading your analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="dashboard-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h2>No analyses yet</h2>
            <p>Upload a bank statement to get started. Your results will be saved here automatically.</p>
            <Link href="/" className="btn btn-primary">
              Analyze Your First Statement
            </Link>
          </div>
        ) : (
          <div className="analyses-grid">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="analysis-card">
                <div className="analysis-card-header">
                  <span className="analysis-date">{formatDate(analysis.createdAt)}</span>
                  {analysis.title && (
                    <span className="analysis-title">{analysis.title}</span>
                  )}
                </div>
                <div className="analysis-card-stats">
                  <div className="analysis-stat">
                    <span className="analysis-stat-label">Monthly leak</span>
                    <span className="analysis-stat-value analysis-stat-danger">
                      {formatCurrency(analysis.results.monthly_leak)}
                    </span>
                  </div>
                  <div className="analysis-stat">
                    <span className="analysis-stat-label">Annual savings</span>
                    <span className="analysis-stat-value analysis-stat-success">
                      {formatCurrency(analysis.results.annual_savings)}
                    </span>
                  </div>
                  <div className="analysis-stat">
                    <span className="analysis-stat-label">Subscriptions</span>
                    <span className="analysis-stat-value">
                      {analysis.results.subscriptions?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
