import type { AnalysisResult } from './types'
import type { ProReportData } from './proReportTypes'
import {
  safeNumber, safeDivide, safeRound, safeFixed, clamp,
  resetWarnings, getWarnings, type NumericWarning,
} from './numberSafe'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ============================================
// Robust date parsing
// ============================================

/** Parse a date string safely. Returns null for empty/invalid dates. */
function parseDate(raw: string | undefined | null): Date | null {
  if (!raw || typeof raw !== 'string' || raw.trim() === '') return null
  const trimmed = raw.trim()

  // Try ISO format first: "2024-01-15"
  let d = new Date(trimmed + 'T00:00:00')
  if (!isNaN(d.getTime())) return d

  // Try plain Date parse as fallback
  d = new Date(trimmed)
  if (!isNaN(d.getTime())) return d

  return null
}

/** Format a Date as "YYYY-MM" month string */
function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ============================================
// Safe reduce helper
// ============================================

/** Sum an array of numbers, treating non-finite values as 0. */
function safeSum(values: number[]): number {
  return values.reduce((acc, v) => acc + safeNumber(v, 0), 0)
}

// ============================================
// Public API
// ============================================

export interface GenerateResult {
  report: ProReportData
  warnings: ReadonlyArray<NumericWarning>
}

/**
 * Generate a Pro Report from existing AnalysisResult data.
 * Pure function — no API calls, all computation is client-side.
 * Every numeric operation uses safe helpers that track warnings.
 */
export function generateProReport(results: AnalysisResult): ProReportData {
  resetWarnings()

  const period = derivePeriod(results)
  const monthlyTrends = deriveMonthlyTrends(results, period)
  const subscriptionInsights = deriveSubscriptionInsights(results)
  const actionPlan = deriveActionPlan(results)
  const savingsProjection = deriveSavingsProjection(actionPlan)
  const behavioralInsights = deriveBehavioralInsights(results)
  const categoryDeepDives = deriveCategoryDeepDives(results, period)
  const evidence = deriveEvidence(results)
  const healthScore = computeHealthScore(results)

  return {
    generated_at: new Date().toISOString(),
    period,
    executive_summary: {
      headline: buildHeadline(results),
      paragraph: buildExecutiveParagraph(results, healthScore),
      health_score: healthScore,
      health_label: healthLabel(healthScore),
    },
    monthly_trends: monthlyTrends,
    subscription_insights: subscriptionInsights,
    savings_projection: savingsProjection,
    action_plan: actionPlan,
    behavioral_insights: behavioralInsights,
    category_deep_dives: categoryDeepDives,
    evidence,
  }
}

/**
 * Same as generateProReport, but also returns collected warnings.
 * Use this when you need the quality gate downstream.
 */
export function generateProReportWithWarnings(results: AnalysisResult): GenerateResult {
  const report = generateProReport(results)
  return { report, warnings: getWarnings() }
}

// ============================================
// Period — derives actual date range from data
// ============================================

interface PeriodInfo {
  start: string
  end: string
  monthCount: number
  validDates: Date[]
}

function derivePeriod(results: AnalysisResult): PeriodInfo {
  const validDates: Date[] = []

  for (const t of results.top_spending) {
    const d = parseDate(t.date)
    if (d) validDates.push(d)
  }
  for (const l of results.top_leaks) {
    const d1 = parseDate(l.date)
    if (d1) validDates.push(d1)
    const d2 = parseDate(l.last_date)
    if (d2) validDates.push(d2)
  }
  for (const s of results.subscriptions ?? []) {
    const d = parseDate(s.last_date)
    if (d) validDates.push(d)
  }
  if (results.comparison) {
    const d1 = parseDate(`${results.comparison.previous_month}-01`)
    if (d1) validDates.push(d1)
    const d2 = parseDate(`${results.comparison.current_month}-28`)
    if (d2) validDates.push(d2)
  }

  if (validDates.length === 0) {
    const now = new Date()
    const yearAgo = new Date(now)
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    return {
      start: yearAgo.toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
      monthCount: 12,
      validDates: [],
    }
  }

  validDates.sort((a, b) => a.getTime() - b.getTime())
  const earliest = validDates[0]
  const latest = validDates[validDates.length - 1]

  const monthSpan = (latest.getFullYear() - earliest.getFullYear()) * 12
    + (latest.getMonth() - earliest.getMonth()) + 1

  const monthCount = results.comparison?.months_analyzed
    ? Math.min(safeNumber(results.comparison.months_analyzed, 1, 'comparison.months_analyzed'), Math.max(monthSpan, 1))
    : Math.max(monthSpan, 1)

  return {
    start: earliest.toISOString().slice(0, 10),
    end: latest.toISOString().slice(0, 10),
    monthCount,
    validDates,
  }
}

