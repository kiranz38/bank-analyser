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
}
