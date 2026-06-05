'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Activity, Users, TrendingUp, DollarSign, Globe, Cpu,
  BarChart2, AlertCircle, RefreshCw, Lock, Brain, CheckCircle, XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ── colour palettes ────────────────────────────────────────────────────────

const CHART_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#fb923c']
const GRADIENT_PINK = '#f43f5e'
const GRADIENT_INDIGO = '#6366f1'

// ── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined, prefix = '$') {
  if (n == null) return '—'
  return `${prefix}${Math.round(n).toLocaleString()}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
}

// ── types ─────────────────────────────────────────────────────────────────

interface Summary {
  total_analyses: number
  avg_monthly_leak: number
  max_monthly_leak: number
  total_savings_identified: number
  avg_subscriptions: number
  overdraft_pct: number
  avg_health_score: number
  countries_seen: number
  bank_formats_seen: number
}

interface DailyTrend {
  rollup_date: string
  analyses_count: number
  avg_monthly_leak: number
  median_monthly_leak: number
  total_savings_found: number
  avg_subscription_count: number
  overdraft_rate: number
  avg_health_score: number
}

interface BankRow { bank_format: string; count: number; avg_leak: number }
interface CountryRow { country: string; count: number; avg_leak: number; avg_health_score: number }
interface CategoryRow { category: string; total: number }
interface AIRow { provider: string; count: number; pct: number }
interface LeakBucket { bucket: string; count: number }

interface Dashboard {
  period_days: number
  generated_at: string
  summary: Summary
  daily_trend: DailyTrend[]
  by_bank: BankRow[]
  by_country: CountryRow[]
  by_category: CategoryRow[]
  by_ai_provider: AIRow[]
  leak_distribution: LeakBucket[]
}

// ── stat card ─────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent = false,
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <Card className={`border ${accent ? 'border-indigo-500/40 bg-indigo-950/30' : 'border-white/10 bg-white/5'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${accent ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-white/60'}`}>
            <Icon size={18} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── section heading ────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4 mt-8">
      {children}
    </h2>
  )
}

