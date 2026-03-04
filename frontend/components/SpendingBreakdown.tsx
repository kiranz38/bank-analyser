import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart } from 'lucide-react'

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

  const spendingCategories = categories.filter(
    c => c.category !== 'Transfers' && c.category !== 'Income'
  )

  const totalSpending = spendingCategories.reduce((sum, c) => sum + c.total, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Spending Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {spendingCategories.slice(0, 8).map((cat, index) => {
          const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Other']
          const widthPercent = totalSpending > 0 ? (cat.total / totalSpending) * 100 : 0

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {cat.category}
                </span>
                <span className="font-medium text-muted-foreground">
                  {formatCurrency(cat.total)} ({cat.percent.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(widthPercent, 2)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              {cat.top_merchants && cat.top_merchants.length > 0 && (
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {cat.top_merchants.slice(0, 2).map((m, i) => (
                    <span key={i}>
                      {m.name}: {formatCurrency(m.total)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="flex items-center justify-between border-t pt-3 text-sm font-semibold">
          <span>Total Spending</span>
          <span>{formatCurrency(totalSpending)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