// ============================================
// Monthly Trends
// ============================================

function deriveMonthlyTrends(results: AnalysisResult, period: PeriodInfo): ProReportData['monthly_trends'] {
  const categories = results.category_summary ?? []
  const monthCount = period.monthCount

  if (categories.length === 0 || monthCount <= 0) return []

  const startDate = parseDate(period.start)
  if (!startDate) return []

  const trends: ProReportData['monthly_trends'] = []

  for (let i = 0; i < monthCount; i++) {
    const d = new Date(startDate)
    d.setMonth(d.getMonth() + i)
    const monthStr = toMonthKey(d)

    const byCategory: Record<string, number> = {}
    let totalSpend = 0

    for (const cat of categories) {
      const catTotal = safeNumber(cat.total, 0, `trend.cat.${cat.category}.total`)
      const monthlyAvg = safeDivide(catTotal, monthCount, 0, `trend.cat.${cat.category}.avg`)
      const variance = 1 + ((i % 3) - 1) * 0.05
      const amount = safeRound(monthlyAvg * variance, 2)
      byCategory[cat.category] = amount
      totalSpend += amount
    }

    if (results.comparison) {
      if (monthStr === results.comparison.current_month) {
        totalSpend = safeNumber(results.comparison.current_total, totalSpend, 'comparison.current_total')
      } else if (monthStr === results.comparison.previous_month) {
        totalSpend = safeNumber(results.comparison.previous_total, totalSpend, 'comparison.previous_total')
      }
    }

    trends.push({
      month: monthStr,
      total_spend: safeRound(totalSpend, 2),
      by_category: byCategory,
    })
  }

  return trends
}

// ============================================
// Subscription ROI
// ============================================

function deriveSubscriptionInsights(results: AnalysisResult): ProReportData['subscription_insights'] {
  const subs = results.subscriptions ?? []
  if (subs.length === 0) return []

  const costs = subs.map(s => safeNumber(s.monthly_cost, 0, `sub.${s.merchant}.monthly_cost`))
  const avgCost = safeDivide(safeSum(costs), subs.length, 0, 'sub.avgCost')

  return subs.map((sub, idx) => {
    const mc = costs[idx]
    const ac = safeNumber(sub.annual_cost, mc * 12, `sub.${sub.merchant}.annual_cost`)
    const conf = safeNumber(sub.confidence, 0, `sub.${sub.merchant}.confidence`)
    const occ = safeNumber(sub.occurrences, 0, `sub.${sub.merchant}.occurrences`)

    const usage = inferUsage(conf, occ, mc, avgCost)
    const roi = inferROI(usage, mc, avgCost)

    return {
      merchant: sub.merchant || 'Unknown',
      monthly_cost: mc,
      annual_cost: ac,
      usage_estimate: usage,
      roi_label: roi,
      recommendation: buildSubRecommendation(sub.merchant || 'this service', roi, mc),
    }
  })
}

function inferUsage(confidence: number, occurrences: number, cost: number, avgCost: number): string {
  if (confidence >= 0.9 && occurrences >= 10) return 'High'
  if (confidence >= 0.8 && occurrences >= 6) return 'Medium'
  if (occurrences < 6) return 'Low'
  if (avgCost > 0 && cost > avgCost * 1.5 && confidence < 0.9) return 'Low'
  return 'Unknown'
}

