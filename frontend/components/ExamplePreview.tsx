'use client'

import { Eye, Info, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const categories = [
  { name: 'Food Delivery', amount: 156, pct: 45, color: 'bg-orange-400' },
  { name: 'Subscriptions', amount: 89, pct: 26, color: 'bg-purple-500' },
  { name: 'Shopping', amount: 60, pct: 17, color: 'bg-blue-400' },
  { name: 'Fees & Charges', amount: 42, pct: 12, color: 'bg-red-400' },
]

const subscriptions = [
  { name: 'Netflix', amount: '$15.99', emoji: '📺' },
  { name: 'Spotify', amount: '$12.99', emoji: '🎵' },
  { name: 'Gym', amount: '$49.99', emoji: '💪' },
  { name: 'Adobe', amount: '$29.99', emoji: '🎨' },
]

const easyWins = [
  'Cancel unused gym membership — save $49.99/mo',
  'Switch to cheaper streaming bundle — save $28/mo',
]

export default function ExamplePreview() {
  return (
    <div className="overflow-hidden rounded-xl border shadow-lg">
      {/* Gradient header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-700 to-emerald-500 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Eye className="h-4 w-4 opacity-80" />
          <span className="text-sm font-semibold">Sample Analysis</span>
        </div>
        <Badge className="border-white/30 bg-white/20 text-white hover:bg-white/20">
          Preview
        </Badge>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 divide-x bg-card">
        <div className="px-4 py-4 text-center">
          <div className="mb-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-destructive" />
            Monthly Leak
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-destructive">$347</p>
          <p className="mt-0.5 text-xs text-muted-foreground">across 4 categories</p>
        </div>
        <div className="px-4 py-4 text-center">
          <div className="mb-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            Annual Savings
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">$4,164</p>
          <p className="mt-0.5 text-xs text-muted-foreground">if you act now</p>
        </div>
      </div>

      {/* Spending bars */}
      <div className="border-t px-4 py-3">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Spending Breakdown
        </p>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">{cat.name}</span>
                <span className="tabular-nums text-muted-foreground">${cat.amount}/mo</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${cat.color}`}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions detected */}
      <div className="border-t px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Subscriptions Detected
        </p>
        <div className="flex flex-wrap gap-1.5">
          {subscriptions.map((sub) => (
            <span
              key={sub.name}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
            >
              {sub.emoji} {sub.name}
              <span className="text-muted-foreground">{sub.amount}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Easy wins */}
      <div className="border-t px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Wins
        </p>
        <ul className="space-y-1">
          {easyWins.map((win) => (
            <li key={win} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 text-emerald-500">✓</span>
              {win}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5">
        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Sample data — upload your statement to see your real numbers
        </p>
      </div>
    </div>
  )
}
