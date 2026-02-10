'use client'

import { useEffect, useState } from 'react'
import SpendingPieChart from './dashboard/SpendingPieChart'
import ComparisonBarChart from './dashboard/ComparisonBarChart'
import InsightsTabs from './dashboard/InsightsTabs'
import ShareCard from './ShareCard'
import FeedbackWidget from './FeedbackWidget'
import {
  trackCategoryViewed,
  trackShareCardGenerated,
  trackShareClicked,
  trackAlternativesViewed,
  trackPriceChangesViewed,
  trackDuplicatesViewed
} from '@/lib/analytics'

interface Leak {
  category: string
  merchant: string
  monthly_cost: number
  yearly_cost: number
  explanation: string
}

interface TopSpending {
  date: string
  merchant: string
  amount: number
  category?: string
}

interface EasyWin {
  title: string
  estimated_yearly_savings: number
  action: string
}

interface CategorySummary {
  category: string
  total: number
  percent: number
  transaction_count: number
  top_merchants: Array<{ name: string; total: number }>
}

interface Subscription {
  merchant: string
  monthly_cost: number
  annual_cost: number
  confidence: number
  last_date: string
  occurrences: number
  reason: string
}

interface MonthComparisonData {
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
}

interface ShareSummary {
  monthly_leak: number
  annual_savings: number
  top_categories: Array<{ category: string; monthly: number }>
  subscription_count: number
  tagline: string
}

interface Alternative {
  original: string
  alternative: string
  current_price: number
  alternative_price: number
  monthly_savings: number
  yearly_savings: number
  note: string
  category: string
}

interface PriceChange {
  merchant: string
  old_price: number
  new_price: number
  increase: number
  percent_change: number
  first_date: string
  latest_date: string
  yearly_impact: number
}

interface DuplicateSubscription {
  category: string
  services: string[]
  count: number
  combined_monthly: number
  combined_yearly: number
  suggestion: string
}

interface ResultCardsProps {
  results: {
    monthly_leak: number
    annual_savings: number
    top_leaks: Leak[]
    top_spending: TopSpending[]
    easy_wins: EasyWin[]
    recovery_plan: string[]
    category_summary?: CategorySummary[]
    subscriptions?: Subscription[]
    comparison?: MonthComparisonData | null
    share_summary?: ShareSummary | null
    alternatives?: Alternative[]
    price_changes?: PriceChange[]
    duplicate_subscriptions?: DuplicateSubscription[]
  }
}