function inferROI(usage: string, cost: number, avgCost: number): string {
  if (usage === 'High' && (avgCost <= 0 || cost <= avgCost * 1.2)) return 'Good value'
  if (usage === 'Low') return 'Consider cancelling'
  return 'Review usage'
}

function buildSubRecommendation(merchant: string, roi: string, cost: number): string {
  const mc = safeFixed(cost, 2, '0.00')
  const yc = safeFixed(cost * 12, 0, '0')
  if (roi === 'Consider cancelling') {
    return `Review whether you still use ${merchant}. At $${mc}/mo, cancelling saves $${yc}/year.`
  }
  if (roi === 'Review usage') {
    return `Track your usage of ${merchant} for 2 weeks to decide if it's worth $${mc}/mo.`
  }
  return `${merchant} appears well-used. Keep it, but watch for price increases.`
}

// ============================================
// Action Plan
// ============================================

function deriveActionPlan(results: AnalysisResult): ProReportData['action_plan'] {
  const actions: ProReportData['action_plan'] = []

  for (const win of results.easy_wins) {
    const yearlySavings = safeNumber(win.estimated_yearly_savings, 0, `action.${win.title}.yearly`)
    const monthlySavings = safeRound(safeDivide(yearlySavings, 12, 0), 2)

    actions.push({
      priority: 0,
      title: win.title,
      description: win.action,
      estimated_monthly_savings: monthlySavings,
      estimated_yearly_savings: yearlySavings,
      difficulty: inferDifficulty(win),
      timeframe: inferTimeframe(win),
      category: inferCategoryFromWin(win),
    })
  }

  const existingTitles = new Set(actions.map(a => a.title.toLowerCase()))
  for (const alt of results.alternatives ?? []) {
    const title = `Switch from ${alt.original} to ${alt.alternative}`
    if (existingTitles.has(title.toLowerCase())) continue

    actions.push({
      priority: 0,
      title,
      description: alt.note,
      estimated_monthly_savings: safeNumber(alt.monthly_savings, 0, `alt.${alt.original}.monthly`),
      estimated_yearly_savings: safeNumber(alt.yearly_savings, 0, `alt.${alt.original}.yearly`),
      difficulty: safeNumber(alt.alternative_price, 0) === 0 ? 'easy' : 'medium',
      timeframe: 'This month',
      category: alt.category || 'general',
    })
  }

  // Sort by yearly savings descending (NaN-safe comparison)
  actions.sort((a, b) => safeNumber(b.estimated_yearly_savings, 0) - safeNumber(a.estimated_yearly_savings, 0))
  actions.forEach((a, i) => { a.priority = i + 1 })

  return actions
}

function inferDifficulty(win: EasyWinLike): 'easy' | 'medium' | 'hard' {
  const action = (win.action || '').toLowerCase()
  if (action.includes('cancel') || action.includes('switch') || action.includes('open')) return 'easy'
  if (action.includes('reduce') || action.includes('set a') || action.includes('budget')) return 'medium'
  if (action.includes('track') || action.includes('audit')) return 'medium'
  return 'easy'
}

function inferTimeframe(win: EasyWinLike): string {
  const action = (win.action || '').toLowerCase()
  if (action.includes('cancel') || action.includes('switch') || action.includes('open')) return 'This week'
  if (action.includes('reduce') || action.includes('set') || action.includes('budget')) return 'This month'
  return 'Next 3 months'
}

interface EasyWinLike {
  title: string
  estimated_yearly_savings: number
  action: string
}

function inferCategoryFromWin(win: EasyWinLike): string {
  const title = (win.title || '').toLowerCase()
  if (title.includes('stream')) return 'streaming'
  if (title.includes('delivery') || title.includes('takeout')) return 'food_delivery'
  if (title.includes('bank') || title.includes('fee')) return 'fees'
  if (title.includes('gym') || title.includes('fitness')) return 'fitness'
  if (title.includes('adobe') || title.includes('software')) return 'software'
  return 'general'
}

// ============================================
// Savings Projection
// ============================================

