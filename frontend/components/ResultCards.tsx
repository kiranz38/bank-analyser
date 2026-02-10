'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'
import ShareCard from './ShareCard'
import FeedbackWidget from './FeedbackWidget'
import {
  trackCategoryViewed,
  trackShareCardGenerated,
  trackShareClicked,
  trackAlternativesViewed,
  trackPriceChangesViewed,
  trackDuplicatesViewed,
  trackAlternativeClicked
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

const CATEGORY_COLORS: Record<string, string> = {
  'Subscriptions': '#8b5cf6',
  'Dining & Delivery': '#f97316',
  'Shopping': '#3b82f6',
  'Transport': '#10b981',
  'Groceries': '#22c55e',
  'Entertainment': '#ec4899',
  'Utilities & Bills': '#6366f1',
  'Health & Fitness': '#14b8a6',
  'Travel': '#f59e0b',
  'Fees': '#ef4444',
  'Transfers': '#64748b',
  'Other': '#94a3b8',
}

export default function ResultCards({ results }: ResultCardsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

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
      trackPriceChangesViewed({ count: results.price_changes.length, totalYearlyImpact: totalImpact })
    }
    if (results.duplicate_subscriptions && results.duplicate_subscriptions.length > 0) {
      const totalMonthly = results.duplicate_subscriptions.reduce((sum, d) => sum + d.combined_monthly, 0)
      trackDuplicatesViewed({ categoryCount: results.duplicate_subscriptions.length, totalMonthly })
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

  // Group leaks by category (defined early for fallback pie chart)
  const groupedLeaks = results.top_leaks.reduce((acc, leak) => {
    const category = leak.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(leak)
    return acc
  }, {} as Record<string, Leak[]>)

  const categoryTotals = Object.entries(groupedLeaks).map(([category, leaks]) => ({
    category,
    leaks,
    monthlyTotal: leaks.reduce((sum, l) => sum + (Number(l.monthly_cost) || 0), 0),
    yearlyTotal: leaks.reduce((sum, l) => sum + (Number(l.yearly_cost) || 0), 0)
  })).sort((a, b) => b.monthlyTotal - a.monthlyTotal)

  // Prepare pie chart data - use category_summary if available, fallback to leak categories
  const pieData = results.category_summary && results.category_summary.length > 0
    ? results.category_summary
        .filter(c => c.category !== 'Transfers' && c.category !== 'Income')
        .slice(0, 6)
        .map(cat => ({
          name: cat.category,
          value: cat.total,
          color: CATEGORY_COLORS[cat.category] || '#94a3b8'
        }))
    : categoryTotals
        .slice(0, 6)
        .map(ct => ({
          name: ct.category,
          value: ct.monthlyTotal,
          color: CATEGORY_COLORS[ct.category] || '#94a3b8'
        }))

  // Prepare comparison bar data
  const comparisonData = results.comparison ? [
    { name: results.comparison.previous_month.split('-')[1], amount: results.comparison.previous_total, fill: '#94a3b8' },
    { name: results.comparison.current_month.split('-')[1], amount: results.comparison.current_total, fill: results.comparison.total_change > 0 ? '#f97316' : '#10b981' }
  ] : []

  const confirmedSubs = (results.subscriptions || []).filter(s => s.confidence >= 0.6)

  return (
    <div className="results">
      {/* Summary Stats Row */}
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

      {/* Quick Overview Row - 3 columns */}
      <div className="dashboard-overview-row">
        {/* Spending Breakdown with Pie Chart */}
        {pieData.length > 0 && (
          <div className="card overview-card">
            <h3 className="overview-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              Spending
            </h3>
            <div className="mini-pie-container">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mini-legend">
              {pieData.slice(0, 4).map((cat, i) => (
                <span key={i} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
              ))}
            </div>
            <button className="expand-btn" onClick={() => toggleSection('spending')}>
              {expandedSections.spending ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        )}

        {/* Subscriptions Summary */}
        {confirmedSubs.length > 0 && (
          <div className="card overview-card">
            <h3 className="overview-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4" />
              </svg>
              Subscriptions
            </h3>
            <div className="overview-stat">
              <span className="overview-number">{confirmedSubs.length}</span>
              <span className="overview-label">detected</span>
            </div>
            <div className="overview-amount">
              {formatCurrencyPrecise(confirmedSubs.reduce((s, sub) => s + sub.monthly_cost, 0))}/mo
            </div>
            <button className="expand-btn" onClick={() => toggleSection('subscriptions')}>
              {expandedSections.subscriptions ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        )}

        {/* Month Comparison */}
        {results.comparison && (
          <div className="card overview-card">
            <h3 className="overview-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              vs Last Month
            </h3>
            <div className="mini-bar-container">
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={comparisonData} barGap={4}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={`change-badge ${results.comparison.total_change > 0 ? 'up' : 'down'}`}>
              {results.comparison.total_change > 0 ? '+' : ''}{formatCurrency(results.comparison.total_change)}
            </div>
          </div>
        )}

        {/* Quick Wins */}
        {results.easy_wins.length > 0 && (
          <div className="card overview-card">
            <h3 className="overview-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Quick Wins
            </h3>
            <div className="overview-stat">
              <span className="overview-number">{results.easy_wins.length}</span>
              <span className="overview-label">actions</span>
            </div>
            <div className="overview-amount success">
              Save {formatCurrency(results.easy_wins.reduce((s, w) => s + w.estimated_yearly_savings, 0))}/yr
            </div>
            <button className="expand-btn" onClick={() => toggleSection('wins')}>
              {expandedSections.wins ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        )}
      </div>

      {/* Expanded Spending Details */}
      {expandedSections.spending && results.category_summary && (
        <div className="card expanded-section">
          <h2>Spending Breakdown</h2>
          <div className="category-bars">
            {results.category_summary.filter(c => c.category !== 'Transfers' && c.category !== 'Income').slice(0, 8).map((cat, index) => (
              <div key={index} className="category-bar-item">
                <div className="category-bar-header">
                  <span className="category-bar-name">
                    <span className="category-dot" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }} />
                    {cat.category}
                  </span>
                  <span className="category-bar-amount">{formatCurrency(cat.total)} ({cat.percent.toFixed(1)}%)</span>
                </div>
                <div className="category-bar-track">
                  <div className="category-bar-fill" style={{ width: `${Math.max(cat.percent, 2)}%`, backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Subscriptions Details */}
      {expandedSections.subscriptions && confirmedSubs.length > 0 && (
        <div className="card expanded-section">
          <h2>Detected Subscriptions</h2>
          <ul className="subscription-list">
            {confirmedSubs.map((sub, index) => (
              <li key={index} className="subscription-item">
                <div className="subscription-info">
                  <span className="subscription-merchant">{sub.merchant}</span>
                  <span className="subscription-reason">{sub.reason}</span>
                </div>
                <div className="subscription-cost">
                  <div className="subscription-monthly">{formatCurrencyPrecise(sub.monthly_cost)}/mo</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expanded Quick Wins */}
      {expandedSections.wins && results.easy_wins.length > 0 && (
        <div className="card expanded-section">
          <h2>Easy Wins</h2>
          <div className="easy-wins-list">
            {results.easy_wins.map((win, index) => (
              <div key={index} className="easy-win">
                <div className="easy-win-header">
                  <span className="easy-win-title">{win.title}</span>
                  <span className="easy-win-savings">Save {formatCurrency(win.estimated_yearly_savings)}/yr</span>
                </div>
                <div className="easy-win-action">{win.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three Column Row: Easy Wins, Spending Leaks, Recovery Plan */}
      <div className="three-column-row">
        {/* Easy Wins Card */}
        {results.easy_wins.length > 0 && (
          <div className="card column-card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Easy Wins
            </h2>
            <div className="column-card-content">
              {results.easy_wins.slice(0, 4).map((win, index) => (
                <div key={index} className="column-item">
                  <div className="column-item-title">{win.title}</div>
                  <div className="column-item-detail">{win.action}</div>
                  <div className="column-item-value success">Save {formatCurrency(win.estimated_yearly_savings)}/yr</div>
                </div>
              ))}
              {results.easy_wins.length > 4 && (
                <button className="view-more-btn" onClick={() => toggleSection('wins')}>
                  +{results.easy_wins.length - 4} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Spending Leaks Card */}
        {results.top_leaks.length > 0 && (
          <div className="card column-card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Spending Leaks
            </h2>
            <div className="column-card-content">
              {categoryTotals.slice(0, 4).map(({ category, monthlyTotal, leaks }) => (
                <div key={category} className="column-item">
                  <div className="column-item-title">{category}</div>
                  <div className="column-item-detail">{leaks.length} item{leaks.length > 1 ? 's' : ''}</div>
                  <div className="column-item-value danger">{formatCurrencyPrecise(monthlyTotal)}/mo</div>
                </div>
              ))}
              {categoryTotals.length > 4 && (
                <button className="view-more-btn" onClick={() => toggleSection('leaks')}>
                  +{categoryTotals.length - 4} more categories
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recovery Plan Card */}
        {results.recovery_plan.length > 0 && (
          <div className="card column-card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Recovery Plan
            </h2>
            <div className="column-card-content">
              <ol className="recovery-list-compact">
                {results.recovery_plan.slice(0, 5).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              {results.recovery_plan.length > 5 && (
                <button className="view-more-btn" onClick={() => toggleSection('recovery')}>
                  +{results.recovery_plan.length - 5} more steps
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Spending Leaks Details */}
      {expandedSections.leaks && results.top_leaks.length > 0 && (
        <div className="card expanded-section">
          <h2>All Spending Leaks</h2>
          <div className="leak-groups">
            {categoryTotals.map(({ category, leaks, monthlyTotal }) => (
              <div key={category} className="leak-group">
                <div className="leak-group-header">
                  <span className="leak-group-category">{category}</span>
                  <span className="leak-group-total">{formatCurrencyPrecise(monthlyTotal)}/mo</span>
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
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Recovery Plan */}
      {expandedSections.recovery && results.recovery_plan.length > 0 && (
        <div className="card expanded-section">
          <h2>Full Recovery Plan</h2>
          <ol className="recovery-list">
            {results.recovery_plan.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Top Transactions */}
      {results.top_spending && results.top_spending.length > 0 && (
        <div className="card">
          <div className="section-header-row" onClick={() => toggleSection('transactions')}>
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
              </svg>
              Top Transactions
            </h2>
            <span className="toggle-icon">{expandedSections.transactions ? '−' : '+'}</span>
          </div>
          {expandedSections.transactions && (
            <div className="top-transactions-list">
              {results.top_spending.map((item, index) => (
                <div key={index} className="top-transaction-item">
                  <div className="top-transaction-rank">#{index + 1}</div>
                  <div className="top-transaction-info">
                    <div className="top-transaction-merchant">{item.merchant}</div>
                    {item.date && <div className="top-transaction-date">{item.date}</div>}
                  </div>
                  <div className="top-transaction-amount">{formatCurrencyPrecise(item.amount)}</div>
                </div>
              ))}
            </div>
          )}
          {!expandedSections.transactions && (
            <div className="section-preview">
              {results.top_spending.slice(0, 3).map((t, i) => (
                <span key={i} className="preview-tag">
                  {t.merchant}: {formatCurrencyPrecise(t.amount)}
                  {t.date && <span className="preview-date"> ({t.date})</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Changes */}
      {results.price_changes && results.price_changes.length > 0 && (
        <div className="card">
          <div className="section-header-row" onClick={() => toggleSection('prices')}>
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              Price Increases ({results.price_changes.length})
            </h2>
            <span className="toggle-icon">{expandedSections.prices ? '−' : '+'}</span>
          </div>
          {expandedSections.prices && (
            <div className="price-changes-list">
              {results.price_changes.map((change, index) => (
                <div key={index} className="price-change-item">
                  <span className="price-change-merchant">{change.merchant}</span>
                  <span className="price-change-delta">+{formatCurrencyPrecise(change.increase)}/mo</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alternatives */}
      {results.alternatives && results.alternatives.length > 0 && (
        <div className="card">
          <div className="section-header-row" onClick={() => toggleSection('alternatives')}>
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Cheaper Alternatives ({results.alternatives.length})
            </h2>
            <span className="toggle-icon">{expandedSections.alternatives ? '−' : '+'}</span>
          </div>
          {expandedSections.alternatives && (
            <div className="alternatives-list">
              {results.alternatives.map((alt, index) => (
                <div key={index} className="alternative-option" onClick={() => trackAlternativeClicked({ original: alt.original, alternative: alt.alternative, potentialSavings: alt.yearly_savings })}>
                  <div className="alternative-info">
                    <span className="alternative-name">{alt.original} → {alt.alternative}</span>
                    <span className="alternative-note">{alt.note}</span>
                  </div>
                  <span className="alternative-save">Save {formatCurrency(alt.yearly_savings)}/yr</span>
                </div>
              ))}
            </div>
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

