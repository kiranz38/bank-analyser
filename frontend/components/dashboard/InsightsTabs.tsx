'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trackAlternativeClicked } from '@/lib/analytics'

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

interface DuplicateSubscription {
  category: string
  services: string[]
  count: number
  combined_monthly: number
  combined_yearly: number
  suggestion: string
}

interface Alternative {
  original: string
  alternative: string
  current_price: number
  alternative_price: number
  monthly_savings: number
  yearly_savings: number
  note: string
  category: string
}

interface TopSpending {
  date: string
  merchant: string
  amount: number
  category?: string
}

interface InsightsTabsProps {
  priceChanges?: PriceChange[]
  duplicates?: DuplicateSubscription[]
  alternatives?: Alternative[]
  topSpending?: TopSpending[]
}

type TabType = 'prices' | 'duplicates' | 'alternatives' | 'transactions'

export default function InsightsTabs({
  priceChanges = [],
  duplicates = [],
  alternatives = [],
  topSpending = []
}: InsightsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('prices')

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  const formatCurrencyPrecise = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

  const tabs = [
    { id: 'prices' as TabType, label: 'Price Changes', count: priceChanges.length },
    { id: 'duplicates' as TabType, label: 'Duplicates', count: duplicates.length },
    { id: 'alternatives' as TabType, label: 'Alternatives', count: alternatives.length },
    { id: 'transactions' as TabType, label: 'Top Transactions', count: topSpending.length },
  ]

  const activeTabs = tabs.filter(tab => tab.count > 0)

  useEffect(() => {
    const currentTabHasData = tabs.find(t => t.id === activeTab)?.count ?? 0 > 0
    if (!currentTabHasData && activeTabs.length > 0) {
      setActiveTab(activeTabs[0].id)
    }
  }, [priceChanges.length, duplicates.length, alternatives.length, topSpending.length])

  if (activeTabs.length === 0) return null

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          {activeTabs.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              {tab.label}
              <Badge variant="secondary" className="ml-1.5 text-xs">{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <CardContent className="pt-4">
          {/* Price Changes */}
          <TabsContent value="prices" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">Some subscriptions have increased in price</p>
            <ul className="space-y-2">
              {priceChanges.slice(0, 4).map((change, index) => (
                <li key={index} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                  <div>
                    <p className="font-medium">{change.merchant}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrencyPrecise(change.old_price)} → {formatCurrencyPrecise(change.new_price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-destructive">
                    +{formatCurrencyPrecise(change.increase)}/mo
                  </span>
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* Duplicates */}
          <TabsContent value="duplicates" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">You have overlapping subscriptions in these categories</p>
            <ul className="space-y-2">
              {duplicates.slice(0, 4).map((dup, index) => (
                <li key={index} className="rounded-md border p-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dup.category}</span>
                    <Badge variant="secondary">{dup.count} services</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dup.services.slice(0, 3).join(', ')} — {formatCurrency(dup.combined_monthly)}/mo
                  </p>
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* Alternatives */}
          <TabsContent value="alternatives" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">Cheaper or free alternatives to your current subscriptions</p>
            <ul className="space-y-2">
              {alternatives.slice(0, 4).map((alt, index) => (
                <li
                  key={index}
                  className="cursor-pointer rounded-md border p-2.5 text-sm transition-colors hover:bg-accent"
                  onClick={() => trackAlternativeClicked({
                    original: alt.original,
                    alternative: alt.alternative,
                    potentialSavings: alt.yearly_savings
                  })}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {alt.original} → {alt.alternative}
                      {alt.alternative_price === 0 && (
                        <Badge className="ml-1.5 bg-emerald-500 text-xs">FREE</Badge>
                      )}
                    </span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Save {formatCurrency(alt.yearly_savings)}/yr
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{alt.note}</p>
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* Top Transactions */}
          <TabsContent value="transactions" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">Your biggest transactions this period</p>
            <ul className="space-y-2">
              {topSpending.slice(0, 5).map((item, index) => (
                <li key={index} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
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
                </li>
              ))}
            </ul>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
