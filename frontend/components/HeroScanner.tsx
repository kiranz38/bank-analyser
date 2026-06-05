'use client'

import { useEffect, useState } from 'react'

const LEAK_CARDS = [
  { label: 'Netflix (unused)', amount: '$15.99', textColor: 'text-red-500', dotColor: 'bg-red-400', delay: '0.4s' },
  { label: 'Gym membership', amount: '$54.00', textColor: 'text-orange-500', dotColor: 'bg-orange-400', delay: '1.1s' },
  { label: 'Annual fee charged', amount: '$99.00', textColor: 'text-red-500', dotColor: 'bg-red-300', delay: '1.9s' },
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
      {/* Statement card — light, clean, clinical */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">

        {/* Card header */}
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Bank Statement · June 2025
          </span>
          <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-600 border border-cyan-100">
            Scanning…
          </span>
        </div>

        {/* Privacy badge — baked into the UI itself */}
        <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5">
          <svg className="h-3 w-3 shrink-0 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-[10px] font-medium text-slate-500">
            Processed locally · never uploaded · auto-cleared on close
          </span>
        </div>

        {/* Transaction rows */}
        <div className="space-y-2.5">
          {STATEMENT_ROWS.map((row) => (
            <div key={row.desc} className="flex items-center justify-between text-xs">
              <span className="text-slate-400 w-12 shrink-0 tabular-nums">{row.date}</span>
              <span className="flex-1 truncate text-slate-600 px-2">{row.desc}</span>
              <span className="text-slate-500 font-mono tabular-nums">{row.amount}</span>
            </div>
          ))}
        </div>

        {/* Laser scan line */}
        <div className="scanner-laser" />

        {/* Floating leak cards — inside the card, staggered pop-in */}
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
          {LEAK_CARDS.map((card) => (
            <div
              key={card.label}
              className="leak-card flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-md"
              style={{ animationDelay: card.delay }}
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${card.dotColor}`} />
              <span className="text-xs text-slate-600">{card.label}</span>
              <span className={`ml-auto text-xs font-bold ${card.textColor}`}>{card.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Savings counter */}
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-3">
        <svg className="h-4 w-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-sm text-slate-500">Avg. leaks found:</span>
        <span className="text-xl font-extrabold tabular-nums text-cyan-700">
          ${savings}/mo
        </span>
      </div>
    </div>
  )
}
