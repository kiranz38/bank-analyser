export interface ProReportData {
  generated_at: string // ISO timestamp
  period: { start: string; end: string } // date range analyzed

  // Executive Summary
  executive_summary: {
    headline: string // e.g. "You're leaking $487/mo — here's how to fix it"
    paragraph: string // 2-3 sentence personalized overview
    health_score: number // 0-100 financial health score
    health_label: string // "Needs Attention" | "Fair" | "Good" | "Excellent"
  }

  // Monthly Trends (for sparkline/line charts in PDF)
  monthly_trends: Array<{
    month: string // "2024-01"
    total_spend: number
    by_category: Record<string, number>
  }>

  // Subscription ROI
  subscription_insights: Array<{
    merchant: string
    monthly_cost: number
    annual_cost: number
    usage_estimate: string // "High" | "Medium" | "Low" | "Unknown"
    roi_label: string // "Good value" | "Review usage" | "Consider cancelling"
    recommendation: string // personalized action
  }>

  // Projected Savings
  savings_projection: {
    month_3: number
    month_6: number
    month_12: number
    assumptions: string[]
  }

  // Priority Action Plan
  action_plan: Array<{
    priority: number // 1 = highest
    title: string
    description: string
    estimated_monthly_savings: number
    estimated_yearly_savings: number
    difficulty: 'easy' | 'medium' | 'hard'
    timeframe: string // "This week" | "This month" | "Next 3 months"
    category: string
  }>

  // Behavioral Insights
  behavioral_insights: {
    peak_spending_day: string // "Saturday"
    avg_daily_spend: number
    avg_weekly_spend: number
    impulse_spend_estimate: number // transactions < $20 that add up
    top_impulse_merchants: string[]
    spending_velocity: string // "Your spending accelerates mid-month"
  }

  // Category Deep Dives
  category_deep_dives: Array<{
    category: string
    total: number
    percent: number
    monthly_average: number
    trend: 'increasing' | 'decreasing' | 'stable'
    trend_percent: number
    top_merchants: Array<{ name: string; total: number; count: number }>
    insight: string // personalized observation
    recommendation: string // personalized suggestion
  }>

  // Evidence Appendix (transaction-level backup)
  evidence: {
    subscription_transactions: Array<{
      merchant: string
      dates: string[]
      amounts: number[]
    }>
    top_50_transactions: Array<{
      date: string
      merchant: string
      amount: number
      category: string
    }>
  }
}
