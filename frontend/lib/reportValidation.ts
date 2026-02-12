/**
 * Milestone B — Report Validation Gate
 *
 * Zod schema for ProReportData + invariant checks.
 * Validates the generated report and produces a `safeData` subset
 * with only the sections that passed validation.
 */

import { z } from 'zod'
import type { ProReportData } from './proReportTypes'

// ── Zod schemas ─────────────────────────────────────────────

/** Finite number (not NaN, not Infinity) */
const finiteNumber = z.number().refine(Number.isFinite, { message: 'Must be finite (no NaN/Infinity)' })

/** Non-empty trimmed string */
const nonEmpty = z.string().min(1).refine(s => s.trim().length > 0, { message: 'Must not be empty/whitespace' })

/** String that does not contain "NaN", "undefined", or "Infinity" */
const cleanString = z.string().refine(
  s => !s.includes('NaN') && !s.includes('undefined') && !s.includes('Infinity'),
  { message: 'String contains NaN/undefined/Infinity' }
)

const TopMerchantSchema = z.object({
  name: nonEmpty,
  total: finiteNumber,
  count: finiteNumber,
})

const MonthlyTrendSchema = z.object({
  month: nonEmpty.pipe(cleanString).refine(
    m => /^\d{4}-\d{2}$/.test(m),
    { message: 'Month must be YYYY-MM format' }
  ),
  total_spend: finiteNumber.refine(n => n >= 0, { message: 'total_spend must be >= 0' }),
  by_category: z.record(z.string(), finiteNumber),
})

const SubscriptionInsightSchema = z.object({
  merchant: nonEmpty,
  monthly_cost: finiteNumber.refine(n => n >= 0, { message: 'monthly_cost must be >= 0' }),
  annual_cost: finiteNumber.refine(n => n >= 0, { message: 'annual_cost must be >= 0' }),
  usage_estimate: z.enum(['High', 'Medium', 'Low', 'Unknown']),
  roi_label: z.enum(['Good value', 'Review usage', 'Consider cancelling']),
  recommendation: nonEmpty,
})

const ActionPlanItemSchema = z.object({
  priority: finiteNumber.refine(n => n >= 1, { message: 'priority must be >= 1' }),
  title: nonEmpty,
  description: z.string(),
  estimated_monthly_savings: finiteNumber.refine(n => n >= 0, { message: 'savings must be >= 0' }),
  estimated_yearly_savings: finiteNumber.refine(n => n >= 0, { message: 'savings must be >= 0' }),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeframe: nonEmpty,
  category: z.string(),
})

const CategoryDeepDiveSchema = z.object({
  category: nonEmpty,
  total: finiteNumber.refine(n => n >= 0, { message: 'total must be >= 0' }),
  percent: finiteNumber.refine(n => n >= 0 && n <= 100, { message: 'percent must be 0-100' }),
  monthly_average: finiteNumber.refine(n => n >= 0, { message: 'monthly_average must be >= 0' }),
  trend: z.enum(['increasing', 'decreasing', 'stable']),
  trend_percent: finiteNumber,
  top_merchants: z.array(TopMerchantSchema),
  insight: nonEmpty,
  recommendation: nonEmpty,
})

const EvidenceTransactionSchema = z.object({
  date: z.string(),
  merchant: nonEmpty,
  amount: finiteNumber,
  category: z.string(),
})

const SubscriptionTransactionSchema = z.object({
  merchant: nonEmpty,
  dates: z.array(z.string()),
  amounts: z.array(finiteNumber),
})

const ExecutiveSummarySchema = z.object({
  headline: nonEmpty.pipe(cleanString),
  paragraph: nonEmpty.pipe(cleanString),
  health_score: finiteNumber.refine(n => n >= 0 && n <= 100, { message: 'health_score must be 0-100' }),
  health_label: z.enum(['Needs Attention', 'Fair', 'Good', 'Excellent']),
})

const SavingsProjectionSchema = z.object({
  month_3: finiteNumber.refine(n => n >= 0, { message: 'month_3 must be >= 0' }),
  month_6: finiteNumber.refine(n => n >= 0, { message: 'month_6 must be >= 0' }),
  month_12: finiteNumber.refine(n => n >= 0, { message: 'month_12 must be >= 0' }),
  assumptions: z.array(z.string()),
})

