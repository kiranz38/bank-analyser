'use client'

import { useEffect, useState } from 'react'

const LEAK_CARDS = [
  { label: 'Netflix (unused)', amount: '$15.99', textColor: 'text-red-400', dotColor: 'bg-red-400', delay: '0.4s' },
  { label: 'Gym membership', amount: '$54.00', textColor: 'text-orange-400', dotColor: 'bg-orange-400', delay: '1.1s' },
  { label: 'Annual fee charged', amount: '$99.00', textColor: 'text-red-300', dotColor: 'bg-red-300', delay: '1.9s' },
]

const STATEMENT_ROWS = [
  { date: 'Jun 1', desc: 'NETFLIX.COM', amount: '-$15.99' },
  { date: 'Jun 2', desc: 'SPOTIFY PREMIUM', amount: '-$10.99' },
  { date: 'Jun 3', desc: 'AMAZON PRIME', amount: '-$14.99' },
  { date: 'Jun 4', desc: 'ADOBE CC', amount: '-$54.99' },
  { date: 'Jun 5', desc: 'GYM MEMBERSHIP', amount: '-$54.00' },
  { date: 'Jun 6', desc: 'APPLE ICLOUD', amount: '-$2.99' },
  { date: 'Jun 8', desc: 'ANNUAL FEE', amount: '-$99.00' },
  { date: 'Jun 9', desc: 'HULU BUNDLE', amount: '-$17.99' },
]

export default function HeroScanner() {
  const [savings, setSavings] = useState(0)

  useEffect(() => {
    const target = 412
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const id = setInterval(() => {
      current = Math.min(current + increment, target)
      setSavings(Math.round(current))
      if (current >= target) clearInterval(id)
    }, duration / steps)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Statement card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-sm">
        {/* Card header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Bank Statement · June 2025
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
            Scanning…
          </span>
        </div>

        {/* Transaction rows */}
        <div className="space-y-2">
          {STATEMENT_ROWS.map((row) => (
            <div key={row.desc} className="flex items-center justify-between text-xs">
              <span className="text-slate-500 w-12 shrink-0">{row.date}</span>
              <span className="flex-1 truncate text-slate-300 px-2">{row.desc}</span>
              <span className="text-slate-400 font-mono">{row.amount}</span>
            </div>
          ))}
        </div>

        {/* Laser scan line */}
        <div className="scanner-laser" />
      </div>

      {/* Floating leak cards */}
      {LEAK_CARDS.map((card) => (
        <div
          key={card.label}
          className="leak-card absolute -right-4 flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/90 px-3 py-2 shadow-lg backdrop-blur-sm"
          style={{ animationDelay: card.delay, top: `${LEAK_CARDS.indexOf(card) * 36 + 30}%` }}
        >
          <span className={`h-2 w-2 rounded-full shrink-0 ${card.dotColor}`} />
          <span className="text-xs text-slate-300">{card.label}</span>
          <span className={`ml-1 text-xs font-bold ${card.textColor}`}>{card.amount}</span>
        </div>
      ))}

      {/* Savings counter at the bottom */}
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3">
        <span className="text-sm text-slate-400">Avg. leaks found:</span>
        <span className="text-xl font-extrabold tabular-nums text-emerald-400">
          ${savings}/mo
        </span>
      </div>
    </div>
  )
}
