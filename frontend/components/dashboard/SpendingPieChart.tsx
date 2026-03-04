'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart as PieChartIcon } from 'lucide-react'

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
  if (!categories || categories.length === 0) return null

  const spendingCategories = categories.filter(c => c.category !== 'Transfers' && c.category !== 'Income')
  const totalSpending = spendingCategories.reduce((sum, c) => sum + c.total, 0)

  const chartData = spendingCategories.map((cat, index) => ({
    name: cat.category,
    value: cat.total,
    percent: cat.percent,
    color: CATEGORY_COLORS[cat.category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percent: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-muted-foreground">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">{data.percent.toFixed(1)}% of spending</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChartIcon className="h-4 w-4" />
          Spending Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold">{formatCurrency(totalSpending)}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>

        {/* Legend */}
        <ul className="space-y-1.5">
          {chartData.map((entry, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