const BehavioralInsightsSchema = z.object({
  peak_spending_day: z.string(),
  avg_daily_spend: finiteNumber.refine(n => n >= 0, { message: 'avg_daily_spend must be >= 0' }),
  avg_weekly_spend: finiteNumber.refine(n => n >= 0, { message: 'avg_weekly_spend must be >= 0' }),
  impulse_spend_estimate: finiteNumber.refine(n => n >= 0, { message: 'impulse_spend_estimate must be >= 0' }),
  top_impulse_merchants: z.array(z.string()),
  spending_velocity: z.string(),
})

const EvidenceSchema = z.object({
  subscription_transactions: z.array(SubscriptionTransactionSchema),
  top_50_transactions: z.array(EvidenceTransactionSchema),
})

/** Full ProReportData schema — validates every field */
export const ProReportSchema = z.object({
  generated_at: nonEmpty,
  period: z.object({
    start: nonEmpty,
    end: nonEmpty,
  }),
  executive_summary: ExecutiveSummarySchema,
  monthly_trends: z.array(MonthlyTrendSchema),
  subscription_insights: z.array(SubscriptionInsightSchema),
  savings_projection: SavingsProjectionSchema,
  action_plan: z.array(ActionPlanItemSchema),
  behavioral_insights: BehavioralInsightsSchema,
  category_deep_dives: z.array(CategoryDeepDiveSchema),
  evidence: EvidenceSchema,
})

// ── Invariant checks ────────────────────────────────────────

