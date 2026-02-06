interface CategorySummary {
  category: string
  total: number
  percent: number
  transaction_count: number
  top_merchants: Array<{ name: string; total: number }>
}

interface SpendingBreakdownProps {
  categories: CategorySummary[]
}

// Category colors for visual distinction
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

export default function SpendingBreakdown({ categories }: SpendingBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (!categories || categories.length === 0) {
    return null
  }

  // Filter out transfers and income for spending breakdown
  const spendingCategories = categories.filter(
    c => c.category !== 'Transfers' && c.category !== 'Income'
  )

  const totalSpending = spendingCategories.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="card spending-breakdown">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
        Spending Breakdown
      </h2>

      {/* Visual bar chart */}
      <div className="category-bars">
        {spendingCategories.slice(0, 8).map((cat, index) => {
          const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Other']
          const widthPercent = totalSpending > 0 ? (cat.total / totalSpending) * 100 : 0

          return (
            <div key={index} className="category-bar-item">
              <div className="category-bar-header">
                <span className="category-bar-name">
                  <span
                    className="category-dot"
                    style={{ backgroundColor: color }}
                  />
                  {cat.category}
                </span>
                <span className="category-bar-amount">
                  {formatCurrency(cat.total)} ({cat.percent.toFixed(1)}%)
                </span>
              </div>
              <div className="category-bar-track">
                <div
                  className="category-bar-fill"
                  style={{
                    width: `${Math.max(widthPercent, 2)}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              {cat.top_merchants && cat.top_merchants.length > 0 && (
                <div className="category-bar-merchants">
                  {cat.top_merchants.slice(0, 2).map((m, i) => (
                    <span key={i} className="category-merchant">
                      {m.name}: {formatCurrency(m.total)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="category-total">
        <span>Total Spending</span>
        <span className="category-total-amount">{formatCurrency(totalSpending)}</span>
      </div>
    </div>
  )
}
