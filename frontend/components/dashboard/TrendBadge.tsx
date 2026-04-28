import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Delta } from './types'

interface TrendBadgeProps {
  delta: Delta
  inverse?: boolean // for metrics where down is good (e.g. monthly_leak)
  showAbsolute?: boolean
  formatValue?: (n: number) => string
}

export default function TrendBadge({ delta, inverse = false, showAbsolute, formatValue }: TrendBadgeProps) {
  const isPositive = inverse ? delta.direction === 'down' : delta.direction === 'up'
  const isNegative = inverse ? delta.direction === 'up' : delta.direction === 'down'
  const isFlat = delta.direction === 'flat'

  const colorClass = isFlat
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-destructive'

  const Icon = isFlat ? Minus : delta.direction === 'up' ? TrendingUp : TrendingDown

  const pct = Math.abs(delta.percent).toFixed(1)
  const label = showAbsolute && formatValue
    ? `${delta.direction === 'up' ? '+' : ''}${formatValue(delta.absolute)}`
    : `${delta.direction === 'up' ? '+' : ''}${pct}%`

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', colorClass)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
