'use client'

import {
  Zap, TrendingDown, Calendar, Target, Coffee, ArrowRight,
  AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp,
  BarChart2, Flame, Wallet,
} from 'lucide-react'
import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type {
  SpendingVelocity, BehavioralPatterns, HabitEntry,
  ActionItem, AffordableGoal, CategoryDeepDive,
} from '@/lib/types'

interface Props {
  spending_velocity?: SpendingVelocity | null
  behavioral_patterns?: BehavioralPatterns | null
  habit_analysis?: HabitEntry[]
  category_deep_dive?: CategoryDeepDive[]
  action_plan?: ActionItem[]
  what_you_could_afford?: AffordableGoal[]
}

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function fmtDec(n: number) {
  return `$${n.toFixed(2)}`
}

const PRIORITY_COLOR: Record<string, string> = {
  high:   'border-red-400/60 bg-red-50 dark:bg-red-950/20 dark:border-red-500/40',
  medium: 'border-amber-400/60 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-500/40',
  low:    'border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-500/40',
}
const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  low:    'bg-emerald-500',
}
const PRIORITY_LABEL: Record<string, string> = {
  high:   'High impact',
  medium: 'Medium impact',
  low:    'Low impact',
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, icon: Icon, badge }: { title: string; icon: React.ElementType; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/15 rounded-lg">
        <Icon size={15} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      {badge && (
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </div>
  )
}

function VelocityCard({ velocity }: { velocity: SpendingVelocity }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <SectionHeader title="Spending Velocity" icon={Flame} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Daily burn</p>
          <p className="text-lg font-bold text-foreground">{fmt(velocity.daily_burn_rate)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Monthly burn</p>
          <p className="text-lg font-bold text-foreground">{fmt(velocity.monthly_burn_rate)}</p>
        </div>
        {velocity.savings_rate_pct != null && (
          <div className={`rounded-lg p-3 ${
            velocity.savings_rate_pct >= 20
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/50 dark:border-emerald-500/30'
              : velocity.savings_rate_pct >= 0
                ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-500/30'
                : 'bg-red-50 dark:bg-red-950/30 border border-red-400/50 dark:border-red-500/30'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">Savings rate</p>
            <p className={`text-lg font-bold ${
              velocity.savings_rate_pct >= 20
                ? 'text-emerald-600 dark:text-emerald-400'
                : velocity.savings_rate_pct >= 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {velocity.savings_rate_pct.toFixed(1)}%
            </p>
          </div>
        )}
      </div>
      {velocity.days_to_empty != null && velocity.days_to_empty < 30 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-400/50 dark:border-amber-500/30 rounded-lg px-3 py-2">
          <AlertTriangle size={14} />
          At current rate, your monthly income runs out in {velocity.days_to_empty.toFixed(0)} days.
        </div>
      )}
      {velocity.monthly_surplus != null && (
        <p className="text-xs text-muted-foreground">
          Monthly surplus after spending:{' '}
          <span className={velocity.monthly_surplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
            {fmt(velocity.monthly_surplus)}
          </span>
        </p>
      )}
    </div>
  )
}

function BehaviorCard({ patterns }: { patterns: BehavioralPatterns }) {
  const chartData = DAY_ORDER
    .filter(d => patterns.avg_spend_by_day[d] != null)
    .map(d => ({
      day: DAY_SHORT[d],
      amount: patterns.avg_spend_by_day[d],
      highlight: d === patterns.most_expensive_day,
    }))

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <SectionHeader title="Spending Patterns" icon={BarChart2} />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Biggest spend day</p>
          <p className="font-semibold text-foreground">{patterns.most_expensive_day}</p>
          <p className="text-xs text-muted-foreground">${patterns.avg_spend_by_day[patterns.most_expensive_day]?.toFixed(0) ?? '—'} avg</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Weekend vs Weekday</p>
          <p className="font-semibold text-foreground">{patterns.weekend_spend_pct.toFixed(0)}% weekends</p>
          <p className="text-xs text-muted-foreground">{patterns.weekday_spend_pct.toFixed(0)}% weekdays</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
            <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--foreground)' }}
              formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(0)}`, 'Avg spend']}
            />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.highlight ? '#f59e0b' : '#6366f1'} fillOpacity={d.highlight ? 1 : 0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {patterns.month_end_spike && (
        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-400/50 dark:border-amber-500/30 rounded-lg px-3 py-2">
          <AlertTriangle size={12} />
          You spend significantly more in the second half of the month — a sign of end-of-month pressure spending.
        </div>
      )}
    </div>
  )
}

function HabitsCard({ habits }: { habits: HabitEntry[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? habits : habits.slice(0, 5)

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <SectionHeader title="Recurring Habits" icon={Coffee} badge={`${habits.length} merchants`} />
      <div className="space-y-2">
        {visible.map((h, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{h.merchant}</p>
              <p className="text-xs text-muted-foreground">
                {h.visit_count} visits · {fmtDec(h.avg_per_visit)}/visit ·{' '}
                <span className="text-foreground/60">{h.habit_label}</span>
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-semibold text-foreground">{fmt(h.monthly_total)}<span className="text-xs text-muted-foreground">/mo</span></p>
              <p className="text-xs text-muted-foreground">{fmt(h.annual_total)}/yr</p>
            </div>
          </div>
        ))}
      </div>
      {habits.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showAll ? 'Show less' : `Show ${habits.length - 5} more`}
        </button>
      )}
    </div>
  )
}

function ActionPlanCard({ actions }: { actions: ActionItem[] }) {
  const totalMonthly = actions.filter(a => a.type !== 'invest').reduce((s, a) => s + a.monthly_impact, 0)
  const totalAnnual = totalMonthly * 12

  return (
    <div className="rounded-xl border border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/10 p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Your Action Plan" icon={Target} />
        {totalAnnual > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total potential savings</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalAnnual)}<span className="text-xs text-muted-foreground">/yr</span></p>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {actions.map((a, i) => (
          <div key={i} className={`rounded-lg border p-3 ${PRIORITY_COLOR[a.priority] || 'border-border bg-muted/30'}`}>
            <div className="flex items-start gap-2">
              <span className={`mt-1 inline-block w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[a.priority]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{a.action}</p>
                  {a.annual_impact > 0 && (
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{fmt(a.annual_impact)}<span className="text-xs text-muted-foreground">/yr</span></p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">{PRIORITY_LABEL[a.priority]}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />{a.effort}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AffordableCard({ goals }: { goals: AffordableGoal[] }) {
  return (
    <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/10 p-4 space-y-3">
      <SectionHeader title="What You Could Afford" icon={Wallet} />
      <p className="text-xs text-muted-foreground">If you act on the plan above, here's what becomes achievable:</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {goals.map((g, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/60 dark:bg-white/5 border border-border/40 rounded-lg p-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg shrink-0">
              <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{g.goal}</p>
              <p className="text-xs text-muted-foreground">
                In <span className="text-emerald-600 dark:text-emerald-400 font-medium">{g.months_to_reach.toFixed(0)} months</span>
                {' '}· {fmt(g.cost)} goal
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryDiveCard({ categories }: { categories: CategoryDeepDive[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? categories : categories.slice(0, 6)
  const max = Math.max(...categories.map(c => c.monthly_total), 1)

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <SectionHeader title="Category Breakdown" icon={BarChart2} />
      <div className="space-y-2">
        {visible.map((c, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/80">{c.category}</span>
              <div className="flex items-center gap-3">
                {c.pct_of_income != null && (
                  <span className="text-xs text-muted-foreground">{c.pct_of_income.toFixed(1)}% of income</span>
                )}
                <span className="font-semibold text-foreground">{fmt(c.monthly_total)}<span className="text-xs text-muted-foreground">/mo</span></span>
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${(c.monthly_total / max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {c.transaction_count} transactions · avg {fmtDec(c.avg_per_transaction)} · largest {fmtDec(c.largest_transaction)}
            </p>
          </div>
        ))}
      </div>
      {categories.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showAll ? 'Show less' : `Show ${categories.length - 6} more categories`}
        </button>
      )}
    </div>
  )
}

// ── main export ───────────────────────────────────────────────────────────────

export default function InsightsPanel({
  spending_velocity,
  behavioral_patterns,
  habit_analysis,
  category_deep_dive,
  action_plan,
  what_you_could_afford,
}: Props) {
  const hasAny = !!(
    spending_velocity?.daily_burn_rate ||
    behavioral_patterns?.most_expensive_day ||
    (habit_analysis && habit_analysis.length > 0) ||
    (action_plan && action_plan.length > 0)
  )

  if (!hasAny) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-base font-bold text-foreground">Personal Insights</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">deep analysis</span>
      </div>

      {/* Action Plan — most prominent */}
      {action_plan && action_plan.length > 0 && (
        <ActionPlanCard actions={action_plan} />
      )}

      {/* What you could afford */}
      {what_you_could_afford && what_you_could_afford.length > 0 && (
        <AffordableCard goals={what_you_could_afford} />
      )}

      {/* Velocity + Patterns side by side on wide screens */}
      <div className="grid lg:grid-cols-2 gap-4">
        {spending_velocity?.daily_burn_rate != null && (
          <VelocityCard velocity={spending_velocity} />
        )}
        {behavioral_patterns?.most_expensive_day && (
          <BehaviorCard patterns={behavioral_patterns} />
        )}
      </div>

      {/* Habits */}
      {habit_analysis && habit_analysis.length > 0 && (
        <HabitsCard habits={habit_analysis} />
      )}

      {/* Category deep dive */}
      {category_deep_dive && category_deep_dive.length > 0 && (
        <CategoryDiveCard categories={category_deep_dive} />
      )}
    </div>
  )
}
