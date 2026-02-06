interface Subscription {
  merchant: string
  monthly_cost: number
  annual_cost: number
  confidence: number
  last_date: string
  occurrences: number
  reason: string
}

interface SubscriptionListProps {
  subscriptions: Subscription[]
}

export default function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (!subscriptions || subscriptions.length === 0) {
    return null
  }

  // Filter to high confidence subscriptions
  const confirmedSubs = subscriptions.filter(s => s.confidence >= 0.6)
  const possibleSubs = subscriptions.filter(s => s.confidence >= 0.5 && s.confidence < 0.6)

  const totalMonthly = confirmedSubs.reduce((sum, s) => sum + s.monthly_cost, 0)
  const totalAnnual = totalMonthly * 12

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return { text: 'Confirmed', className: 'confidence-high' }
    if (confidence >= 0.7) return { text: 'Likely', className: 'confidence-medium' }
    return { text: 'Possible', className: 'confidence-low' }
  }

  return (
    <div className="card subscriptions-card">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
        Detected Subscriptions
        <span className="subscription-count">{confirmedSubs.length} found</span>
      </h2>

      {/* Summary banner */}
      <div className="subscription-summary">
        <div className="subscription-summary-item">
          <span className="subscription-summary-label">Monthly Total</span>
          <span className="subscription-summary-value">{formatCurrency(totalMonthly)}</span>
        </div>
        <div className="subscription-summary-divider" />
        <div className="subscription-summary-item">
          <span className="subscription-summary-label">Annual Cost</span>
          <span className="subscription-summary-value danger">{formatCurrency(totalAnnual)}</span>
        </div>
      </div>

      {/* Subscription list */}
      <ul className="subscription-list">
        {confirmedSubs.map((sub, index) => {
          const confidenceInfo = getConfidenceLabel(sub.confidence)
          return (
            <li key={index} className="subscription-item">
              <div className="subscription-info">
                <div className="subscription-header">
                  <span className="subscription-merchant">{sub.merchant}</span>
                  <span className={`subscription-confidence ${confidenceInfo.className}`}>
                    {confidenceInfo.text}
                  </span>
                </div>
                <div className="subscription-details">
                  <span className="subscription-reason">{sub.reason}</span>
                  {sub.last_date && (
                    <span className="subscription-last-date">Last: {sub.last_date}</span>
                  )}
                </div>
              </div>
              <div className="subscription-cost">
                <div className="subscription-monthly">{formatCurrency(sub.monthly_cost)}/mo</div>
                <div className="subscription-annual">{formatCurrency(sub.annual_cost)}/yr</div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Possible subscriptions */}
      {possibleSubs.length > 0 && (
        <div className="possible-subscriptions">
          <h3>Possible Subscriptions</h3>
          <ul className="subscription-list possible">
            {possibleSubs.map((sub, index) => (
              <li key={index} className="subscription-item faded">
                <div className="subscription-info">
                  <span className="subscription-merchant">{sub.merchant}</span>
                  <span className="subscription-reason">{sub.reason}</span>
                </div>
                <div className="subscription-cost">
                  <span className="subscription-monthly">{formatCurrency(sub.monthly_cost)}/mo</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="subscription-tip">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>Review each subscription and cancel ones you no longer use to save {formatCurrency(totalAnnual)}/year</span>
      </div>
    </div>
  )
}
