/**
 * Milestone C — LLM "Report QA" via Claude
 *
 * Claude does NOT change numbers. It can only:
 * - Flag suspicious relationships
 * - Request sections to be omitted
 * - Generate user-friendly explanations based on provided numbers
 *
 * The payload sent to Claude is a redacted summary (no raw transactions,
 * no PII, no full merchant strings, no dates more granular than month).
 *
 * Feature-flagged via NEXT_PUBLIC_REPORT_QA_ENABLED=true
 */

import type { ProReportData } from './proReportTypes'
import type { ValidationResult } from './reportValidation'

// ── Types ────────────────────────────────────────────────────

export interface QaCheck {
  rule: string
  result: 'ok' | 'warn' | 'fail'
  detail: string
}

export interface QaResult {
  pass: boolean
  severity: 'low' | 'medium' | 'high'
  omitSections: string[]
  notesForUser: string
  narrativeBullets: string[]
  checks: QaCheck[]
}

const OMITTABLE_SECTIONS = [
  'subscription_insights',
  'savings_projection',
  'action_plan',
  'behavioral_insights',
  'category_deep_dives',
  'monthly_trends',
] as const

// ── Feature flag ─────────────────────────────────────────────

export function isReportQaEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_REPORT_QA_ENABLED === 'true') {
    return true
  }
  return false
}

// ── Redacted summary builder ─────────────────────────────────

export interface RedactedSummary {
  monthCount: number
  totalSpendByMonth: Record<string, number>
  topCategories: Array<{ name: string; spend: number; percent: number }>
  topMerchants: Array<{ label: string; spend: number }>
  recurringGroups: Array<{ label: string; monthlyCost: number; confidence: string }>
  subscriptionCount: number
  actionCount: number
  totalProjectedSavings12mo: number
  healthScore: number
  healthLabel: string
  hasBehavioralData: boolean
  validationIssues: string[]
}

/**
 * Build a privacy-safe summary from report data + validation result.
 * No raw transactions, no PII, merchant names truncated to 15 chars.
 */
export function buildRedactedSummary(
  report: ProReportData,
  validation: ValidationResult,
): RedactedSummary {
  const totalSpendByMonth: Record<string, number> = {}
  for (const t of report.monthly_trends) {
    totalSpendByMonth[t.month] = Math.round(t.total_spend)
  }

  const topCategories = report.category_deep_dives
    .slice(0, 8)
    .map(c => ({
      name: c.category,
      spend: Math.round(c.total),
      percent: Math.round(c.percent),
    }))

  const topMerchants = report.category_deep_dives
    .flatMap(c => c.top_merchants)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(m => ({
      label: m.name.length > 15 ? m.name.slice(0, 12) + '...' : m.name,
      spend: Math.round(m.total),
    }))

  const recurringGroups = report.subscription_insights.map(s => ({
    label: s.merchant.length > 15 ? s.merchant.slice(0, 12) + '...' : s.merchant,
    monthlyCost: Math.round(s.monthly_cost * 100) / 100,
    confidence: s.usage_estimate,
  }))

  const validationIssues: string[] = []
  for (const section of validation.failedSections) {
    validationIssues.push(`Section "${section}" had schema validation errors`)
  }
  for (const v of validation.invariantViolations) {
    validationIssues.push(`[${v.severity}] ${v.rule}: ${v.message}`)
  }

  return {
    monthCount: report.monthly_trends.length,
    totalSpendByMonth,
    topCategories,
    topMerchants,
    recurringGroups,
    subscriptionCount: report.subscription_insights.length,
    actionCount: report.action_plan.length,
    totalProjectedSavings12mo: Math.round(report.savings_projection.month_12),
    healthScore: report.executive_summary.health_score,
    healthLabel: report.executive_summary.health_label,
    hasBehavioralData: report.behavioral_insights.avg_daily_spend > 0,
    validationIssues,
  }
}

// ── Claude QA call ───────────────────────────────────────────

const QA_SYSTEM_PROMPT = `You are a financial report quality auditor. You receive a REDACTED statistical summary of a consumer spending report (no raw transactions, no PII).

Your job:
1. Check if the numbers are internally consistent and plausible.
2. Flag any section that should be OMITTED from the final PDF because the data backing it is clearly insufficient or contradictory.
3. Provide brief user-friendly notes.

RULES:
- You MUST NOT invent or change any numbers.
- You MUST NOT reference specific transactions, dates, or personal details.
- If subscription count is 0 but the report mentions subscription costs, flag it.
- If health score doesn't match the label range, flag it.
- If projected savings are unrealistically high (>50% of total spend), flag it.
- If any category percent sums are wildly off from 100%, flag it.
- If monthly trends show 0 spend for all months, omit that section.

Respond with ONLY valid JSON matching this exact schema:
{
  "pass": boolean,
  "severity": "low" | "medium" | "high",
  "omitSections": string[],
  "notesForUser": string,
  "narrativeBullets": string[],
  "checks": [{"rule": string, "result": "ok" | "warn" | "fail", "detail": string}]
}

omitSections values must be from: ${OMITTABLE_SECTIONS.join(', ')}
Keep notesForUser under 200 characters.
narrativeBullets should be 2-5 plain-English bullet points summarizing key findings.`