// ── main page ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('')
  const [inputKey, setInputKey] = useState('')
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [lastFetched, setLastFetched] = useState<string | null>(null)
  const [retraining, setRetraining] = useState(false)
  const [retrainResult, setRetrainResult] = useState<{
    ok: boolean
    training_examples: number
    classes: number
    class_distribution: Record<string, number>
    cv_accuracy: number
    cv_std: number
    top_features: { feature: string; importance: number }[]
    elapsed_ms: number
  } | null>(null)
  const [retrainError, setRetrainError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (key: string, d: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard?days=${d}`, {
        headers: { 'x-admin-key': key },
      })
      if (res.status === 401) { setError('Invalid admin key'); setLoading(false); return }
      if (!res.ok) { setError(`Server error: ${res.status}`); setLoading(false); return }
      const json = await res.json()
      setData(json)
      setLastFetched(new Date().toLocaleTimeString())
    } catch {
      setError('Cannot reach backend — is it running?')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setApiKey(inputKey)
    fetchDashboard(inputKey, days)
  }

  useEffect(() => {
    if (apiKey) fetchDashboard(apiKey, days)
  }, [days, apiKey, fetchDashboard])

  async function handleRetrain() {
    setRetraining(true)
    setRetrainResult(null)
    setRetrainError(null)
    try {
      const res = await fetch(`${API_BASE}/admin/retrain`, {
        method: 'POST',
        headers: { 'x-admin-key': apiKey },
      })
      const json = await res.json()
      if (!res.ok) { setRetrainError(json.detail || 'Retrain failed'); return }
      setRetrainResult(json)
    } catch {
      setRetrainError('Cannot reach backend')
    } finally {
      setRetraining(false)
    }
  }

  // ── login screen ──────────────────────────────────────────────────────

  if (!apiKey || error === 'Invalid admin key') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-500/20 rounded-lg"><Lock size={20} className="text-indigo-400" /></div>
            <div>
              <h1 className="text-white font-bold text-lg">Admin Dashboard</h1>
              <p className="text-white/40 text-xs">Leaky Wallet Internal Metrics</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin API key"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              Access Dashboard
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // ── loading ────────────────────────────────────────────────────────────

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <RefreshCw className="animate-spin text-indigo-400" size={32} />
      </div>
    )
  }

  // ── error ──────────────────────────────────────────────────────────────

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center gap-3 text-red-400">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { summary, daily_trend, by_bank, by_country, by_category, by_ai_provider, leak_distribution } = data

  // ── dashboard ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* header bar */}
      <div className="border-b border-white/5 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-500/20 rounded-md"><BarChart2 size={16} className="text-indigo-400" /></div>
            <span className="font-semibold text-sm">Leaky Wallet Admin</span>
            <span className="text-white/30 text-xs">Internal metrics only</span>
          </div>
          <div className="flex items-center gap-3">
            {lastFetched && <span className="text-white/30 text-xs hidden sm:block">Updated {lastFetched}</span>}
            {/* period selector */}
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
            <Button
              size="sm"
              variant="ghost"
              className="text-white/50 hover:text-white"
              onClick={() => fetchDashboard(apiKey, days)}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-2">

        {/* ── summary cards ───────────────────────────────────────────── */}
        <SectionTitle>Overview — last {days} days</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Users} label="Total Analyses" value={summary.total_analyses?.toLocaleString() ?? '—'} accent />
          <StatCard icon={DollarSign} label="Avg Monthly Leak" value={fmt(summary.avg_monthly_leak)} sub={`max ${fmt(summary.max_monthly_leak)}`} />
          <StatCard icon={TrendingUp} label="Savings Found" value={fmt(summary.total_savings_identified)} sub="annual total" />
          <StatCard icon={Activity} label="Avg Health Score" value={summary.avg_health_score != null ? `${summary.avg_health_score}/100` : '—'} />
          <StatCard icon={AlertCircle} label="Overdraft Rate" value={summary.overdraft_pct != null ? `${summary.overdraft_pct.toFixed(1)}%` : '—'} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <StatCard icon={Globe} label="Countries" value={summary.countries_seen ?? '—'} />
          <StatCard icon={BarChart2} label="Bank Formats" value={summary.bank_formats_seen ?? '—'} />
          <StatCard icon={Cpu} label="Avg Subscriptions" value={summary.avg_subscriptions != null ? summary.avg_subscriptions.toFixed(1) : '—'} />
          <StatCard icon={DollarSign} label="Avg Annual Savings" value={fmt((summary.avg_monthly_leak ?? 0) * 12)} />
        </div>

        {/* ── daily trend ─────────────────────────────────────────────── */}
        {daily_trend?.length > 0 && (
          <>
            <SectionTitle>Daily Trend</SectionTitle>
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="border border-white/10 bg-white/5">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-white/70">Analyses Per Day</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={daily_trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="rollup_date" tickFormatter={fmtDate} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                        itemStyle={{ color: '#6366f1' }}
                        labelFormatter={(label: unknown) => fmtDate(String(label))}
                      />
                      <Bar dataKey="analyses_count" fill={GRADIENT_INDIGO} radius={[4, 4, 0, 0]} name="Analyses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border border-white/10 bg-white/5">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-white/70">Avg vs Median Monthly Leak ($)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={daily_trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="rollup_date" tickFormatter={fmtDate} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                        labelFormatter={(label: unknown) => fmtDate(String(label))}
                        formatter={(v: number | undefined) => [`$${Math.round(v ?? 0)}`, '']}
                      />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                      <Line type="monotone" dataKey="avg_monthly_leak" stroke={GRADIENT_INDIGO} strokeWidth={2} dot={false} name="Avg" />
                      <Line type="monotone" dataKey="median_monthly_leak" stroke={GRADIENT_PINK} strokeWidth={2} dot={false} name="Median" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ── leak distribution ────────────────────────────────────────── */}
        {leak_distribution?.length > 0 && (
          <>
            <SectionTitle>Monthly Leak Distribution</SectionTitle>
            <Card className="border border-white/10 bg-white/5">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-white/70">Where most users fall ($ per month)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={leak_distribution} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="bucket" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      itemStyle={{ color: '#22d3ee' }}
                    />
                    <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── by bank & country ────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-4">
          {by_bank?.length > 0 && (
            <div>
              <SectionTitle>Bank Format Usage</SectionTitle>
              <Card className="border border-white/10 bg-white/5">
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-4 py-3 text-white/40 font-normal">Bank</th>
                        <th className="text-right px-4 py-3 text-white/40 font-normal">Count</th>
                        <th className="text-right px-4 py-3 text-white/40 font-normal">Avg Leak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {by_bank.map((r, i) => (
                        <tr key={r.bank_format} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2.5 text-white/80 flex items-center gap-2">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            {r.bank_format}
                          </td>
                          <td className="px-4 py-2.5 text-right text-white/60">{r.count}</td>
                          <td className="px-4 py-2.5 text-right text-amber-400">{fmt(r.avg_leak)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {by_country?.length > 0 && (
            <div>
              <SectionTitle>Geographic Distribution</SectionTitle>
              <Card className="border border-white/10 bg-white/5">
                <CardContent className="pt-4 pb-2 px-4 flex flex-col gap-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={by_country}
                        dataKey="count"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={false}
                        labelLine={false}
                      >
                        {by_country.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        formatter={(v: number | undefined, name: string | undefined) => [v ?? 0, name ?? '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 justify-center pb-2">
                    {by_country.map((r, i) => (
                      <div key={r.country} className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs text-white/60">{r.country} ({r.count})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* ── category totals ──────────────────────────────────────────── */}
        {by_category?.length > 0 && (
          <>
            <SectionTitle>Aggregate Spending by Category</SectionTitle>
            <Card className="border border-white/10 bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/70">Total across all analyses (anonymised — no merchant names)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={by_category.slice(0, 12)}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 80, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                      tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="category" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} width={80} />
                    <Tooltip
                      contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      formatter={(v: number | undefined) => [`$${Math.round(v ?? 0).toLocaleString()}`, 'Total']}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Total">
                      {by_category.slice(0, 12).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── AI provider usage ────────────────────────────────────────── */}
        {by_ai_provider?.length > 0 && (
          <>
            <SectionTitle>AI Provider Usage</SectionTitle>
            <Card className="border border-white/10 bg-white/5">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-white/40 font-normal">Provider</th>
                      <th className="text-right px-4 py-3 text-white/40 font-normal">Calls</th>
                      <th className="text-right px-4 py-3 text-white/40 font-normal">Share</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {by_ai_provider.map((r, i) => (
                      <tr key={r.provider} className="border-b border-white/5">
                        <td className="px-4 py-3 text-white/80 flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                          {r.provider}
                        </td>
                        <td className="px-4 py-3 text-right text-white/60">{r.count.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-white/60">{r.pct?.toFixed(1)}%</td>
                        <td className="px-4 py-3 w-32">
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${r.pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── ML Retraining ────────────────────────────────────────────── */}
        <SectionTitle>ML Model — Column Classifier</SectionTitle>
        <Card className="border border-purple-500/20 bg-purple-950/10">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={16} className="text-purple-400" />
                  <span className="font-semibold text-sm text-white">Random Forest Column Classifier</span>
                </div>
                <p className="text-xs text-white/40 max-w-lg">
                  Trained on all CSV files in <code className="text-purple-300">tests/statements/</code>.
                  Adding new bank statement files and retraining makes the parser smarter with every upload —
                  more data = higher accuracy across exotic bank formats.
                </p>
              </div>
              <Button
                onClick={handleRetrain}
                disabled={retraining}
                className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm"
              >
                {retraining
                  ? <><RefreshCw size={13} className="animate-spin mr-1.5" />Training…</>
                  : <><Brain size={13} className="mr-1.5" />Retrain Model</>
                }
              </Button>
            </div>

            {/* Result */}
            {retrainResult && (
              <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle size={14} />
                  Training complete
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-white/40">Training examples</p>
                    <p className="font-semibold text-white">{retrainResult.training_examples}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">CV Accuracy</p>
                    <p className="font-semibold text-emerald-400">
                      {(retrainResult.cv_accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Classes</p>
                    <p className="font-semibold text-white">{retrainResult.classes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Time</p>
                    <p className="font-semibold text-white">{retrainResult.elapsed_ms}ms</p>
                  </div>
                </div>
                {/* Class distribution */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(retrainResult.class_distribution).map(([cls, cnt]) => (
                    <span key={cls} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5">
                      <span className="text-white/60">{cls}</span>
                      <span className="text-white/40 ml-1">{cnt}</span>
                    </span>
                  ))}
                </div>
                {/* Top features */}
                <div>
                  <p className="text-xs text-white/40 mb-1">Top feature importances</p>
                  <div className="space-y-1">
                    {retrainResult.top_features.slice(0, 5).map(f => (
                      <div key={f.feature} className="flex items-center gap-2 text-xs">
                        <span className="text-white/60 w-28 shrink-0">{f.feature}</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(f.importance * 800, 100)}%` }}
                          />
                        </div>
                        <span className="text-white/40 w-10 text-right">{(f.importance * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {retrainError && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-500/30 rounded-lg px-3 py-2">
                <XCircle size={14} />
                {retrainError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* footer note */}
        <p className="text-center text-white/20 text-xs py-8">
          All data is anonymised aggregate metrics. No user PII, no merchant names.
          Generated at {data.generated_at?.replace('T', ' ').split('.')[0]}Z · {days}-day window.
        </p>
      </div>
    </div>
  )
}
