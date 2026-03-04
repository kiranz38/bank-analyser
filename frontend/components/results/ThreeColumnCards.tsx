'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import type { EasyWin, Leak } from '@/lib/types'

interface CategoryTotal {
  category: string
  leaks: Leak[]
  monthlyTotal: number
  yearlyTotal: number
}

interface ThreeColumnCardsProps {
  easyWins: EasyWin[]
  categoryTotals: CategoryTotal[]
  recoveryPlan: string[]
  onToggleSection: (section: string) => void
  onShowQuickWins: () => void
  formatCurrency: (amount: number) => string
  formatCurrencyPrecise: (amount: number) => string
}

export default function ThreeColumnCards({
  easyWins,
  categoryTotals,
  recoveryPlan,
  onToggleSection,
  onShowQuickWins,
  formatCurrency,
  formatCurrencyPrecise,
}: ThreeColumnCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Easy Wins */}
      {easyWins.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4" />
              Easy Wins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {easyWins.slice(0, 4).map((win, index) => (
              <div key={index} className="space-y-0.5">
                <p className="text-sm font-medium">{win.title}</p>
                <p className="text-xs text-muted-foreground">{win.action}</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Save {formatCurrency(win.estimated_yearly_savings)}/yr
                </p>
              </div>
            ))}
            {easyWins.length > 4 && (
              <Button variant="ghost" size="sm" className="w-full" onClick={onShowQuickWins}>
                +{easyWins.length - 4} more
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spending Leaks */}
      {categoryTotals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Spending Leaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryTotals.slice(0, 4).map(({ category, monthlyTotal, leaks }) => (
              <div key={category} className="space-y-0.5">
                <p className="text-sm font-medium">{category}</p>
                <p className="text-xs text-muted-foreground">{leaks.length} item{leaks.length > 1 ? 's' : ''}</p>
                <p className="text-xs font-medium text-destructive">{formatCurrencyPrecise(monthlyTotal)}/mo</p>
              </div>
            ))}
            {categoryTotals.length > 4 && (
              <Button variant="ghost" size="sm" className="w-full" onClick={() => onToggleSection('leaks')}>
                +{categoryTotals.length - 4} more categories
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recovery Plan */}
      {recoveryPlan.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Recovery Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {recoveryPlan.slice(0, 5).map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="shrink-0 font-semibold text-muted-foreground">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {recoveryPlan.length > 5 && (
              <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => onToggleSection('recovery')}>
                +{recoveryPlan.length - 5} more steps
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
