'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react'

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
  if (!comparison) return null

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
    { name: formatMonth(comparison.previous_month), amount: comparison.previous_total, fill: '#94a3b8' },
    { name: formatMonth(comparison.current_month), amount: comparison.current_total, fill: comparison.total_change > 0 ? '#f97316' : '#10b981' },
  ]

  const isSpendingUp = comparison.total_change > 0

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; amount: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-muted-foreground">{formatCurrency(data.amount)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Month Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center">
          <Badge variant={isSpendingUp ? 'destructive' : 'default'} className="gap-1">
            {isSpendingUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isSpendingUp ? '+' : ''}{formatCurrency(comparison.total_change)}
            ({comparison.total_change_percent > 0 ? '+' : ''}{comparison.total_change_percent.toFixed(0)}%)
          </Badge>
        </div>

        {comparison.spikes && comparison.spikes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              Spikes:
            </span>
            {comparison.spikes.slice(0, 2).map((spike, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {spike.category} +{spike.change_percent.toFixed(0)}%
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