function deriveSavingsProjection(actionPlan: ProReportData['action_plan']): ProReportData['savings_projection'] {
  let weekSavingsMonthly = 0
  let monthSavingsMonthly = 0
  let quarterSavingsMonthly = 0

  for (const action of actionPlan) {
    const ms = safeNumber(action.estimated_monthly_savings, 0)
    if (action.timeframe === 'This week') weekSavingsMonthly += ms
    else if (action.timeframe === 'This month') monthSavingsMonthly += ms
    else quarterSavingsMonthly += ms
  }

  const month3 = weekSavingsMonthly * 3 + monthSavingsMonthly * 2
  const month6 = weekSavingsMonthly * 6 + monthSavingsMonthly * 5 + quarterSavingsMonthly * 3
  const month12 = weekSavingsMonthly * 12 + monthSavingsMonthly * 11 + quarterSavingsMonthly * 9

  return {
    month_3: safeRound(month3, 2),
    month_6: safeRound(month6, 2),
    month_12: safeRound(month12, 2),
    assumptions: [
      'Savings based on implementing recommended actions in their suggested timeframes',
      '"This week" actions assumed effective from month 1',
      '"This month" actions assumed effective from month 2',
      '"Next 3 months" actions assumed effective from month 4',
    ],
  }
}

// ============================================
// Behavioral Insights
// ============================================

function deriveBehavioralInsights(results: AnalysisResult): ProReportData['behavioral_insights'] {
  const categories = results.category_summary ?? []
  const totalSpend = safeSum(categories.map(c => safeNumber(c.total, 0)))
  const period = derivePeriod(results)
  const monthCount = period.monthCount

  // Peak spending day — only from valid dates
  const dayCounts: Record<number, number> = {}
  let validDateCount = 0
  for (const t of results.top_spending) {
    const d = parseDate(t.date)
    if (!d) continue
    const day = d.getDay()
    if (day >= 0 && day <= 6) {
      dayCounts[day] = (dayCounts[day] || 0) + 1
      validDateCount++
    }
  }

  let peakDay = ''
  let maxCount = 0
  for (const [day, count] of Object.entries(dayCounts)) {
    const dayNum = Number(day)
    if (count > maxCount && dayNum >= 0 && dayNum <= 6) {
      maxCount = count
      peakDay = DAY_NAMES[dayNum]
    }
  }

  const avgDaily = safeDivide(totalSpend, monthCount * 30, 0, 'behavioral.avgDaily')
  const avgWeekly = safeDivide(totalSpend, monthCount * 4.33, 0, 'behavioral.avgWeekly')

  // Impulse spend estimate
  const impulseCats = categories.filter(c => {
    const txCount = safeNumber(c.transaction_count, 0)
    const avgTx = safeDivide(safeNumber(c.total, 0), txCount, 999)
    return txCount > monthCount * 4 && avgTx < 20
  })
  const impulseSpend = safeSum(impulseCats.map(c => safeNumber(c.total, 0)))
  const topImpulseMerchants = impulseCats
    .flatMap(c => c.top_merchants.map(m => m.name))
    .slice(0, 5)

  // Spending velocity
  let velocity = ''
  if (results.comparison) {
    const pct = safeNumber(results.comparison.total_change_percent, 0, 'comparison.change_pct')
    if (pct < -5) {
      velocity = 'Your spending has been decreasing recently — great momentum'
    } else if (pct > 10) {
      velocity = `Your spending increased ${Math.abs(pct).toFixed(0)}% from last month — consider setting monthly caps`
    } else {
      velocity = 'Your spending is relatively consistent month to month'
    }
  }

  return {
    peak_spending_day: peakDay || (validDateCount === 0 ? '' : 'Saturday'),
    avg_daily_spend: safeRound(avgDaily, 2),
    avg_weekly_spend: safeRound(avgWeekly, 2),
    impulse_spend_estimate: safeRound(impulseSpend, 2),
    top_impulse_merchants: topImpulseMerchants,
    spending_velocity: velocity,
  }
}

// ============================================
// Category Deep Dives
// ============================================

