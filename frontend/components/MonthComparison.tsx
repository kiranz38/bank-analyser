interface CategoryChange {
  category: string
  previous: number
  current: number
  change: number
  change_percent: number
}

interface MonthComparisonData {
  previous_month: string
  current_month: string
  previous_total: number
  current_total: number
  total_change: number
  total_change_percent: number
  top_changes: CategoryChange[]
  spikes: CategoryChange[]
  months_analyzed: number
}

interface MonthComparisonProps {
  comparison: MonthComparisonData | null
}

export default function MonthComparison({ comparison }: MonthComparisonProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (!comparison) {
    return null
  }

  const isSpendingUp = comparison.total_change > 0

  return (
    <div className="card month-comparison">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Month-over-Month
      </h2>

      {/* Summary comparison */}
      <div className="comparison-summary">
        <div className="comparison-month">
          <span className="comparison-month-label">{formatMonth(comparison.previous_month)}</span>
          <span className="comparison-month-value">{formatCurrency(comparison.previous_total)}</span>
        </div>
        <div className="comparison-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
        <div className="comparison-month">
          <span className="comparison-month-label">{formatMonth(comparison.current_month)}</span>
          <span className="comparison-month-value">{formatCurrency(comparison.current_total)}</span>
        </div>
        <div className={`comparison-change ${isSpendingUp ? 'up' : 'down'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isSpendingUp ? (
              <polyline points="18 15 12 9 6 15" />
            ) : (
              <polyline points="6 9 12 15 18 9" />
            )}
          </svg>
          <span>
            {isSpendingUp ? '+' : ''}{formatCurrency(comparison.total_change)}
            ({comparison.total_change_percent > 0 ? '+' : ''}{comparison.total_change_percent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Spending spikes alert */}
      {comparison.spikes && comparison.spikes.length > 0 && (
        <div className="comparison-spikes">
          <div className="spike-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Spending Spikes Detected</span>
          </div>
          <ul className="spike-list">
            {comparison.spikes.map((spike, index) => (
              <li key={index} className="spike-item">
                <span className="spike-category">{spike.category}</span>
                <span className="spike-change">
                  +{formatCurrency(spike.change)} (+{spike.change_percent.toFixed(0)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top changes */}
      {comparison.top_changes && comparison.top_changes.length > 0 && (
        <div className="comparison-changes">
          <h3>Category Changes</h3>
          <ul className="changes-list">
            {comparison.top_changes.slice(0, 5).map((change, index) => {
              const isUp = change.change > 0
              return (
                <li key={index} className="change-item">
                  <span className="change-category">{change.category}</span>
                  <div className="change-values">
                    <span className="change-previous">{formatCurrency(change.previous)}</span>
                    <span className="change-arrow">→</span>
                    <span className="change-current">{formatCurrency(change.current)}</span>
                    <span className={`change-delta ${isUp ? 'up' : 'down'}`}>
                      {isUp ? '+' : ''}{formatCurrency(change.change)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="comparison-note">
        Based on {comparison.months_analyzed} months of data
      </div>
    </div>
  )
}
