'use client'

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

interface AlternativesPanelProps {
  alternatives: Alternative[]
}

export default function AlternativesPanel({ alternatives }: AlternativesPanelProps) {
  if (!alternatives || alternatives.length === 0) {
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

  const formatCurrencyPrecise = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Group by original service
  const grouped = alternatives.reduce((acc, alt) => {
    if (!acc[alt.original]) {
      acc[alt.original] = []
    }
    acc[alt.original].push(alt)
    return acc
  }, {} as Record<string, Alternative[]>)

  const totalYearlySavings = alternatives.reduce((sum, alt) => sum + alt.yearly_savings, 0)

  return (
    <div className="card alternatives-panel">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Cheaper Alternatives
      </h2>

      <div className="alternatives-header">
        <p className="alternatives-intro">
          We found cheaper or free alternatives that could save you up to{' '}
          <strong className="savings-highlight">{formatCurrency(totalYearlySavings)}/year</strong>
        </p>
      </div>

      <div className="alternatives-list">
        {Object.entries(grouped).map(([original, alts]) => (
          <div key={original} className="alternative-group">
            <div className="alternative-original">
              <span className="alternative-service">{original}</span>
              <span className="alternative-current">
                Currently: {formatCurrencyPrecise(alts[0].current_price)}/mo
              </span>
            </div>
            <div className="alternative-options">
              {alts.slice(0, 3).map((alt, index) => (
                <div key={index} className="alternative-option">
                  <div className="alternative-info">
                    <span className="alternative-name">
                      {alt.alternative}
                      {alt.alternative_price === 0 && (
                        <span className="free-badge">FREE</span>
                      )}
                    </span>
                    <span className="alternative-note">{alt.note}</span>
                  </div>
                  <div className="alternative-savings">
                    <span className="alternative-price">
                      {alt.alternative_price === 0 ? 'Free' : `${formatCurrencyPrecise(alt.alternative_price)}/mo`}
                    </span>
                    <span className="alternative-save">
                      Save {formatCurrency(alt.yearly_savings)}/yr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
