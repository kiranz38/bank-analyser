import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardAnalysis } from './types'

interface CategoryComparisonProps {
  latest: DashboardAnalysis
  previous: DashboardAnalysis
}

function formatCurrency(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

export default function CategoryComparison({ latest, previous }: CategoryComparisonProps) {
  const latestCats = latest.results.category_summary ?? []
  const prevCats = previous.results.category_summary ?? []

  if (!latestCats.length) return null

  // Build a unified category list from the latest analysis
  const rows = latestCats
    .filter(c => c.category !== 'Income')
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map(cat => {
      const prev = prevCats.find(p => p.category === cat.category)
      const prevTotal = prev?.total ?? 0
      const delta = cat.total - prevTotal
      const pct = prevTotal > 0 ? (delta / prevTotal) * 100 : 0
      return { category: cat.category, current: cat.total, previous: prevTotal, delta, pct }
    })

  if (!rows.length) return null

  return (
    <div className="space-y-2">
      {rows.map(row => {
        const isNew = row.previous === 0
        const isGone = row.current === 0
        const dir = isNew || isGone || Math.abs(row.pct) < 1 ? 'flat' : row.delta > 0 ? 'up' : 'down'
        const barWidth = Math.min(100, (row.current / (rows[0].current || 1)) * 100)

        return (
          <div key={row.category} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{row.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">{formatCurrency(row.current)}</span>
                {!isNew && dir !== 'flat' && (
                  <span className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    dir === 'up' ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                  )}>
                    {dir === 'up'
                      ? <TrendingUp className="h-3 w-3" />
                      : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(row.pct).toFixed(0)}%
                  </span>
                )}
                {isNew && <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">new</span>}
                {dir === 'flat' && !isNew && <Minus className="h-3 w-3 text-muted-foreground" />}
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  dir === 'up' ? 'bg-destructive/70' : dir === 'down' ? 'bg-emerald-500/70' : 'bg-primary/50'
                )}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
