'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus, FileText, Loader2, TrendingDown, RefreshCw, Zap,
  Calendar, AlertTriangle, PartyPopper, ChevronDown, ChevronUp,
  BarChart2, Clock, ArrowRight, Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import TrendBadge from '@/components/dashboard/TrendBadge'
import SpendingTrendChart from '@/components/dashboard/SpendingTrendChart'
import CategoryComparison from '@/components/dashboard/CategoryComparison'
import {
  type DashboardAnalysis, safeResults, computeDelta, buildChartData,
} from '@/components/dashboard/types'

// ── helpers ────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return `$${Math.round(amount).toLocaleString()}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function parseAnalysis(raw: { id: string; title: string | null; createdAt: string; results: unknown }): DashboardAnalysis {
  return { ...raw, results: safeResults(raw.results) }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

// ── sub-components ─────────────────────────────────────────────────────────

/** Top-of-page hero leakage scoreboard */
function LeakageHero({ annual, monthly, subCount }: { annual: number; monthly: number; subCount: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm dark:border-amber-800/40 dark:from-amber-950/30 dark:to-orange-950/20">
      <p className="mb-1 text-sm font-medium text-amber-700 dark:text-amber-400">Annualised leakage detected</p>
      <p className="text-5xl font-extrabold tracking-tight text-amber-900 dark:text-amber-200">
        {fmt(annual)}<span className="ml-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">/year</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-amber-800 dark:text-amber-300">
        <span className="flex items-center gap-1.5">
          <TrendingDown className="h-4 w-4" />
          {fmt(monthly)}/month leaking
        </span>
        <span className="flex items-center gap-1.5">
          <RefreshCw className="h-4 w-4" />
          {subCount} subscriptions found
        </span>
      </div>
      {/* decorative pulse */}
      <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-amber-300/20 dark:bg-amber-500/10 blur-2xl" />
    </div>
  )
}

/** Last scan staleness pill */
function ScanStaleness({ createdAt }: { createdAt: string }) {
  const days = daysSince(createdAt)
  if (days < 14) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Last scan {days === 0 ? 'today' : `${days}d ago`}
      </span>
    )
  }
  if (days < 30) {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-400">
        <Clock className="h-3.5 w-3.5" />
        Scanned {days}d ago — upload a fresh statement
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-700/50 dark:bg-red-950/30 dark:text-red-400">
      <AlertTriangle className="h-3.5 w-3.5" />
      {days}d since last scan — your wallet is getting dusty
    </span>
  )
}

