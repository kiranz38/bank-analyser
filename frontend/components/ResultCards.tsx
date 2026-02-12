'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import ShareCard from './ShareCard'
import FeedbackWidget from './FeedbackWidget'
import {
  trackCategoryViewed,
  trackShareCardGenerated,
  trackShareClicked,
  trackAlternativesViewed,
  trackPriceChangesViewed,
  trackDuplicatesViewed,
  trackAlternativeClicked,
  trackProUpsellViewed,
  trackProReportGenerated,
  trackProReportDownloaded,
  trackProCheckoutStarted,
  trackProLegalAccepted,
  trackProPdfDownloadClicked,
  trackProRefundIssued,
  trackProBuyClicked,
  trackProPayClicked,
} from '@/lib/analytics'
import type { AnalysisResult, Leak } from '@/lib/types'

interface ResultCardsProps {
  results: AnalysisResult
  proPaymentStatus?: 'success' | 'cancelled' | null
  proSessionId?: string | null
  proCustomerEmail?: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  'Subscriptions': '#8b5cf6',
  'Dining & Delivery': '#f97316',
  'Food Delivery': '#fb923c',
  'Shopping': '#3b82f6',
  'Transport': '#10b981',
  'Groceries': '#22c55e',
  'Entertainment': '#ec4899',
  'Utilities & Bills': '#6366f1',
  'Health & Fitness': '#14b8a6',
  'Travel': '#f59e0b',
  'Fees': '#ef4444',
  'Fees & Charges': '#dc2626',
  'Transfers': '#64748b',
  'Other': '#94a3b8',
}

