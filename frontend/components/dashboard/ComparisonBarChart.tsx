'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

interface MonthComparisonData {
  previous_month: string
  current_month: string
  previous_total: number
  current_total: number
  total_change: number
  total_change_percent: number
  top_changes: Array<{
    category: string
    previous: number
    current: number
    change: number
    change_percent: number
  }>
  spikes: Array<{
    category: string
    previous: number
    current: number
    change: number
    change_percent: number
  }>
  months_analyzed: number
}

interface ComparisonBarChartProps {
  comparison: MonthComparisonData | null
}

export default function ComparisonBarChart({ comparison }: ComparisonBarChartProps) {
  if (!comparison) {
    return null
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const chartData = [
    {
      name: formatMonth(comparison.previous_month),
      amount: comparison.previous_total,
      fill: '#94a3b8'
    },
    {
      name: formatMonth(comparison.current_month),
      amount: comparison.current_total,
      fill: comparison.total_change > 0 ? '#f97316' : '#10b981'
    }
  ]

  const isSpendingUp = comparison.total_change > 0

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; amount: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bar-tooltip">
          <p className="bar-tooltip-label">{data.name}</p>
          <p className="bar-tooltip-value">{formatCurrency(data.amount)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="dashboard-card comparison-bar-card">
      <h3 className="dashboard-card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Month Comparison
      </h3>

      <div className="bar-chart-container">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barGap={8}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
            />
            <YAxis
              hide
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="amount"
              radius={[6, 6, 0, 0]}
              maxBarSize={80}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`comparison-change-badge ${isSpendingUp ? 'up' : 'down'}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isSpendingUp ? (
            <polyline points="18 15 12 9 6 15" />
          ) : (
            <polyline points="6 9 12 15 18 9" />
          )}
        </svg>
        <span>
          {isSpendingUp ? '+' : ''}{formatCurrency(comparison.total_change)}
          <span className="comparison-percent">
            ({comparison.total_change_percent > 0 ? '+' : ''}{comparison.total_change_percent.toFixed(0)}%)
          </span>
        </span>
      </div>

      {comparison.spikes && comparison.spikes.length > 0 && (
        <div className="comparison-spikes-compact">
          <span className="spike-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            Spikes:
          </span>
          {comparison.spikes.slice(0, 2).map((spike, idx) => (
            <span key={idx} className="spike-tag">
              {spike.category} +{spike.change_percent.toFixed(0)}%
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
