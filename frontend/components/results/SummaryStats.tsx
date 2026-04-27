import { TrendingDown, TrendingUp } from 'lucide-react'

interface SummaryStatsProps {
  monthlyLeak: number
  annualSavings: number
}

export default function SummaryStats({ monthlyLeak, annualSavings }: SummaryStatsProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      {/* Emotional headline */}
      <div className="bg-gradient-to-br from-red-50 via-background to-emerald-50/60 px-6 py-7 text-center dark:from-red-950/20 dark:via-background dark:to-emerald-950/20">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Analysis Complete
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          You may be leaking{' '}
          <span className="text-destructive">{fmt(monthlyLeak)}/month</span>
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          That&apos;s an estimated{' '}
          <strong className="font-bold text-emerald-600 dark:text-emerald-400">
            {fmt(annualSavings)}/year
          </strong>{' '}
          you could keep — here&apos;s exactly where it&apos;s going.
        </p>
      </div>

      {/* Quick-glance stat row */}
      <div className="grid grid-cols-2 divide-x border-t bg-card">
        <div className="px-6 py-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            Monthly Leak
          </div>
          <p className="text-2xl font-bold text-destructive">{fmt(monthlyLeak)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">estimated per month</p>
        </div>
        <div className="px-6 py-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Potential Savings
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(annualSavings)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">if you act on this</p>
        </div>
      </div>
    </div>
  )
}
