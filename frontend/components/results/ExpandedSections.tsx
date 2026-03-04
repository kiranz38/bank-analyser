'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { BarChart3, FileText, ChevronUp, ChevronDown, TrendingUp } from 'lucide-react'
import type { Leak, TopSpending, PriceChange } from '@/lib/types'

interface CategoryTotal {
  category: string
  leaks: Leak[]
  monthlyTotal: number
  yearlyTotal: number
}

interface ExpandedSectionsProps {
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
  categoryTotals: CategoryTotal[]
  recoveryPlan: string[]
  topSpending?: TopSpending[]
  priceChanges?: PriceChange[]
  formatCurrency: (amount: number) => string
  formatCurrencyPrecise: (amount: number) => string
}

export default function ExpandedSections({
  expandedSections,
  toggleSection,
  categoryTotals,
  recoveryPlan,
  topSpending,
  priceChanges,
  formatCurrency,
  formatCurrencyPrecise,
}: ExpandedSectionsProps) {
  return (
    <>
      {/* Expanded Leaks */}
      {expandedSections.leaks && categoryTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Spending Leaks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryTotals.map(({ category, leaks, monthlyTotal }) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{category}</span>
                  <span className="text-sm font-medium text-destructive">{formatCurrencyPrecise(monthlyTotal)}/mo</span>
                </div>
                <ul className="space-y-1.5">
                  {leaks.map((leak, index) => (
                    <li key={index} className="flex items-start justify-between gap-3 rounded-md bg-muted/30 p-2.5 text-sm">
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-medium">{leak.merchant}</p>
                        <p className="text-xs text-muted-foreground">{leak.explanation}</p>
                        {(leak.date || leak.last_date) && (
                          <p className="text-xs text-muted-foreground">Last charged: {leak.date || leak.last_date}</p>
                        )}
                      </div>
                      <span className="shrink-0 font-medium">{formatCurrencyPrecise(Number(leak.monthly_cost) || 0)}/mo</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Expanded Recovery Plan */}
      {expandedSections.recovery && recoveryPlan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Full Recovery Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {recoveryPlan.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="shrink-0 font-semibold text-muted-foreground">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Top Transactions */}
      {topSpending && topSpending.length > 0 && (
        <Collapsible open={expandedSections.transactions} onOpenChange={() => toggleSection('transactions')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Transactions
                </CardTitle>
                {expandedSections.transactions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2">
                {topSpending.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{item.merchant}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrencyPrecise(item.amount)}</p>
                      {item.date && <p className="text-xs text-muted-foreground">{item.date}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
            {!expandedSections.transactions && (
              <CardContent className="flex flex-wrap gap-2 pt-0">
                {topSpending.slice(0, 3).map((t, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {t.merchant}: {formatCurrencyPrecise(t.amount)}
                  </Badge>
                ))}
              </CardContent>
            )}
          </Card>
        </Collapsible>
      )}

      {/* Price Changes */}
      {priceChanges && priceChanges.length > 0 && (
        <Collapsible open={expandedSections.prices} onOpenChange={() => toggleSection('prices')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Price Increases ({priceChanges.length})
                </CardTitle>
                {expandedSections.prices ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2">
                {priceChanges.map((change, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                    <div>
                      <p className="font-medium">{change.merchant}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrencyPrecise(change.old_price)} → {formatCurrencyPrecise(change.new_price)}/mo
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-destructive">+{formatCurrencyPrecise(change.increase)}/mo</p>
                      <p className="text-xs text-muted-foreground">
                        ({change.percent_change > 0 ? '+' : ''}{change.percent_change.toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </>
  )
}