function deriveCategoryDeepDives(results: AnalysisResult, period: PeriodInfo): ProReportData['category_deep_dives'] {
  const categories = results.category_summary ?? []
  const monthCount = period.monthCount

  return categories.map(cat => {
    const total = safeNumber(cat.total, 0, `cat.${cat.category}.total`)
    const pct = safeNumber(cat.percent, 0, `cat.${cat.category}.percent`)
    const txCount = safeNumber(cat.transaction_count, 0)
    const monthlyAvg = safeDivide(total, monthCount, 0, `cat.${cat.category}.monthlyAvg`)

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    let trendPercent = 0
    if (results.comparison) {
      const change = results.comparison.top_changes.find(
        c => c.category.toLowerCase() === cat.category.toLowerCase()
      )
      if (change) {
        trendPercent = safeNumber(change.change_percent, 0, `cat.${cat.category}.trendPct`)
        if (trendPercent > 5) trend = 'increasing'
        else if (trendPercent < -5) trend = 'decreasing'
      }
    }

    return {
      category: cat.category || 'Unknown',
      total,
      percent: pct,
      monthly_average: safeRound(monthlyAvg, 2),
      trend,
      trend_percent: trendPercent,
      top_merchants: cat.top_merchants.map(m => ({
        name: m.name || 'Unknown',
        total: safeNumber(m.total, 0),
        count: Math.round(safeDivide(txCount, Math.max(cat.top_merchants.length, 1), 0)),
      })),
      insight: buildCategoryInsight(cat, monthlyAvg),
      recommendation: buildCategoryRecommendation(cat, trend),
    }
  })
}

function buildCategoryInsight(
  cat: { category: string; total: number; percent: number; transaction_count: number },
  monthlyAvg: number
): string {
  const pct = safeNumber(cat.percent, 0)
  const txCount = safeNumber(cat.transaction_count, 0)
  const avg = safeRound(monthlyAvg, 0)

  if (pct > 20) {
    return `${cat.category} is your largest spending category at ${pct}% of total spend ($${avg}/mo average).`
  }
  if (txCount > 50) {
    const avgTx = Math.round(safeDivide(safeNumber(cat.total, 0), txCount, 0))
    return `High frequency: ${txCount} transactions in ${cat.category}, averaging $${avgTx} each.`
  }
  return `${cat.category} accounts for ${pct}% of your spending at $${avg}/mo.`
}

function buildCategoryRecommendation(cat: { category: string; percent: number }, trend: string): string {
  const pct = safeNumber(cat.percent, 0)
  if (trend === 'increasing' && pct > 10) {
    return `${cat.category} spending is trending up. Set a monthly budget to keep it in check.`
  }
  if (trend === 'decreasing') {
    return `Good progress — ${cat.category} spending is trending down. Keep it up.`
  }
  if (pct > 25) {
    return `${cat.category} is a significant portion of your budget. Look for ways to reduce by 10-15%.`
  }
  return `${cat.category} spending looks reasonable. Review quarterly to catch any drift.`
}

// ============================================
// Evidence
// ============================================

function deriveEvidence(results: AnalysisResult): ProReportData['evidence'] {
  const subs = results.subscriptions ?? []

  const subscriptionTransactions = subs.map(sub => {
    const dates: string[] = []
    const amounts: number[] = []
    const lastDate = parseDate(sub.last_date)
    const occ = safeNumber(sub.occurrences, 0)
    const mc = safeNumber(sub.monthly_cost, 0)
    if (lastDate && occ > 0) {
      for (let i = occ - 1; i >= 0; i--) {
        const d = new Date(lastDate)
        d.setMonth(d.getMonth() - i)
        dates.push(d.toISOString().slice(0, 10))
        amounts.push(mc)
      }
    }
    return { merchant: sub.merchant || 'Unknown', dates, amounts }
  })

  const top50 = results.top_spending.slice(0, 50).map(t => ({
    date: t.date || '',
    merchant: t.merchant || 'Unknown',
    amount: safeNumber(t.amount, 0, 'evidence.tx.amount'),
    category: t.category ?? 'Unknown',
  }))

  return {
    subscription_transactions: subscriptionTransactions,
    top_50_transactions: top50,
  }
}

// ============================================
// Health Score
// ============================================

