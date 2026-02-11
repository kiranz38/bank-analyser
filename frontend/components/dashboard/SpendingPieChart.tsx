'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface CategorySummary {
  category: string
  total: number
  percent: number
  transaction_count: number
  top_merchants: Array<{ name: string; total: number }>
}

interface SpendingPieChartProps {
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

const DEFAULT_COLORS = [
  '#8b5cf6', '#f97316', '#3b82f6', '#10b981', '#22c55e',
  '#ec4899', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444'
]

export default function SpendingPieChart({ categories }: SpendingPieChartProps) {
  if (!categories || categories.length === 0) {
    return null
  }

  // Filter out transfers and income, show all spending categories
  const spendingCategories = categories
    .filter(c => c.category !== 'Transfers' && c.category !== 'Income')

  const totalSpending = spendingCategories.reduce((sum, c) => sum + c.total, 0)

  const chartData = spendingCategories.map((cat, index) => ({
    name: cat.category,
    value: cat.total,
    percent: cat.percent,
    color: CATEGORY_COLORS[cat.category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percent: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="pie-tooltip">
          <p className="pie-tooltip-label">{data.name}</p>
          <p className="pie-tooltip-value">{formatCurrency(data.value)}</p>
          <p className="pie-tooltip-percent">{data.percent.toFixed(1)}% of spending</p>
        </div>
      )
    }
    return null
  }

  const renderLegend = () => (
    <ul className="pie-legend">
      {chartData.map((entry, index) => (
        <li key={index} className="pie-legend-item">
          <span className="pie-legend-dot" style={{ backgroundColor: entry.color }} />
          <span className="pie-legend-label">{entry.name}</span>
          <span className="pie-legend-value">{formatCurrency(entry.value)}</span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="dashboard-card spending-pie-card">
      <h3 className="dashboard-card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
        Spending Breakdown
      </h3>
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-center-label">
          <span className="pie-center-amount">{formatCurrency(totalSpending)}</span>
          <span className="pie-center-text">Total</span>
        </div>
      </div>
      {renderLegend()}
    </div>
  )
}
