'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart as PieChartIcon, RefreshCw, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface PieDataItem {
  name: string
  value: number
  color: string
}

interface OverviewRowProps {
  pieData: PieDataItem[]
  confirmedSubsCount: number
  confirmedSubsMonthly: number
  easyWinsCount: number
  easyWinsYearlySavings: number
  onShowSpending: () => void
  onShowSubscriptions: () => void
  onShowQuickWins: () => void
  formatCurrency: (amount: number) => string
  formatCurrencyPrecise: (amount: number) => string
}

export default function OverviewRow({
  pieData,
  confirmedSubsCount,
  confirmedSubsMonthly,
  easyWinsCount,
  easyWinsYearlySavings,
  onShowSpending,
  onShowSubscriptions,
  onShowQuickWins,
  formatCurrency,
  formatCurrencyPrecise,
}: OverviewRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Spending Breakdown */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PieChartIcon className="h-4 w-4" />
              Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-[120px]" id="pdf-chart-capture">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {pieData.slice(0, 4).map((cat, i) => (
                <span key={i} className="flex items-center gap-1 text-xs">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={onShowSpending}>
              View Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions */}
      {confirmedSubsCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4" />
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <span className="text-3xl font-bold">{confirmedSubsCount}</span>
              <p className="text-xs text-muted-foreground">detected</p>
            </div>
            <p className="text-center text-sm font-semibold">{formatCurrencyPrecise(confirmedSubsMonthly)}/mo</p>
            <Button variant="ghost" size="sm" className="w-full" onClick={onShowSubscriptions}>
              View Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins */}
      {easyWinsCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <span className="text-3xl font-bold">{easyWinsCount}</span>
              <p className="text-xs text-muted-foreground">actions</p>
            </div>
            <p className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Save {formatCurrency(easyWinsYearlySavings)}/yr
            </p>
            <Button variant="ghost" size="sm" className="w-full" onClick={onShowQuickWins}>
              View Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