export default function ResultCards({ results, proPaymentStatus, proSessionId, proCustomerEmail }: ResultCardsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [showSpendingModal, setShowSpendingModal] = useState(false)
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false)
  const [showQuickWinsModal, setShowQuickWinsModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
            <div className="mini-pie-container" id="pdf-chart-capture">
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
            <button className="expand-btn" onClick={() => setShowSpendingModal(true)}>
              View Details
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
            <button className="expand-btn" onClick={() => setShowSubscriptionsModal(true)}>
              View Details
            </button>
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
            <button className="expand-btn" onClick={() => setShowQuickWinsModal(true)}>
              View Details
            </button>
          </div>
        )}
      </div>

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
                <button className="view-more-btn" onClick={() => setShowQuickWinsModal(true)}>
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
                        {(leak.date || leak.last_date) && (
                          <div className="leak-date">Last charged: {leak.date || leak.last_date}</div>
                        )}
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
        <div className="card card-recovery expanded-section">
          <div className="card-recovery-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h2>Full Recovery Plan</h2>
          </div>
          <ol className="recovery-list">
            {results.recovery_plan.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Top Transactions */}
      {results.top_spending && results.top_spending.length > 0 && (
        <div className="card card-transactions">
          <div className="section-header-row" onClick={() => toggleSection('transactions')}>
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
              </svg>
              Top Transactions
            </h2>
            <span className="toggle-icon">{expandedSections.transactions ? '▲' : '▼'}</span>
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
            <span className="toggle-icon">{expandedSections.prices ? '▲' : '▼'}</span>
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
            <span className="toggle-icon">{expandedSections.alternatives ? '▲' : '▼'}</span>
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

      {/* Pro Report Upsell */}
      <ProReportCard results={results} proPaymentStatus={proPaymentStatus} proSessionId={proSessionId} proCustomerEmail={proCustomerEmail} />

      {/* Feedback Widget */}
      <FeedbackWidget
        context={{
          monthlyLeak: results.monthly_leak,
          subscriptionCount: results.subscriptions?.length || 0
        }}
      />

      {/* Spending Details Modal */}
      {showSpendingModal && (
        <div className="modal-overlay" onClick={() => setShowSpendingModal(false)}>
          <div className="modal-content spending-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-handle" />
            <div className="modal-header">
              <h2>Spending Analysis</h2>
              <button className="modal-close" onClick={() => setShowSpendingModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Month indicator */}
              {results.comparison && (
                <div className="spending-month-label">
                  Analyzing: {results.comparison.current_month}
                  {results.comparison.months_analyzed > 1 && ` (${results.comparison.months_analyzed} months)`}
                </div>
              )}

              {/* Charts Row - Side by Side */}
              <div className="spending-charts-row">
                {/* Pie Chart */}
                <div className="spending-chart-panel">
                  <h3>By Category</h3>
                  <div className="chart-container-compact">
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend-compact">
                      {pieData.slice(0, 6).map((cat, i) => (
                        <div key={i} className="pie-legend-item">
                          <span className="pie-legend-dot" style={{ backgroundColor: cat.color }} />
                          <span className="pie-legend-name">{cat.name}</span>
                          <span className="pie-legend-value">{formatCurrency(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="spending-chart-panel">
                  <h3>Spending Breakdown</h3>
                  <div className="chart-container-compact">
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart
                        data={pieData.slice(0, 6).map(d => ({ name: d.name.length > (isMobile ? 10 : 12) ? d.name.slice(0, isMobile ? 10 : 12) + '...' : d.name, amount: d.value, fill: d.color }))}
                        layout="vertical"
                        margin={isMobile ? { left: 10, right: 10, top: 5, bottom: 5 } : { left: 10, right: 15, top: 10, bottom: 10 }}
                      >
                        <XAxis type="number" tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} tick={{ fontSize: isMobile ? 9 : 10 }} />
                        <YAxis type="category" dataKey="name" width={isMobile ? 60 : 75} tick={{ fontSize: isMobile ? 9 : 11 }} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                        <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={isMobile ? 16 : 20}>
                          {pieData.slice(0, 6).map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Category Details */}
              {results.category_summary && results.category_summary.length > 0 && (
                <div className="spending-details-section">
                  <h3>Category Details</h3>
                  <div className="category-details-grid">
                    {results.category_summary
                      .filter(c => c.category !== 'Transfers' && c.category !== 'Income')
                      .slice(0, 8)
                      .map((cat, index) => (
                        <div key={index} className="category-detail-card" style={{ borderLeftColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }}>
                          <div className="category-detail-header">
                            <span className="category-detail-name">{cat.category}</span>
                            <span className="category-detail-percent">{cat.percent.toFixed(1)}%</span>
                          </div>
                          <div className="category-detail-amount">{formatCurrency(cat.total)}</div>
                          <div className="category-detail-count">{cat.transaction_count} transactions</div>
                          {cat.top_merchants && cat.top_merchants.length > 0 && (
                            <div className="category-detail-merchants">
                              {cat.top_merchants.slice(0, 3).map((m, i) => (
                                <span key={i} className="merchant-tag">{m.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Modal */}
      {showSubscriptionsModal && confirmedSubs.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowSubscriptionsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-handle" />
            <div className="modal-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Detected Subscriptions
              </h2>
              <button className="modal-close" onClick={() => setShowSubscriptionsModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-summary">
                <div className="modal-stat">
                  <span className="modal-stat-value">{confirmedSubs.length}</span>
                  <span className="modal-stat-label">Subscriptions Found</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-value">{formatCurrencyPrecise(confirmedSubs.reduce((s, sub) => s + sub.monthly_cost, 0))}</span>
                  <span className="modal-stat-label">Monthly Total</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-value">{formatCurrency(confirmedSubs.reduce((s, sub) => s + sub.annual_cost, 0))}</span>
                  <span className="modal-stat-label">Annual Total</span>
                </div>
              </div>
              <div className="subscription-list-modal">
                {confirmedSubs.map((sub, index) => (
                  <div key={index} className="subscription-modal-item">
                    <div className="subscription-modal-info">
                      <div className="subscription-modal-merchant">{sub.merchant}</div>
                      <div className="subscription-modal-reason">{sub.reason}</div>
                      <div className="subscription-modal-date">Last charged: {sub.last_date}</div>
                    </div>
                    <div className="subscription-modal-cost">
                      <div className="subscription-modal-monthly">{formatCurrencyPrecise(sub.monthly_cost)}/mo</div>
                      <div className="subscription-modal-annual">{formatCurrency(sub.annual_cost)}/yr</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Wins Modal */}
      {showQuickWinsModal && results.easy_wins.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowQuickWinsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-handle" />
            <div className="modal-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Quick Wins - Easy Savings
              </h2>
              <button className="modal-close" onClick={() => setShowQuickWinsModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-summary success-theme">
                <div className="modal-stat">
                  <span className="modal-stat-value">{results.easy_wins.length}</span>
                  <span className="modal-stat-label">Quick Actions</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-value success">{formatCurrency(results.easy_wins.reduce((s, w) => s + w.estimated_yearly_savings, 0))}</span>
                  <span className="modal-stat-label">Potential Yearly Savings</span>
                </div>
              </div>
              <div className="quick-wins-list-modal">
                {results.easy_wins.map((win, index) => (
                  <div key={index} className="quick-win-modal-item">
                    <div className="quick-win-modal-number">{index + 1}</div>
                    <div className="quick-win-modal-content">
                      <div className="quick-win-modal-title">{win.title}</div>
                      <div className="quick-win-modal-action">{win.action}</div>
                    </div>
                    <div className="quick-win-modal-savings">
                      <span className="savings-amount">Save {formatCurrency(win.estimated_yearly_savings)}</span>
                      <span className="savings-period">/year</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type ProCardState = 'upsell' | 'checkout' | 'generating' | 'success' | 'error'

function ProReportCard({ results, proPaymentStatus, proSessionId, proCustomerEmail }: {
  results: AnalysisResult
  proPaymentStatus?: 'success' | 'cancelled' | null
  proSessionId?: string | null
  proCustomerEmail?: string | null
}) {
  const [cardState, setCardState] = useState<ProCardState>('upsell')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  // Generation progress
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [modalSuccess, setModalSuccess] = useState(false)

  // Legal checkboxes
  const [legalData, setLegalData] = useState(false)
  const [legalNoRefund, setLegalNoRefund] = useState(false)

  // Success state
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<'sent' | 'failed' | 'pending' | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

  const [upsellTracked, setUpsellTracked] = useState(false)
  const [paymentHandled, setPaymentHandled] = useState(false)

  const bothLegalChecked = legalData && legalNoRefund

  // Track upsell card view once
  useEffect(() => {
    if (!upsellTracked) {
      trackProUpsellViewed()
      setUpsellTracked(true)
    }
  }, [upsellTracked])

  // Handle payment redirect result
  useEffect(() => {
    if (paymentHandled) return

    if (proPaymentStatus === 'cancelled') {
      setErrorMsg('Payment was cancelled. You can try again whenever you\'re ready.')
      const timer = setTimeout(() => setErrorMsg(null), 6000)
      setPaymentHandled(true)
      return () => clearTimeout(timer)
    }

    if (proPaymentStatus === 'success' && proSessionId) {
      setPaymentHandled(true)
      generateAndDeliver(proSessionId, proCustomerEmail || '')
    }
  }, [proPaymentStatus, proSessionId, proCustomerEmail, paymentHandled])

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const generateAndDeliver = async (sessionId: string, customerEmail: string) => {
    setCardState('generating')
    setErrorMsg(null)
    setProgress(0)
    setProgressLabel('Loading modules...')

    // Step 1: Generate PDF client-side with validation gate
    let blob: Blob
    try {
      const { generateProReportWithWarnings } = await import('@/lib/proReportGenerator')
      const { validateReportData } = await import('@/lib/reportValidation')
      const { generateProPdf } = await import('@/lib/generateProPdf')
      const { runReportQa, applyQaResult } = await import('@/lib/reportQaClaude')
      const { trackEvent } = await import('@/lib/analytics')

      // 1a. Generate report with warning tracking
      setProgress(15)
      setProgressLabel('Analyzing spending data...')
      const { report: rawReport, warnings } = generateProReportWithWarnings(results)

      // 1b. Validate against Zod schema + invariants
      setProgress(30)
      setProgressLabel('Validating report data...')
      const validation = validateReportData(rawReport)

      // 1c. Run Claude QA (feature-flagged, non-blocking on failure)
      setProgress(40)
      setProgressLabel('Running quality checks...')
      const qaResult = await runReportQa(validation.safeData, validation)

      // 1d. Apply QA omissions to produce final report
      setProgress(60)
      setProgressLabel('Finalizing insights...')
      const { report: finalReport, omittedSections, isSafeMode } = applyQaResult(
        validation.safeData, qaResult, validation.failedSections
      )

      // 1e. Structured log (no PII) + analytics
      const reportMeta = {
        event: 'pro_report_quality_gate',
        valid: validation.valid,
        qa_pass: qaResult.pass,
        severity: qaResult.severity,
        omitted_sections_count: omittedSections.length,
        warnings_count: warnings.length,
        safe_mode: isSafeMode,
        section_counts: {
          monthly_trends: finalReport.monthly_trends.length,
          subscriptions: finalReport.subscription_insights.length,
          actions: finalReport.action_plan.length,
          categories: finalReport.category_deep_dives.length,
        },
      }
      console.log('[ProReport]', JSON.stringify(reportMeta))

      if (!validation.valid || !qaResult.pass || omittedSections.length > 0) {
        trackEvent('pro_report_quality_gate', {
          valid: validation.valid,
          qa_pass: qaResult.pass,
          severity: qaResult.severity,
          omitted_sections_count: omittedSections.length,
          warnings_count: warnings.length,
          safe_mode: isSafeMode,
        })
      }

      trackProReportGenerated()

      // 1f. Generate PDF with quality metadata
      setProgress(70)
      setProgressLabel('Building your PDF...')
      blob = await generateProPdf(finalReport, {
        omittedSections,
        isSafeMode,
        warnings,
        narrativeBullets: qaResult.narrativeBullets,
        qaNote: qaResult.notesForUser,
      })
      setPdfBlob(blob)
    } catch (err) {
      // PDF generation itself failed — this is the only case we refund
      console.error('Pro PDF generation failed:', err)
      const msg = err instanceof Error ? err.message : String(err)
      try {
        const refundRes = await fetch('/api/refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, reason: 'pdf_generation_failed' }),
        })
        if (refundRes.ok) {
          trackProRefundIssued()
          setErrorMsg(`Report generation failed: ${msg}. A full refund has been issued to your card.`)
        } else {
          setErrorMsg(`Report generation failed: ${msg}. Please contact support for a refund.`)
        }
      } catch {
        setErrorMsg(`Report generation failed: ${msg}. Please contact support for a refund.`)
      }
      setCardState('error')
      return
    }

    // Step 2: Upload to server for storage + email delivery
    // If this fails, the PDF is still available for download — no refund needed
    setProgress(85)
    setProgressLabel('Sending to your email...')
    try {
      const formData = new FormData()
      formData.append('sessionId', sessionId)
      formData.append('email', customerEmail)
      formData.append('pdf', blob, 'leaky-wallet-pro-report.pdf')

      const res = await fetch('/api/deliver-report', { method: 'POST', body: formData })
      const data = await res.json()

      setProgress(100)
      setProgressLabel('Done!')

      if (!res.ok) {
        console.warn('Deliver-report returned error:', data.error)
        setEmailStatus('failed')
      } else {
        setDownloadUrl(data.downloadUrl || null)
        setEmailStatus(data.emailStatus || null)
      }

      // Show success in modal briefly, then move to card
      setModalSuccess(true)
      await new Promise(r => setTimeout(r, 2000))
      setModalSuccess(false)
      setCardState('success')
    } catch (deliveryErr) {
      // Network/server error on delivery — PDF still ready, just email failed
      console.warn('Deliver-report fetch failed (PDF still available):', deliveryErr)
      setProgress(100)
      setProgressLabel('Done!')
      setEmailStatus('failed')

      setModalSuccess(true)
      await new Promise(r => setTimeout(r, 2000))
      setModalSuccess(false)
      setCardState('success')
    }
  }

  const handleStartCheckout = () => {
    setEmailError(null)
    setErrorMsg(null)

    if (!email.trim()) {
      setEmailError('Please enter your email address')
      return
    }
    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address')
      return
    }
    if (!bothLegalChecked) return

    trackProLegalAccepted()
    trackProBuyClicked()
    setCardState('checkout')
  }

  const handlePay = async () => {
    setLoading(true)
    setErrorMsg(null)
    trackProPayClicked()

    try {
      const legalAcceptedAt = new Date().toISOString()

      // DEV MODE: skip Stripe and generate PDF directly
      if (process.env.NODE_ENV === 'development') {
        await generateAndDeliver('dev-session-' + Date.now(), email.trim())
        setLoading(false)
        return
      }

      trackProCheckoutStarted()

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          legalAcceptedAt,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start checkout')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Checkout failed:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMsg(`Checkout failed: ${msg}`)
      setCardState('upsell')
      setLoading(false)
    }
  }

  const handleDownload = () => {
    trackProPdfDownloadClicked()
    trackProReportDownloaded('pdf')

    if (pdfBlob) {
      // Download from local blob
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'leaky-wallet-pro-report.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (downloadUrl) {
      // Fallback: download from server
      window.open(downloadUrl, '_blank')
    }
  }

  // ── ALWAYS RENDER UPSELL CARD ──
  const showModal = cardState === 'checkout' || cardState === 'generating' || modalSuccess
  const showResult = cardState === 'success' || cardState === 'error'

  return (
    <>
      {/* ── Checkout / Generating Modal ── */}
      {showModal && (
        <div className="pro-modal-overlay" onClick={cardState === 'checkout' && !loading ? () => { setCardState('upsell'); setLoading(false) } : undefined}>
          <div className="pro-modal" onClick={(e) => e.stopPropagation()}>
            {modalSuccess ? (
              <div className="pro-modal-success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3>Your report is ready!</h3>
                {emailStatus === 'sent' && (proCustomerEmail || email) && (
                  <p>Sent to {proCustomerEmail || email}</p>
                )}
                {emailStatus === 'failed' && (
                  <p>Download available below</p>
                )}
              </div>
            ) : cardState === 'generating' ? (
              <div className="pro-modal-generating">
                <svg className="spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <h3>Generating your report...</h3>
                <div className="pro-progress-bar">
                  <div className="pro-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="pro-progress-label">{progressLabel}</p>
                <p className="pro-progress-percent">{progress}%</p>
              </div>
            ) : (
              <>
                <div className="pro-modal-header">
                  <h3>Confirm &amp; Pay</h3>
                  <button
                    className="pro-modal-close"
                    onClick={() => { setCardState('upsell'); setLoading(false) }}
                    disabled={loading}
                    aria-label="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <p className="pro-modal-email">
                  Report will be sent to <strong>{email}</strong>
                </p>

                <div className="pro-checkout-summary">
                  <div className="pro-checkout-line">
                    <span>Pro Financial Report (PDF)</span>
                    <span>$1.99</span>
                  </div>
                  <div className="pro-checkout-line pro-checkout-total">
                    <span>Total</span>
                    <span>$1.99</span>
                  </div>
                </div>

                <button className="btn btn-pro" onClick={handlePay} disabled={loading} style={{ width: '100%' }}>
                  {loading ? (
                    <>
                      <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Pay $1.99 — Secure Checkout
                    </>
                  )}
                </button>

                <p className="pro-email-privacy" style={{ marginTop: '0.75rem' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure payment via Stripe. We never see your card details.
                </p>

                {errorMsg && <p className="pro-error-inline">{errorMsg}</p>}
              </>
            )}
          </div>
        </div>
      )}

      <div className="card pro-upsell-card">
        <div className="pro-upsell-badge">PRO</div>

        {/* ── Upsell content (always present, dimmed when result showing) ── */}
        <div style={showResult ? { opacity: 0.3, pointerEvents: 'none' } : undefined}>
          <h2 className="pro-upsell-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Get Your Full Report via Email
          </h2>
          <p className="pro-upsell-subtitle">
            Send the full detailed report straight to your inbox.
          </p>

          {/* Blurred preview teaser */}
          <div className="pro-blurred-preview">
            <div className="pro-preview-row">
              <span className="pro-preview-label">Health Score</span>
              <span className="pro-preview-value blurred">72 / 100</span>
            </div>
            <div className="pro-preview-row">
              <span className="pro-preview-label">Savings Projection (12 mo)</span>
              <span className="pro-preview-value blurred">$2,847</span>
            </div>
            <div className="pro-preview-row">
              <span className="pro-preview-label">Priority Actions</span>
              <span className="pro-preview-value blurred">8 items</span>
            </div>
            <span className="pro-preview-unlock">Unlock with Pro Report</span>
          </div>

          <div className="pro-features-grid">
            <div className="pro-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Send full report to your email</span>
            </div>
            <div className="pro-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Downloadable PDF summary</span>
            </div>
            <div className="pro-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>Deeper spending insights</span>
            </div>
            <div className="pro-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Recurring charges detection</span>
            </div>
            <div className="pro-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span>Personalised saving suggestions</span>
            </div>
            <div className="pro-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <span>Category deep dives with trends</span>
            </div>
          </div>

          {/* Email input */}
          <div className="pro-email-capture">
            <div className="pro-email-input-row">
              <input
                type="email"
                className="pro-email-input"
                placeholder="your@email.com — we'll send the report here"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null) }}
              />
            </div>
            {emailError && <p className="pro-email-error">{emailError}</p>}
          </div>

          {/* Legal checkboxes */}
          <div className="pro-legal-checkboxes">
            <label className="pro-legal-label">
              <input
                type="checkbox"
                checked={legalData}
                onChange={(e) => setLegalData(e.target.checked)}
              />
              <span>I understand my data is processed only for this report and not stored.</span>
            </label>
            <label className="pro-legal-label">
              <input
                type="checkbox"
                checked={legalNoRefund}
                onChange={(e) => setLegalNoRefund(e.target.checked)}
              />
              <span>I agree this is a one-time digital purchase delivered instantly via email.</span>
            </label>
          </div>

          <button
            className="btn btn-pro"
            onClick={handleStartCheckout}
            disabled={!bothLegalChecked || !email.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Get report via email — $1.99
          </button>
          <p className="pro-early-access">Early access price — helping us build v1</p>
          <p className="pro-email-privacy">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure payment via Stripe. We never see your card details.
          </p>

          {errorMsg && !showResult && <p className="pro-error-inline">{errorMsg}</p>}
        </div>

        {/* ── Success / Error result at card bottom ── */}
        {cardState === 'success' && (
          <div className="pro-card-result pro-card-result-success">
            <div className="pro-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="pro-upsell-title">Your report is ready.</h2>
            <button className="btn btn-pro pro-download-btn" onClick={handleDownload}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF Report
            </button>
            {emailStatus === 'sent' && (proCustomerEmail || email) && (
              <p className="pro-email-sent-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                We&apos;ve also sent this to {proCustomerEmail || email}.
              </p>
            )}
            {emailStatus === 'failed' && (
              <p className="pro-email-failed-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Email delivery may be delayed — your download is available now.
              </p>
            )}
          </div>
        )}
        {cardState === 'error' && (
          <div className="pro-card-result pro-card-result-error">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <h2 className="pro-upsell-title">Something went wrong</h2>
            {errorMsg && <p className="pro-error-detail">{errorMsg}</p>}
            {pdfBlob && (
              <button className="btn btn-pro" onClick={handleDownload}>
                Download PDF Report
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

