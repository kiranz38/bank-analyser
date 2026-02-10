'use client'

interface DuplicateSubscription {
  category: string
  services: string[]
  count: number
  combined_monthly: number
  combined_yearly: number
  suggestion: string
}

interface DuplicateSubscriptionsPanelProps {
  duplicates: DuplicateSubscription[]
}

export default function DuplicateSubscriptionsPanel({ duplicates }: DuplicateSubscriptionsPanelProps) {
  if (!duplicates || duplicates.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      'Streaming': (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
      ),
      'Music': (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
      'Cloud': (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      ),
      'Fitness': (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      ),
      'Food Delivery': (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
    }
    return icons[category] || (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="15" />
        <line x1="15" y1="9" x2="9" y2="15" />
      </svg>
    )
  }

  return (
    <div className="card duplicates-panel">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M4 16V6a2 2 0 0 1 2-2h10" />
        </svg>
        Overlapping Subscriptions
      </h2>

      <p className="duplicates-intro">
        You have multiple subscriptions in the same category. Consider consolidating to save money.
      </p>

      <div className="duplicates-list">
        {duplicates.map((dup, index) => (
          <div key={index} className="duplicate-item">
            <div className="duplicate-header">
              <div className="duplicate-category">
                {getCategoryIcon(dup.category)}
                <span>{dup.category}</span>
              </div>
              <div className="duplicate-cost">
                <span className="duplicate-count">{dup.count} services</span>
                <span className="duplicate-amount">{formatCurrency(dup.combined_monthly)}/mo</span>
              </div>
            </div>

            <div className="duplicate-services">
              {dup.services.map((service, i) => (
                <span key={i} className="service-badge">{service}</span>
              ))}
            </div>

            <div className="duplicate-suggestion">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>{dup.suggestion}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
