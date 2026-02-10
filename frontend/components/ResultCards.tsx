'use client'

import { useEffect } from 'react'
import SpendingBreakdown from './SpendingBreakdown'
import SubscriptionList from './SubscriptionList'
import MonthComparison from './MonthComparison'
import ShareCard from './ShareCard'
import AlternativesPanel from './AlternativesPanel'
import PriceChangesPanel from './PriceChangesPanel'
import DuplicateSubscriptionsPanel from './DuplicateSubscriptionsPanel'
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
  // Track analytics events when results are displayed
  useEffect(() => {
    // Track category breakdown viewed
    if (results.category_summary && results.category_summary.length > 0) {
      trackCategoryViewed(results.category_summary.map(c => c.category))
    }

    // Track share card generated
    if (results.share_summary) {
      trackShareCardGenerated(results.share_summary.annual_savings)
    }

    // Track alternatives viewed
    if (results.alternatives && results.alternatives.length > 0) {
      trackAlternativesViewed(results.alternatives.length)
    }

    // Track price changes viewed
    if (results.price_changes && results.price_changes.length > 0) {
      const totalImpact = results.price_changes.reduce((sum, pc) => sum + pc.yearly_impact, 0)
      trackPriceChangesViewed({
        count: results.price_changes.length,
        totalYearlyImpact: totalImpact
      })
    }

    // Track duplicate subscriptions viewed
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

  return (
    <div className="results">
      {/* Summary Stats */}
      <div className="card-grid">
        <div className="card stat-card">
          <div className="stat-icon danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-label">Monthly Leak</div>
          <div className="stat-value danger">{formatCurrency(results.monthly_leak)}</div>
          <p className="stat-sublabel">potential savings per month</p>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div className="stat-label">Annual Savings</div>
          <div className="stat-value success">{formatCurrency(results.annual_savings)}</div>
          <p className="stat-sublabel">if you address these leaks</p>
        </div>
      </div>

      {/* Top Leaks - Grouped by Category */}
      {results.top_leaks.length > 0 && (() => {
        // Group leaks by category
        const groupedLeaks = results.top_leaks.reduce((acc, leak) => {
          const category = leak.category || 'Other'
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(leak)
          return acc
        }, {} as Record<string, Leak[]>)

        // Calculate category totals (with NaN protection)
        const categoryTotals = Object.entries(groupedLeaks).map(([category, leaks]) => ({
          category,
          leaks,
          monthlyTotal: leaks.reduce((sum, l) => sum + (Number(l.monthly_cost) || 0), 0),
          yearlyTotal: leaks.reduce((sum, l) => sum + (Number(l.yearly_cost) || 0), 0)
        })).sort((a, b) => b.monthlyTotal - a.monthlyTotal)

        return (
          <div className="card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Recurring Spending Leaks
            </h2>
            <div className="leak-groups">
              {categoryTotals.map(({ category, leaks, monthlyTotal, yearlyTotal }) => (
                <div key={category} className="leak-group">
                  <div className="leak-group-header">
                    <div className="leak-group-badge">
                      <span className="leak-group-category">{category}</span>
                    </div>
                    <div className="leak-group-insight">
                      <span className="leak-group-message">
                        You&apos;re spending <strong className="leak-highlight">{formatCurrencyPrecise(monthlyTotal)}</strong> per month
                      </span>
                      <span className="leak-group-yearly">That&apos;s {formatCurrency(yearlyTotal)} per year</span>
                    </div>
                    <div className="leak-group-total-badge">
                      <span className="leak-total-amount">{formatCurrencyPrecise(monthlyTotal)}</span>
                      <span className="leak-total-period">/month</span>
                    </div>
                  </div>
                  <ul className="leak-group-items">
                    {leaks.map((leak, index) => (
                      <li key={index} className="leak-item">
                        <div className="leak-info">
                          <div className="leak-merchant">{leak.merchant}</div>
                          <div className="leak-explanation">{leak.explanation}</div>
                        </div>
                        <div className="leak-amount">
                          <div className="leak-monthly">{formatCurrencyPrecise(Number(leak.monthly_cost) || 0)}/mo</div>
                          <div className="leak-yearly">{formatCurrency(Number(leak.yearly_cost) || 0)}/yr</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Top 5 Biggest Transactions */}
      {results.top_spending && results.top_spending.length > 0 && (
        <div className="card top-transactions-card">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-4" />
            </svg>
            Top 5 Biggest Transactions
          </h2>
          <div className="top-transactions-list">
            {results.top_spending.map((item, index) => (
              <div key={index} className="top-transaction-item">
                <div className="top-transaction-rank">#{index + 1}</div>
                <div className="top-transaction-info">
                  <div className="top-transaction-merchant">{item.merchant}</div>
                  {item.date && <div className="top-transaction-date">{item.date}</div>}
                </div>
                <div className="top-transaction-amount">
                  {formatCurrencyPrecise(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Easy Wins */}
      {results.easy_wins.length > 0 && (
        <div className="card">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Easy Wins
          </h2>
          <div className="easy-wins-list">
            {results.easy_wins.map((win, index) => (
              <div key={index} className="easy-win">
                <div className="easy-win-header">
                  <span className="easy-win-title">{win.title}</span>
                  <span className="easy-win-savings">
                    Save {formatCurrency(win.estimated_yearly_savings)}/yr
                  </span>
                </div>
                <div className="easy-win-action">{win.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Breakdown by Category */}
      {results.category_summary && results.category_summary.length > 0 && (
        <SpendingBreakdown categories={results.category_summary} />
      )}

      {/* Detected Subscriptions */}
      {results.subscriptions && results.subscriptions.length > 0 && (
        <SubscriptionList subscriptions={results.subscriptions} />
      )}

      {/* Price Increases */}
      {results.price_changes && results.price_changes.length > 0 && (
        <PriceChangesPanel priceChanges={results.price_changes} />
      )}

      {/* Duplicate Subscriptions */}
      {results.duplicate_subscriptions && results.duplicate_subscriptions.length > 0 && (
        <DuplicateSubscriptionsPanel duplicates={results.duplicate_subscriptions} />
      )}

      {/* Cheaper Alternatives */}
      {results.alternatives && results.alternatives.length > 0 && (
        <AlternativesPanel alternatives={results.alternatives} />
      )}

      {/* Month-over-Month Comparison */}
      {results.comparison && (
        <MonthComparison comparison={results.comparison} />
      )}

      {/* Recovery Plan */}
      {results.recovery_plan.length > 0 && (
        <div className="card">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Your Recovery Plan
          </h2>
          <ol className="recovery-list">
            {results.recovery_plan.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Share Card Section */}
      {results.share_summary && (
        <ShareCard
          shareSummary={results.share_summary}
          onShare={(platform) => trackShareClicked(platform)}
        />
      )}

      {/* Fallback Share Section if no share_summary */}
      {!results.share_summary && (
        <div className="share-section">
        <div className="share-highlight">
          <span className="share-highlight-label">You're leaking</span>
          <span className="share-highlight-amount">{formatCurrency(results.monthly_leak)}/month</span>
          <span className="share-highlight-sublabel">(~{formatCurrency(results.annual_savings)}/year)</span>
        </div>

        <p className="share-cta">Found savings? Share this tool with friends & family.</p>

        <div className="share-buttons">
          <a
            href={`https://twitter.com/intent/tweet?text=I just found ${formatCurrency(results.annual_savings)}/year in hidden spending leaks using this free tool!&url=https://whereismymoneygo.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-twitter"
            title="Share on Twitter"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=https://whereismymoneygo.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-facebook"
            title="Share on Facebook"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a
            href={`https://wa.me/?text=I found ${formatCurrency(results.annual_savings)}/year in hidden spending leaks! Try this free tool: https://whereismymoneygo.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-whatsapp"
            title="Share on WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://whereismymoneygo.com')
              alert('Link copied!')
            }}
            className="share-btn share-copy"
            title="Copy link"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>

        <div className="feedback-link">
          <a href="mailto:raleobob@gmail.com?subject=Feedback for Where Is My Money Go">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Send us feedback
          </a>
        </div>
        </div>
      )}
    </div>
  )
}