/**
 * Call Claude API to QA-check the report summary.
 * Returns a default "pass" result on timeout, parse failure, or disabled flag.
 */
export async function runReportQa(
  report: ProReportData,
  validation: ValidationResult,
): Promise<QaResult> {
  if (!isReportQaEnabled()) {
    return defaultPassResult('QA disabled by feature flag')
  }

  const summary = buildRedactedSummary(report, validation)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

    const response = await fetch('/api/report-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.warn('[ReportQA] API returned', response.status)
      return defaultPassResult(`API error ${response.status}`)
    }

    const data = await response.json()
    return parseQaResponse(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[ReportQA] Failed:', msg)
    return defaultPassResult(`QA call failed: ${msg}`)
  }
}

// ── Response parsing ─────────────────────────────────────────

function parseQaResponse(data: unknown): QaResult {
  if (!data || typeof data !== 'object') {
    return defaultPassResult('Invalid QA response shape')
  }

  const d = data as Record<string, unknown>

  const pass = typeof d.pass === 'boolean' ? d.pass : true
  const severity = parseSeverity(d.severity)
  const omitSections = parseOmitSections(d.omitSections)
  const notesForUser = typeof d.notesForUser === 'string' ? d.notesForUser.slice(0, 500) : ''
  const narrativeBullets = parseStringArray(d.narrativeBullets, 10)
  const checks = parseChecks(d.checks)

  return { pass, severity, omitSections, notesForUser, narrativeBullets, checks }
}

function parseSeverity(v: unknown): 'low' | 'medium' | 'high' {
  if (v === 'low' || v === 'medium' || v === 'high') return v
  return 'low'
}

function parseOmitSections(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  const valid = new Set<string>(OMITTABLE_SECTIONS)
  return v.filter(s => typeof s === 'string' && valid.has(s))
}

function parseStringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return []
  return v.filter(s => typeof s === 'string').slice(0, max)
}

function parseChecks(v: unknown): QaCheck[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((c): c is Record<string, unknown> => c !== null && typeof c === 'object')
    .map(c => {
      const result: 'ok' | 'warn' | 'fail' =
        c.result === 'ok' || c.result === 'warn' || c.result === 'fail' ? c.result : 'ok'
      return {
        rule: typeof c.rule === 'string' ? c.rule : 'unknown',
        result,
        detail: typeof c.detail === 'string' ? c.detail : '',
      }
    })
    .slice(0, 20)
}

function defaultPassResult(reason: string): QaResult {
  return {
    pass: true,
    severity: 'low',
    omitSections: [],
    notesForUser: '',
    narrativeBullets: [],
    checks: [{ rule: 'qa_skipped', result: 'ok', detail: reason }],
  }
}

// ── Apply QA results to report ───────────────────────────────

export interface QualityGateOutput {
  report: ProReportData
  omittedSections: string[]
  qaResult: QaResult
  isSafeMode: boolean
}

/**
 * Apply QA omission decisions to a validated report.
 * If pass=false or severity=high, switches to Safe Report mode.
 */
export function applyQaResult(
  safeData: ProReportData,
  qaResult: QaResult,
  failedSections: string[],
): QualityGateOutput {
  const isSafeMode = !qaResult.pass || qaResult.severity === 'high'
  const allOmissions = new Set([...qaResult.omitSections, ...failedSections])

  // Deep clone to avoid mutation
  const report: ProReportData = JSON.parse(JSON.stringify(safeData))

  if (allOmissions.has('subscription_insights')) {
    report.subscription_insights = []
  }
  if (allOmissions.has('savings_projection')) {
    report.savings_projection = { month_3: 0, month_6: 0, month_12: 0, assumptions: [] }
  }
  if (allOmissions.has('action_plan')) {
    report.action_plan = []
  }
  if (allOmissions.has('behavioral_insights')) {
    report.behavioral_insights = {
      peak_spending_day: '',
      avg_daily_spend: 0,
      avg_weekly_spend: 0,
      impulse_spend_estimate: 0,
      top_impulse_merchants: [],
      spending_velocity: '',
    }
  }
  if (allOmissions.has('category_deep_dives')) {
    report.category_deep_dives = []
  }
  if (allOmissions.has('monthly_trends')) {
    report.monthly_trends = []
  }

  return {
    report,
    omittedSections: Array.from(allOmissions),
    qaResult,
    isSafeMode,
  }
}