/** Hit list — top subscriptions to review */
function HitListCard({ subs }: { subs: { merchant: string; monthly_cost: number }[] }) {
  const top = [...subs].sort((a, b) => b.monthly_cost - a.monthly_cost).slice(0, 5)
  if (top.length === 0) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Flame className="h-4 w-4 text-red-500" />
          The Hit List — highest-cost subscriptions
        </CardTitle>
        <p className="text-xs text-muted-foreground">These are the biggest opportunities to recover cash.</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {top.map((sub, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {i + 1}
              </span>
              <span className="text-sm font-medium">{sub.merchant}</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-sm font-bold text-destructive">{fmt(sub.monthly_cost)}/mo</p>
                <p className="text-xs text-muted-foreground">{fmt(sub.monthly_cost * 12)}/yr</p>
              </div>
              <a
                href={`https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(sub.merchant)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Cancel <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function MetricBox({
  label, value, delta, inverseColor, icon: Icon,
}: {
  label: string
  value: string
  delta?: ReturnType<typeof computeDelta>
  inverseColor?: boolean
  icon: React.ElementType
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {delta && (
        <TrendBadge delta={delta} inverse={inverseColor} showAbsolute formatValue={fmt} />
      )}
      {!delta && <span className="text-xs text-muted-foreground">first analysis</span>}
    </div>
  )
}

function DeltaAlert({ leakDelta }: { leakDelta: ReturnType<typeof computeDelta> }) {
  if (!leakDelta || leakDelta.direction === 'flat') return null
  const isWorse = leakDelta.direction === 'up'
  const pct = Math.abs(leakDelta.percent).toFixed(1)
  const abs = fmt(Math.abs(leakDelta.absolute))

  if (Math.abs(leakDelta.percent) < 10) return null

  return (
    <div className={cn(
      'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
      isWorse
        ? 'border-destructive/30 bg-destructive/5 text-destructive dark:border-destructive/40 dark:bg-destructive/10'
        : 'border-emerald-300/50 bg-emerald-50/60 text-emerald-800 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300'
    )}>
      {isWorse
        ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        : <PartyPopper className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>
        {isWorse
          ? <>Your spending leak <strong>grew by {abs} (+{pct}%)</strong> since your last analysis. The category breakdown below shows where the increase came from.</>
          : <>Great progress — your spending leak <strong>dropped by {abs} (-{pct}%)</strong> since your last analysis. Keep it up.</>}
      </span>
    </div>
  )
}

function AnalysisHistoryCard({ analysis, index, previousAnalysis }: {
  analysis: DashboardAnalysis
  index: number
  previousAnalysis?: DashboardAnalysis
}) {
  const [expanded, setExpanded] = useState(false)
  const r = analysis.results

  const leakDelta = previousAnalysis
    ? computeDelta(r.monthly_leak ?? 0, previousAnalysis.results.monthly_leak ?? 0)
    : null

  const topWin = r.easy_wins?.[0]
  const topCat = r.category_summary
    ?.filter(c => c.category !== 'Income')
    .sort((a, b) => b.total - a.total)[0]

  return (
    <Card className={cn('overflow-hidden', index === 0 && 'ring-1 ring-primary/20')}>
      <CardContent className="p-0">
        <div className={cn(
          'flex items-center justify-between border-b px-4 py-2.5',
          index === 0 ? 'bg-primary/5' : 'bg-muted/20'
        )}>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{fmtDate(analysis.createdAt)}</span>
            {index === 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Latest</span>
            )}
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'less' : 'details'}
          </button>
        </div>

        <div className="grid grid-cols-3 divide-x">
          <div className="px-4 py-3 text-center">
            <TrendingDown className="mx-auto mb-1 h-3.5 w-3.5 text-destructive" />
            <p className="text-xs text-muted-foreground">Monthly leak</p>
            <p className="text-base font-bold text-destructive">{fmt(r.monthly_leak ?? 0)}</p>
            {leakDelta && <TrendBadge delta={leakDelta} inverse />}
          </div>
          <div className="px-4 py-3 text-center">
            <Zap className="mx-auto mb-1 h-3.5 w-3.5 text-emerald-500" />
            <p className="text-xs text-muted-foreground">Savings potential</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {fmt(r.annual_savings ?? 0)}/yr
            </p>
          </div>
          <div className="px-4 py-3 text-center">
            <RefreshCw className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Subscriptions</p>
            <p className="text-base font-bold">{r.subscriptions?.length ?? 0}</p>
          </div>
        </div>

        {(topCat || topWin) && (
          <div className="space-y-0.5 border-t bg-muted/10 px-4 py-2.5 text-xs text-muted-foreground">
            {topCat && (
              <p>Biggest category: <span className="font-medium text-foreground">{topCat.category}</span> ({fmt(topCat.total)}/mo)</p>
            )}
            {topWin && (
              <p>Top win: <span className="font-medium text-foreground">{topWin.title}</span> — saves {fmt(topWin.estimated_yearly_savings)}/yr</p>
            )}
          </div>
        )}

        {expanded && (
          <div className="border-t px-4 py-3 space-y-4">
            {(r.category_summary?.filter(c => c.category !== 'Income').length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spending by Category</p>
                {r.category_summary!
                  .filter(c => c.category !== 'Income')
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 6)
                  .map(cat => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <span>{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{cat.transaction_count} txns</span>
                        <span className="font-medium">{fmt(cat.total)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {(r.subscriptions?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subscriptions</p>
                {r.subscriptions!.slice(0, 5).map((sub, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{sub.merchant}</span>
                    <span className="font-medium text-destructive">{fmt(sub.monthly_cost)}/mo</span>
                  </div>
                ))}
                {(r.subscriptions?.length ?? 0) > 5 && (
                  <p className="text-xs text-muted-foreground">+{r.subscriptions!.length - 5} more</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── main page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { status, data: session } = useSession()
  const [rawAnalyses, setRawAnalyses] = useState<DashboardAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { setLoading(false); return }
    if (status !== 'authenticated') return

    fetch('/api/analyses')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load analyses')
        return r.json()
      })
      .then(data => {
        const parsed = (data.analyses ?? []).map(parseAnalysis)
        setRawAnalyses(parsed)
      })
      .catch(() => setError('Could not load your analyses. Please refresh.'))
      .finally(() => setLoading(false))
  }, [status])

  const analyses = useMemo(
    () => [...rawAnalyses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [rawAnalyses]
  )

  const latest = analyses[0] ?? null
  const previous = analyses[1] ?? null
  const hasComparison = analyses.length >= 2
  const chartData = useMemo(() => buildChartData(analyses), [analyses])

  const leakDelta = hasComparison
    ? computeDelta(latest.results.monthly_leak ?? 0, previous.results.monthly_leak ?? 0)
    : null
  const subsDelta = hasComparison
    ? computeDelta(latest.results.subscriptions?.length ?? 0, previous.results.subscriptions?.length ?? 0)
    : null
  const savingsDelta = hasComparison
    ? computeDelta(latest.results.annual_savings ?? 0, previous.results.annual_savings ?? 0)
    : null

  const firstName = session?.user?.name?.split(' ')[0] ?? null

  // ── not logged in ──────────────────────────────────────────────────────

  if (status === 'unauthenticated') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <h1 className="mb-2 text-xl font-semibold">Sign in to view your dashboard</h1>
        <p className="mb-6 text-sm text-muted-foreground">Your past analyses are saved to your account automatically.</p>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </main>
    )
  }

  // ── loading ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading your analyses...</p>
      </main>
    )
  }

  // ── error ──────────────────────────────────────────────────────────────

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
      </main>
    )
  }

  // ── empty state — "The $500 Promise" ──────────────────────────────────

  if (analyses.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-muted-foreground">{greeting()}{firstName ? `, ${firstName}` : ''}</p>
            <h1 className="text-2xl font-bold tracking-tight">Your Dashboard</h1>
          </div>
        </div>

        {/* The $500 Promise empty state */}
        <div className="rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/50 dark:border-cyan-800/40 dark:bg-cyan-950/10 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 dark:bg-cyan-900/40">
            <TrendingDown className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Find your hidden money leaks
          </h2>
          <p className="mb-6 max-w-md mx-auto text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The average Leaky Wallet user discovers{' '}
            <strong className="text-cyan-700 dark:text-cyan-400">$480 in hidden subscriptions</strong>{' '}
            in their first scan. Drop your latest bank statement to find yours.
          </p>

          {/* Blurred teaser leaks */}
          <div className="mb-6 mx-auto max-w-xs space-y-2">
            {[
              { label: 'Gym membership you forgot', amount: '$65/mo' },
              { label: 'Free trial that auto-renewed', amount: '$19/mo' },
              { label: 'Duplicate streaming service', amount: '$15/mo' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm blur-[3px] select-none dark:border-slate-700 dark:bg-slate-800">
                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className="font-bold text-red-500">{item.amount}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">↑ Example leaks — yours will look like this</p>
          </div>

          <Button size="lg" asChild className="text-white" style={{ background: '#0284C7' }}>
            <Link href="/?start=upload">
              <Plus className="mr-2 h-4 w-4" />
              Scan My Bank Statement
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">Free · No login required to scan · Results saved here automatically</p>
        </div>
      </main>
    )
  }

  // ── single analysis ────────────────────────────────────────────────────

  if (analyses.length === 1 && latest) {
    const r = latest.results
    const subs = r.subscriptions ?? []

    return (
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {greeting()}{firstName ? `, ${firstName}` : ''} · <ScanStaleness createdAt={latest.createdAt} />
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Your Dashboard</h1>
          </div>
          <Button asChild style={{ background: '#0284C7' }} className="text-white">
            <Link href="/?start=upload"><Plus className="mr-2 h-4 w-4" />New Analysis</Link>
          </Button>
        </div>

        {/* Hero stat */}
        <LeakageHero
          annual={r.annual_savings ?? 0}
          monthly={r.monthly_leak ?? 0}
          subCount={subs.length}
        />

        {/* Hit list */}
        <HitListCard subs={subs} />

        {/* Metric tiles */}
        <div className="grid grid-cols-3 gap-3">
          <MetricBox label="Monthly Leak" value={fmt(r.monthly_leak ?? 0)} icon={TrendingDown} inverseColor />
          <MetricBox label="Annual Savings" value={`${fmt(r.annual_savings ?? 0)}/yr`} icon={Zap} />
          <MetricBox label="Subscriptions" value={String(subs.length)} icon={RefreshCw} />
        </div>

        {/* Nudge to scan again */}
        <div className="rounded-xl border border-dashed bg-muted/20 px-5 py-6 text-center space-y-2">
          <BarChart2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">Scan again next month to unlock trend tracking</p>
          <p className="text-xs text-muted-foreground">Once you have two analyses, you'll see month-over-month comparisons, a spending trend chart, and alerts when your spending changes.</p>
          <Button asChild size="sm" className="mt-2">
            <Link href="/?start=upload">Run Another Analysis</Link>
          </Button>
        </div>

        <AnalysisHistoryCard analysis={latest} index={0} />
      </main>
    )
  }

  // ── full dashboard — 2+ analyses ───────────────────────────────────────

  const latestSubs = latest?.results.subscriptions ?? []

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            {greeting()}{firstName ? `, ${firstName}` : ''} · <ScanStaleness createdAt={latest.createdAt} />
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Your Dashboard</h1>
        </div>
        <Button asChild style={{ background: '#0284C7' }} className="text-white">
          <Link href="/?start=upload"><Plus className="mr-2 h-4 w-4" />New Analysis</Link>
        </Button>
      </div>

      {/* Delta alert */}
      <DeltaAlert leakDelta={leakDelta} />

      {/* Hero leakage scoreboard */}
      <LeakageHero
        annual={latest.results.annual_savings ?? 0}
        monthly={latest.results.monthly_leak ?? 0}
        subCount={latestSubs.length}
      />

      {/* Hit list */}
      <HitListCard subs={latestSubs} />

      {/* Trend metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricBox
          label="Monthly Leak"
          value={fmt(latest.results.monthly_leak ?? 0)}
          delta={leakDelta ?? undefined}
          inverseColor
          icon={TrendingDown}
        />
        <MetricBox
          label="Subscriptions"
          value={String(latest.results.subscriptions?.length ?? 0)}
          delta={subsDelta ?? undefined}
          inverseColor
          icon={RefreshCw}
        />
        <MetricBox
          label="Annual Savings"
          value={`${fmt(latest.results.annual_savings ?? 0)}/yr`}
          delta={savingsDelta ?? undefined}
          icon={Zap}
        />
      </div>

      {/* Spending trend chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <BarChart2 className="h-4 w-4" />
            Spending Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <SpendingTrendChart data={chartData} />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Dashed line shows your average monthly leak of {fmt(chartData.reduce((s, d) => s + d.monthlyLeak, 0) / chartData.length)}
          </p>
        </CardContent>
      </Card>

      {/* Category comparison */}
      {latest && previous && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-semibold">
              <span>Category Comparison</span>
              <span className="text-xs font-normal text-muted-foreground">
                {fmtDate(previous.createdAt)} → {fmtDate(latest.createdAt)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryComparison latest={latest} previous={previous} />
          </CardContent>
        </Card>
      )}

      {/* Analysis history */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Analysis History</h2>
        {analyses.map((analysis, i) => (
          <AnalysisHistoryCard
            key={analysis.id}
            analysis={analysis}
            index={i}
            previousAnalysis={analyses[i + 1]}
          />
        ))}
      </div>
    </main>
  )
}
