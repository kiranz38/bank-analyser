import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, TrendingUp } from 'lucide-react'

interface SummaryStatsProps {
  monthlyLeak: number
  annualSavings: number
}

export default function SummaryStats({ monthlyLeak, annualSavings }: SummaryStatsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <DollarSign className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Leak</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(monthlyLeak)}</p>
            <p className="text-xs text-muted-foreground">potential savings per month</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Annual Savings</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(annualSavings)}</p>
            <p className="text-xs text-muted-foreground">if you address these leaks</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