export interface InvariantViolation {
  rule: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * Cross-field invariant checks that go beyond schema shape.
 * These catch logical contradictions like "0 subs but $500 sub cost".
 */
export function checkInvariants(report: ProReportData): InvariantViolation[] {
  const violations: InvariantViolation[] = []

  // 1. If subscription_insights is empty, executive_summary shouldn't mention subscriptions with a count
  if (report.subscription_insights.length === 0) {
    if (/\d+\s+(active\s+)?subscription/i.test(report.executive_summary.paragraph)) {
      violations.push({
        rule: 'no_subs_but_mentions_subs',
        message: `Executive summary mentions subscriptions but subscription_insights is empty`,
        severity: 'warning',
      })
    }
  }

  // 2. Savings projection should be monotonically increasing (month_3 <= month_6 <= month_12)
  const sp = report.savings_projection
  if (sp.month_3 > sp.month_6 || sp.month_6 > sp.month_12) {
    violations.push({
      rule: 'savings_not_monotonic',
      message: `Savings projection not monotonic: 3mo=$${sp.month_3}, 6mo=$${sp.month_6}, 12mo=$${sp.month_12}`,
      severity: 'error',
    })
  }

  // 3. Health score should match its label
  const hs = report.executive_summary.health_score
  const hl = report.executive_summary.health_label
  const expectedLabel = hs >= 80 ? 'Excellent' : hs >= 60 ? 'Good' : hs >= 40 ? 'Fair' : 'Needs Attention'
  if (hl !== expectedLabel) {
    violations.push({
      rule: 'health_label_mismatch',
      message: `Health score ${hs} should have label "${expectedLabel}" but got "${hl}"`,
      severity: 'error',
    })
  }

  // 4. Action plan priorities should be contiguous 1..N
  const priorities = report.action_plan.map(a => a.priority).sort((a, b) => a - b)
  for (let i = 0; i < priorities.length; i++) {
    if (priorities[i] !== i + 1) {
      violations.push({
        rule: 'action_priorities_not_contiguous',
        message: `Action plan priorities not contiguous: expected ${i + 1} but got ${priorities[i]}`,
        severity: 'warning',
      })
      break
    }
  }

  // 5. Monthly trends months should be unique
  const monthSet = new Set(report.monthly_trends.map(t => t.month))
  if (monthSet.size !== report.monthly_trends.length) {
    violations.push({
      rule: 'duplicate_trend_months',
      message: `Monthly trends contain duplicate months`,
      severity: 'error',
    })
  }

  // 6. Category percentages should approximately sum to ~100% if categories exist
  if (report.category_deep_dives.length > 0) {
    const pctSum = report.category_deep_dives.reduce((s, c) => s + c.percent, 0)
    if (pctSum > 0 && (pctSum < 85 || pctSum > 115)) {
      violations.push({
        rule: 'category_percent_sum_off',
        message: `Category percentages sum to ${pctSum.toFixed(1)}% (expected ~100%)`,
        severity: 'warning',
      })
    }
  }

  // 7. Sub monthly * 12 should approximately equal annual
  for (const sub of report.subscription_insights) {
    const expectedAnnual = sub.monthly_cost * 12
    if (expectedAnnual > 0 && Math.abs(sub.annual_cost - expectedAnnual) / expectedAnnual > 0.01) {
      violations.push({
        rule: 'sub_annual_mismatch',
        message: `${sub.merchant}: annual_cost $${sub.annual_cost} != monthly_cost $${sub.monthly_cost} * 12 = $${expectedAnnual}`,
        severity: 'warning',
      })
    }
  }

  // 8. Action plan yearly should be ~monthly * 12
  for (const action of report.action_plan) {
    const expectedYearly = action.estimated_monthly_savings * 12
    if (expectedYearly > 0 && Math.abs(action.estimated_yearly_savings - expectedYearly) / expectedYearly > 0.15) {
      violations.push({
        rule: 'action_yearly_mismatch',
        message: `"${action.title}": yearly $${action.estimated_yearly_savings} doesn't match monthly $${action.estimated_monthly_savings} * 12 = $${expectedYearly}`,
        severity: 'warning',
      })
    }
  }

  // 9. Paragraph should not contain "$NaN", "$0.00 in monthly" for non-zero leak
  if (report.executive_summary.paragraph.includes('$NaN') ||
      report.executive_summary.paragraph.includes('$undefined')) {
    violations.push({
      rule: 'paragraph_contains_bad_values',
      message: `Executive paragraph contains $NaN or $undefined`,
      severity: 'error',
    })
  }

  // 10. Period end should be >= period start
  if (report.period.start > report.period.end) {
    violations.push({
      rule: 'period_inverted',
      message: `Period start (${report.period.start}) is after end (${report.period.end})`,
      severity: 'error',
    })
  }

  return violations
}

// ── Validation Result ───────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  schemaErrors: z.ZodIssue[]
  invariantViolations: InvariantViolation[]
  /** Sections that failed and should be omitted from the PDF */
  failedSections: string[]
  /** A copy of the report with invalid sections replaced by safe defaults */
  safeData: ProReportData
}

// ── Section-level validation ────────────────────────────────

/**
 * Validate an individual section, returning true if it passes.
 * This allows partial reports — a bad section gets omitted rather
 * than killing the whole report.
 */
function validateSection<T>(schema: z.ZodType<T>, data: unknown): { ok: boolean; issues: z.ZodIssue[] } {
  const result = schema.safeParse(data)
  if (result.success) return { ok: true, issues: [] }
  return { ok: false, issues: result.error.issues }
}

// ── Safe defaults ───────────────────────────────────────────

const SAFE_BEHAVIORAL: ProReportData['behavioral_insights'] = {
  peak_spending_day: '',
  avg_daily_spend: 0,
  avg_weekly_spend: 0,
  impulse_spend_estimate: 0,
  top_impulse_merchants: [],
  spending_velocity: '',
}

const SAFE_SAVINGS: ProReportData['savings_projection'] = {
  month_3: 0,
  month_6: 0,
  month_12: 0,
  assumptions: [],
}

const SAFE_EXECUTIVE: ProReportData['executive_summary'] = {
  headline: 'Your Spending Analysis',
  paragraph: 'Review the details below for a complete breakdown of your spending patterns.',
  health_score: 50,
  health_label: 'Fair',
}

const SAFE_EVIDENCE: ProReportData['evidence'] = {
  subscription_transactions: [],
  top_50_transactions: [],
}

// ── Main validation gate ────────────────────────────────────

