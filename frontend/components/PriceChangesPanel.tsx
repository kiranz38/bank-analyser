'use client'

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

interface PriceChangesPanelProps {
  priceChanges: PriceChange[]
}

export default function PriceChangesPanel({ priceChanges }: PriceChangesPanelProps) {
  if (!priceChanges || priceChanges.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const totalYearlyImpact = priceChanges.reduce((sum, pc) => sum + pc.yearly_impact, 0)

  return (
    <div className="card price-changes-panel">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        Price Increases Detected
      </h2>

      <div className="price-changes-header">
        <p className="price-changes-intro">
          Some of your subscriptions have increased in price, costing you an extra{' '}
          <strong className="warning-highlight">{formatCurrency(totalYearlyImpact)}/year</strong>
        </p>
      </div>

      <div className="price-changes-list">
        {priceChanges.map((change, index) => (
          <div key={index} className="price-change-item">
            <div className="price-change-info">
              <span className="price-change-merchant">{change.merchant}</span>
              <span className="price-change-dates">
                {formatDate(change.first_date)} to {formatDate(change.latest_date)}
              </span>
            </div>
            <div className="price-change-amounts">
              <div className="price-change-comparison">
                <span className="price-old">{formatCurrency(change.old_price)}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <span className="price-new">{formatCurrency(change.new_price)}</span>
              </div>
              <div className="price-change-impact">
                <span className="price-increase-badge">
                  +{formatCurrency(change.increase)}/mo (+{change.percent_change.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="price-changes-tip">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          Contact customer support to negotiate lower rates or switch to a cheaper tier.
        </span>
      </div>
    </div>
  )
}
