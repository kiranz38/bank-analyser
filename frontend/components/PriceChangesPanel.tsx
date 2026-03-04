'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ArrowRight, Info } from 'lucide-react'

interface PriceChange {
  merchant: string
  old_price: number
  new_price: number
  increase: number
  percent_change: number
  first_date: string
  latest_date: string
  yearly_impact: number
}

interface PriceChangesPanelProps {
  priceChanges: PriceChange[]
}

export default function PriceChangesPanel({ priceChanges }: PriceChangesPanelProps) {
  if (!priceChanges || priceChanges.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const totalYearlyImpact = priceChanges.reduce((sum, pc) => sum + pc.yearly_impact, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Price Increases Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Some of your subscriptions have increased in price, costing you an extra{' '}
          <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(totalYearlyImpact)}/year</span>
        </p>

        <div className="space-y-3">
          {priceChanges.map((change, index) => (
            <div key={index} className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium">{change.merchant}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(change.first_date)} to {formatDate(change.latest_date)}
                </p>
              </div>
              <div className="shrink-0 space-y-1 text-right">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground line-through">{formatCurrency(change.old_price)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{formatCurrency(change.new_price)}</span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  +{formatCurrency(change.increase)}/mo (+{change.percent_change.toFixed(0)}%)
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Contact customer support to negotiate lower rates or switch to a cheaper tier.</span>
        </div>
      </CardContent>
    </Card>
  )
}
