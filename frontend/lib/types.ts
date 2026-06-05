export interface Leak {
  category: string
  merchant: string
  monthly_cost: number
  yearly_cost: number
  explanation: string
  date?: string
  last_date?: string
}

export interface TopSpending {
  date: string
  merchant: string
  amount: number
  category?: string
}

export interface EasyWin {
  title: string
  estimated_yearly_savings: number
  action: string
}

export interface CategorySummary {
  category: string
  total: number
  percent: number
  transaction_count: number
  top_merchants: Array<{ name: string; total: number }>
}

export interface Subscription {
  merchant: string
  monthly_cost: number
  annual_cost: number
  confidence: number
  last_date: string
  occurrences: number
  reason: string
}

export interface MonthComparisonData {
  previous_month: string
  current_month: string
  previous_total: number
  current_total: number
  total_change: number
  total_change_percent: number
  top_changes: Array<{
    category: string
    previous: number
    current: number
    change: number
    change_percent: number
  }>
  spikes: Array<{
    category: string
    previous: number
    current: number
    change: number
    change_percent: number
  }>
  months_analyzed: number
}

export interface ShareSummary {
  monthly_leak: number
  annual_savings: number
  top_categories: Array<{ category: string; monthly: number }>
  subscription_count: number
  tagline: string
}

export interface Alternative {
  original: string
  alternative: string
  current_price: number
  alternative_price: number
  monthly_savings: number
  yearly_savings: number
  note: string
  category: string
}

export interface PriceChange {
  merchant: string
  old_price: number
  new_price: number
  increase: number
  percent_change: number
  first_date: string
  latest_date: string
  yearly_impact: number
}

export interface DuplicateSubscription {
  category: string
  services: string[]
  count: number
  combined_monthly: number
  combined_yearly: number
  suggestion: string
}

// ── New insight types ──────────────────────────────────────────────────────

export interface SpendingVelocity {
  daily_burn_rate: number
  monthly_burn_rate: number
  span_days: number
  days_to_empty?: number | null
  savings_rate_pct?: number
  monthly_surplus?: number
}

export interface BehavioralPatterns {
  avg_spend_by_day: Record<string, number>
  most_expensive_day: string
  weekend_spend_pct: number
  weekday_spend_pct: number
  month_end_spike: boolean
  first_half_spend: number
  second_half_spend: number
}

export interface HabitEntry {
  merchant: string
  visit_count: number
  avg_per_visit: number
  monthly_visits: number
  monthly_total: number
  annual_total: number
  habit_label: string
}

export interface CashflowWeek {
  week: string
  spending: number
  income?: number
  surplus?: number
}

export interface CategoryDeepDive {
  category: string
  monthly_total: number
  total: number
  transaction_count: number
  avg_per_transaction: number
  largest_transaction: number
  pct_of_income: number | null
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low'
  action: string
  detail: string
  monthly_impact: number
  annual_impact: number
  effort: string
  type: string
}

export interface AffordableGoal {
  goal: string
  cost: number
  months_to_reach: number
  monthly_savings_needed: number
}

export interface AnalysisResult {
  monthly_leak: number
  annual_savings: number
  top_leaks: Leak[]
  top_spending: TopSpending[]
  easy_wins: EasyWin[]
  recovery_plan: string[]
  disclaimer: string
  category_summary?: CategorySummary[]
  subscriptions?: Subscription[]
  comparison?: MonthComparisonData | null
  share_summary?: ShareSummary | null
  alternatives?: Alternative[]
  price_changes?: PriceChange[]
  duplicate_subscriptions?: DuplicateSubscription[]
  // Financial planning
  financial_health?: Record<string, unknown> | null
  goal_projections?: Record<string, unknown>[]
  budget_benchmark?: Record<string, unknown> | null
  savings_strategy?: Record<string, unknown> | null
  // Deep individual insights
  spending_velocity?: SpendingVelocity | null
  behavioral_patterns?: BehavioralPatterns | null
  habit_analysis?: HabitEntry[]
  cashflow_calendar?: CashflowWeek[]
  category_deep_dive?: CategoryDeepDive[]
  action_plan?: ActionItem[]
  what_you_could_afford?: AffordableGoal[]
}

export type { ProReportData } from './proReportTypes'