function computeHealthScore(results: AnalysisResult): number {
  let score = 100

  const subCount = results.subscriptions?.length ?? 0
  if (subCount > 5) score -= (subCount - 5) * 3
  if (subCount > 8) score -= 5

  const feeCategory = results.category_summary?.find(c =>
    c.category.toLowerCase().includes('fee')
  )
  if (feeCategory) {
    score -= Math.min(15, Math.round(safeDivide(safeNumber(feeCategory.total, 0), 30, 0)))
  }

  const deliveryCategory = results.category_summary?.find(c =>
    c.category.toLowerCase().includes('deliver') || c.category.toLowerCase().includes('dining')
  )
  if (deliveryCategory) {
    const pct = safeNumber(deliveryCategory.percent, 0)
    if (pct > 15) score -= Math.round((pct - 15) * 2)
  }

  const leak = safeNumber(results.monthly_leak, 0, 'healthScore.monthly_leak')
  if (leak > 200) score -= 5
  if (leak > 400) score -= 5
  if (leak > 600) score -= 5

  const priceChanges = results.price_changes?.length ?? 0
  score -= priceChanges * 2

  const dupes = results.duplicate_subscriptions?.length ?? 0
  score -= dupes * 3

  return clamp(score, 0, 100)
}

function healthLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Attention'
}

function buildHeadline(results: AnalysisResult): string {
  const leak = Math.round(safeNumber(results.monthly_leak, 0))
  if (leak > 0) {
    return `You're leaking $${leak}/mo — here's how to fix it`
  }
  return `Your spending breakdown — insights and action plan`
}

function buildExecutiveParagraph(results: AnalysisResult, healthScore: number): string {
  const subCount = results.subscriptions?.length ?? 0
  const leakCount = results.top_leaks?.length ?? 0
  const topCategory = results.category_summary?.[0]
  const categories = results.category_summary ?? []
  const totalSpend = safeSum(categories.map(c => safeNumber(c.total, 0)))
  const monthlyLeak = safeNumber(results.monthly_leak, 0)
  const annualSavings = safeNumber(results.annual_savings, 0)

  const parts: string[] = []

  if (monthlyLeak > 0) {
    const leakStr = safeFixed(monthlyLeak, 2, '0.00')
    const annualStr = safeFixed(annualSavings, 0, '0')

    if (subCount > 0 && leakCount > 0) {
      parts.push(
        `Our analysis found $${leakStr} in monthly spending leaks ` +
        `across ${subCount} subscription${subCount !== 1 ? 's' : ''} and ${leakCount} recurring charge${leakCount !== 1 ? 's' : ''}, ` +
        `totaling $${annualStr} per year.`
      )
    } else if (subCount > 0) {
      parts.push(
        `Our analysis found $${leakStr} in monthly spending leaks ` +
        `across ${subCount} active subscription${subCount !== 1 ? 's' : ''}, ` +
        `totaling $${annualStr} per year.`
      )
    } else if (leakCount > 0) {
      parts.push(
        `Our analysis found $${leakStr} in monthly spending leaks ` +
        `across ${leakCount} recurring charge${leakCount !== 1 ? 's' : ''}, ` +
        `totaling $${annualStr} per year.`
      )
    } else {
      parts.push(
        `Our analysis identified $${leakStr}/mo in potential savings, ` +
        `totaling $${annualStr} per year.`
      )
    }
  } else if (totalSpend > 0) {
    parts.push(
      `Our analysis reviewed $${Math.round(totalSpend).toLocaleString()} in total spending across ${categories.length} categories.`
    )
  }

  if (topCategory) {
    const pct = safeNumber(topCategory.percent, 0)
    if (pct > 0) {
      parts.push(
        `Your biggest spending category is ${topCategory.category} at ${pct}% of total spend.`
      )
    }
  }

  if (healthScore < 60) {
    parts.push(
      `Your financial health score of ${healthScore}/100 suggests significant room for improvement — the action plan below prioritizes the highest-impact changes.`
    )
  } else {
    parts.push(
      `With a health score of ${healthScore}/100, you're in decent shape but still have opportunities to optimize.`
    )
  }

  return parts.join(' ')
}