/**
 * Validate a ProReportData object. Returns a ValidationResult with:
 * - `valid`: true if everything passed
 * - `schemaErrors`: all Zod issues found
 * - `invariantViolations`: logical contradictions found
 * - `failedSections`: names of sections that failed
 * - `safeData`: the report with invalid sections replaced by safe defaults
 *
 * Usage:
 * ```ts
 * const { safeData, valid, failedSections } = validateReportData(report)
 * if (!valid) console.warn('Report had issues:', failedSections)
 * // Always use safeData for PDF generation
 * generateProPdf(safeData)
 * ```
 */
export function validateReportData(report: ProReportData): ValidationResult {
  const allIssues: z.ZodIssue[] = []
  const failedSections: string[] = []

  // Deep clone so we can safely mutate
  const safeData: ProReportData = JSON.parse(JSON.stringify(report))

  // --- Executive Summary ---
  const execResult = validateSection(ExecutiveSummarySchema, safeData.executive_summary)
  if (!execResult.ok) {
    failedSections.push('executive_summary')
    allIssues.push(...execResult.issues)
    safeData.executive_summary = SAFE_EXECUTIVE
  }

  // --- Monthly Trends (filter invalid entries) ---
  const validTrends = safeData.monthly_trends.filter(t => {
    const r = validateSection(MonthlyTrendSchema, t)
    if (!r.ok) allIssues.push(...r.issues)
    return r.ok
  })
  if (validTrends.length !== safeData.monthly_trends.length) {
    failedSections.push('monthly_trends')
  }
  safeData.monthly_trends = validTrends

  // --- Subscription Insights (filter invalid entries) ---
  const validSubs = safeData.subscription_insights.filter(s => {
    const r = validateSection(SubscriptionInsightSchema, s)
    if (!r.ok) allIssues.push(...r.issues)
    return r.ok
  })
  if (validSubs.length !== safeData.subscription_insights.length) {
    failedSections.push('subscription_insights')
  }
  safeData.subscription_insights = validSubs

  // --- Savings Projection ---
  const savingsResult = validateSection(SavingsProjectionSchema, safeData.savings_projection)
  if (!savingsResult.ok) {
    failedSections.push('savings_projection')
    allIssues.push(...savingsResult.issues)
    safeData.savings_projection = SAFE_SAVINGS
  }

  // --- Action Plan (filter invalid entries) ---
  const validActions = safeData.action_plan.filter(a => {
    const r = validateSection(ActionPlanItemSchema, a)
    if (!r.ok) allIssues.push(...r.issues)
    return r.ok
  })
  if (validActions.length !== safeData.action_plan.length) {
    failedSections.push('action_plan')
  }
  safeData.action_plan = validActions

  // --- Behavioral Insights ---
  const behavioralResult = validateSection(BehavioralInsightsSchema, safeData.behavioral_insights)
  if (!behavioralResult.ok) {
    failedSections.push('behavioral_insights')
    allIssues.push(...behavioralResult.issues)
    safeData.behavioral_insights = SAFE_BEHAVIORAL
  }

  // --- Category Deep Dives (filter invalid entries) ---
  const validCats = safeData.category_deep_dives.filter(c => {
    const r = validateSection(CategoryDeepDiveSchema, c)
    if (!r.ok) allIssues.push(...r.issues)
    return r.ok
  })
  if (validCats.length !== safeData.category_deep_dives.length) {
    failedSections.push('category_deep_dives')
  }
  safeData.category_deep_dives = validCats

  // --- Evidence ---
  const evidenceResult = validateSection(EvidenceSchema, safeData.evidence)
  if (!evidenceResult.ok) {
    failedSections.push('evidence')
    allIssues.push(...evidenceResult.issues)
    safeData.evidence = SAFE_EVIDENCE
  }

  // --- Invariant checks on the (already-patched) safeData ---
  const invariantViolations = checkInvariants(safeData)

  const valid = allIssues.length === 0 && invariantViolations.filter(v => v.severity === 'error').length === 0

  return {
    valid,
    schemaErrors: allIssues,
    invariantViolations,
    failedSections,
    safeData,
  }
}
