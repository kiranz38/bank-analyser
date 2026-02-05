interface Leak {
  category: string
  merchant: string
  monthly_cost: number
  yearly_cost: number
  explanation: string
}

interface EasyWin {
  title: string
  estimated_yearly_savings: number
  action: string
}

interface ResultCardsProps {
  results: {
    monthly_leak: number
    annual_savings: number
    top_leaks: Leak[]
    easy_wins: EasyWin[]
    recovery_plan: string[]
  }
}

export default function ResultCards({ results }: ResultCardsProps) {
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

      {/* Top Leaks */}
      {results.top_leaks.length > 0 && (
        <div className="card">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Top Spending Leaks
          </h2>
          <ul className="leak-list">
            {results.top_leaks.map((leak, index) => (
              <li key={index} className="leak-item">
                <div className="leak-info">
                  <span className="leak-category">{leak.category}</span>
                  <div className="leak-merchant">{leak.merchant}</div>
                  <div className="leak-explanation">{leak.explanation}</div>
                </div>
                <div className="leak-amount">
                  <div className="leak-monthly">{formatCurrencyPrecise(leak.monthly_cost)}/mo</div>
                  <div className="leak-yearly">{formatCurrency(leak.yearly_cost)}/yr</div>
                </div>
              </li>
            ))}
          </ul>
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
    </div>
  )
}