export default function ResultCards({ results }: ResultCardsProps) {
  const [leaksExpanded, setLeaksExpanded] = useState(false)
  const [recoveryExpanded, setRecoveryExpanded] = useState(false)

  // Track analytics events when results are displayed
  useEffect(() => {
    if (results.category_summary && results.category_summary.length > 0) {
      trackCategoryViewed(results.category_summary.map(c => c.category))
    }
    if (results.share_summary) {
      trackShareCardGenerated(results.share_summary.annual_savings)
    }
    if (results.alternatives && results.alternatives.length > 0) {
      trackAlternativesViewed(results.alternatives.length)
    }
    if (results.price_changes && results.price_changes.length > 0) {
      const totalImpact = results.price_changes.reduce((sum, pc) => sum + pc.yearly_impact, 0)
      trackPriceChangesViewed({
        count: results.price_changes.length,
        totalYearlyImpact: totalImpact
      })
    }
    if (results.duplicate_subscriptions && results.duplicate_subscriptions.length > 0) {
      const totalMonthly = results.duplicate_subscriptions.reduce((sum, d) => sum + d.combined_monthly, 0)
      trackDuplicatesViewed({
        categoryCount: results.duplicate_subscriptions.length,
        totalMonthly
      })
    }
  }, [results])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyPrecise = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Group leaks by category
  const groupedLeaks = results.top_leaks.reduce((acc, leak) => {
    const category = leak.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(leak)
    return acc
  }, {} as Record<string, Leak[]>)

  const categoryTotals = Object.entries(groupedLeaks).map(([category, leaks]) => ({
    category,
    leaks,
    monthlyTotal: leaks.reduce((sum, l) => sum + (Number(l.monthly_cost) || 0), 0),
    yearlyTotal: leaks.reduce((sum, l) => sum + (Number(l.yearly_cost) || 0), 0)
  })).sort((a, b) => b.monthlyTotal - a.monthlyTotal)

  // Filter confirmed subscriptions
  const confirmedSubs = (results.subscriptions || []).filter(s => s.confidence >= 0.6)
  const totalMonthlySubscriptions = confirmedSubs.reduce((sum, s) => sum + s.monthly_cost, 0)

  return (
    <div className="dashboard-results">
      {/* Hero Stats Row */}
      <div className="dashboard-hero-stats">
        <div className="hero-stat-card danger">
          <div className="hero-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="hero-stat-content">
            <span className="hero-stat-label">Monthly Leak</span>
            <span className="hero-stat-value">{formatCurrency(results.monthly_leak)}</span>
            <span className="hero-stat-sub">potential savings/month</span>
          </div>
        </div>
        <div className="hero-stat-card success">
          <div className="hero-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div className="hero-stat-content">
            <span className="hero-stat-label">Annual Savings</span>
            <span className="hero-stat-value">{formatCurrency(results.annual_savings)}</span>
            <span className="hero-stat-sub">if you address these</span>
          </div>
        </div>
      </div>

      {/* 3-Column Grid: Pie Chart, Subscriptions, Quick Wins */}
      <div className="dashboard-grid-3">
        {/* Spending Pie Chart */}
        {results.category_summary && results.category_summary.length > 0 && (
          <SpendingPieChart categories={results.category_summary} />
        )}

        {/* Subscriptions Compact List */}
        {confirmedSubs.length > 0 && (
          <div className="dashboard-card subscriptions-compact-card">
            <h3 className="dashboard-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
              Subscriptions
              <span className="card-badge">{confirmedSubs.length}</span>
            </h3>
            <div className="subscriptions-compact-total">
              <span>{formatCurrencyPrecise(totalMonthlySubscriptions)}</span>
              <span className="subscriptions-total-period">/month</span>
            </div>
            <ul className="subscriptions-compact-list">
              {confirmedSubs.slice(0, 5).map((sub, index) => (
                <li key={index} className="subscription-compact-item">
                  <span className="subscription-compact-name">{sub.merchant}</span>
                  <span className="subscription-compact-cost">{formatCurrencyPrecise(sub.monthly_cost)}</span>
                </li>
              ))}
            </ul>
            {confirmedSubs.length > 5 && (
              <button className="view-all-btn">
                View all {confirmedSubs.length} subscriptions
              </button>
            )}
          </div>
        )}

        {/* Quick Wins */}
        {results.easy_wins.length > 0 && (
          <div className="dashboard-card quick-wins-card">
            <h3 className="dashboard-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Quick Wins
            </h3>
            <div className="quick-wins-list">
              {results.easy_wins.slice(0, 3).map((win, index) => (
                <div key={index} className="quick-win-item">
                  <div className="quick-win-content">
                    <span className="quick-win-title">{win.title}</span>
                    <span className="quick-win-action">{win.action}</span>
                  </div>
                  <span className="quick-win-savings">
                    {formatCurrency(win.estimated_yearly_savings)}/yr
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Grid: Spending Leaks, Month Comparison */}
      <div className="dashboard-grid-2">
        {/* Spending Leaks - Collapsible */}
        {results.top_leaks.length > 0 && (
          <div className="dashboard-card leaks-collapsible-card">
            <button
              className="collapsible-header"
              onClick={() => setLeaksExpanded(!leaksExpanded)}
            >
              <h3 className="dashboard-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Recurring Spending Leaks
                <span className="card-badge">{categoryTotals.length} categories</span>
              </h3>
              <svg
                className={`collapse-icon ${leaksExpanded ? 'expanded' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Preview when collapsed */}
            {!leaksExpanded && (
              <div className="leaks-preview">
                {categoryTotals.slice(0, 2).map(({ category, monthlyTotal }) => (
                  <div key={category} className="leak-preview-item">
                    <span className="leak-preview-category">{category}</span>
                    <span className="leak-preview-amount">{formatCurrencyPrecise(monthlyTotal)}/mo</span>
                  </div>
                ))}
                {categoryTotals.length > 2 && (
                  <span className="leak-preview-more">+{categoryTotals.length - 2} more</span>
                )}
              </div>
            )}

            {/* Full content when expanded */}
            {leaksExpanded && (
              <div className="leaks-expanded">
                {categoryTotals.map(({ category, leaks, monthlyTotal, yearlyTotal }) => (
                  <div key={category} className="leak-group-compact">
                    <div className="leak-group-header-compact">
                      <span className="leak-group-category-badge">{category}</span>
                      <div className="leak-group-totals">
                        <span className="leak-monthly-total">{formatCurrencyPrecise(monthlyTotal)}/mo</span>
                        <span className="leak-yearly-total">{formatCurrency(yearlyTotal)}/yr</span>
                      </div>
                    </div>
                    <ul className="leak-items-compact">
                      {leaks.map((leak, index) => (
                        <li key={index} className="leak-item-compact">
                          <span className="leak-merchant-compact">{leak.merchant}</span>
                          <span className="leak-cost-compact">{formatCurrencyPrecise(Number(leak.monthly_cost) || 0)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Month Comparison Bar Chart */}
        {results.comparison && (
          <ComparisonBarChart comparison={results.comparison} />
        )}
      </div>

      {/* Tabbed Insights */}
      <InsightsTabs
        priceChanges={results.price_changes}
        duplicates={results.duplicate_subscriptions}
        alternatives={results.alternatives}
        topSpending={results.top_spending}
      />

      {/* Recovery Plan - Collapsible */}
      {results.recovery_plan.length > 0 && (
        <div className="dashboard-card recovery-plan-card">
          <button
            className="collapsible-header"
            onClick={() => setRecoveryExpanded(!recoveryExpanded)}
          >
            <h3 className="dashboard-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Your Recovery Plan
              <span className="card-badge">{results.recovery_plan.length} steps</span>
            </h3>
            <svg
              className={`collapse-icon ${recoveryExpanded ? 'expanded' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {recoveryExpanded && (
            <ol className="recovery-list-compact">
              {results.recovery_plan.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Share Card */}
      {results.share_summary && (
        <ShareCard
          shareSummary={results.share_summary}
          onShare={(platform) => trackShareClicked(platform)}
        />
      )}

      {/* Fallback Share Section */}
      {!results.share_summary && (
        <div className="share-section-compact">
          <div className="share-highlight-compact">
            <span>You&apos;re leaking</span>
            <strong>{formatCurrency(results.monthly_leak)}/month</strong>
            <span className="share-yearly">(~{formatCurrency(results.annual_savings)}/year)</span>
          </div>
          <div className="share-buttons-compact">
            <a
              href={`https://twitter.com/intent/tweet?text=I just found ${formatCurrency(results.annual_savings)}/year in hidden spending leaks using this free tool!&url=https://whereismymoneygo.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn-compact"
              title="Share on Twitter"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://whereismymoneygo.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn-compact"
              title="Share on Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://whereismymoneygo.com')
                alert('Link copied!')
              }}
              className="share-btn-compact"
              title="Copy link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Widget */}
      <FeedbackWidget
        context={{
          monthlyLeak: results.monthly_leak,
          subscriptionCount: results.subscriptions?.length || 0
        }}
      />
    </div>
  )
}
