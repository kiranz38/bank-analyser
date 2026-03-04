import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, ArrowRight, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryChange {
  category: string
  previous: number
  current: number
  change: number
  change_percent: number
}

interface MonthComparisonData {
  previous_month: string
  current_month: string
  previous_total: number
  current_total: number
  total_change: number
  total_change_percent: number
  top_changes: CategoryChange[]
  spikes: CategoryChange[]
  months_analyzed: number
}

interface MonthComparisonProps {
  comparison: MonthComparisonData | null
}

export default function MonthComparison({ comparison }: MonthComparisonProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (!comparison) {
    return null
  }

  const isSpendingUp = comparison.total_change > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Month-over-Month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary comparison */}
        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{formatMonth(comparison.previous_month)}</p>
            <p className="text-lg font-bold">{formatCurrency(comparison.previous_total)}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{formatMonth(comparison.current_month)}</p>
            <p className="text-lg font-bold">{formatCurrency(comparison.current_total)}</p>
          </div>
          <Badge
            variant={isSpendingUp ? 'destructive' : 'default'}
            className="flex items-center gap-1"
          >
            {isSpendingUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isSpendingUp ? '+' : ''}{formatCurrency(comparison.total_change)}
            ({comparison.total_change_percent > 0 ? '+' : ''}{comparison.total_change_percent.toFixed(1)}%)
          </Badge>
        </div>

        {/* Spending spikes */}
        {comparison.spikes && comparison.spikes.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Spending Spikes Detected
            </div>
            <ul className="space-y-1">
              {comparison.spikes.map((spike, index) => (
                <li key={index} className="flex items-center justify-between text-sm">
                  <span className="text-amber-800 dark:text-amber-300">{spike.category}</span>
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    +{formatCurrency(spike.change)} (+{spike.change_percent.toFixed(0)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top changes */}
        {comparison.top_changes && comparison.top_changes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Category Changes</h3>
            <ul className="space-y-2">
              {comparison.top_changes.slice(0, 5).map((change, index) => {
                const isUp = change.change > 0
                return (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <span>{change.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatCurrency(change.previous)}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{formatCurrency(change.current)}</span>
                      <span className={cn(
                        'text-xs font-medium',
                        isUp ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                      )}>
                        {isUp ? '+' : ''}{formatCurrency(change.change)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Based on {comparison.months_analyzed} months of data
        </p>
      </CardContent>
    </Card>
  )
}
