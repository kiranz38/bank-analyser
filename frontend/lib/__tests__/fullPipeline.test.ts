import { describe, it, expect } from 'vitest'
import { generateProReportWithWarnings } from '../proReportGenerator'
import { validateReportData } from '../reportValidation'
import { applyQaResult, type QaResult } from '../reportQaClaude'
import type { AnalysisResult } from '../types'

/**
 * Full pipeline integration tests:
 * generate -> validate -> QA apply -> verify no NaN/Infinity
 *
 * These simulate the exact flow in ResultCards.generateAndDeliver(),
 * minus the actual Claude API call (which is feature-flagged off).
 */

// ── Deep NaN scanner ──

function findBadValues(obj: unknown, path = ''): string[] {
  const bad: string[] = []
  if (obj === null || obj === undefined) return bad

  if (typeof obj === 'number') {
    if (Number.isNaN(obj)) bad.push(`${path} is NaN`)
    if (!Number.isFinite(obj)) bad.push(`${path} is non-finite (${obj})`)
    return bad
  }

  if (typeof obj === 'string') {
    if (obj.includes('NaN')) bad.push(`${path} contains "NaN": "${obj.slice(0, 60)}"`)
    if (obj.includes('$NaN')) bad.push(`${path} contains "$NaN": "${obj.slice(0, 60)}"`)
    if (obj.includes('undefined') && !obj.includes('not undefined')) bad.push(`${path} contains "undefined": "${obj.slice(0, 60)}"`)
    if (obj.includes('Infinity')) bad.push(`${path} contains "Infinity": "${obj.slice(0, 60)}"`)
    return bad
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => bad.push(...findBadValues(item, `${path}[${i}]`)))
    return bad
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      bad.push(...findBadValues(value, path ? `${path}.${key}` : key))
    }
  }

  return bad
}

// ── Default QA pass result (simulates disabled feature flag) ──

const QA_PASS: QaResult = {
  pass: true,
  severity: 'low',
  omitSections: [],
  notesForUser: '',
  narrativeBullets: [],
  checks: [{ rule: 'qa_skipped', result: 'ok', detail: 'QA disabled by feature flag' }],
}

// ── Test fixtures ──

const MINIMAL_RESULT: AnalysisResult = {
  monthly_leak: 0,
  annual_savings: 0,
  top_leaks: [],
  top_spending: [],
  easy_wins: [],
  recovery_plan: [],
  disclaimer: '',
}

const REALISTIC_RESULT: AnalysisResult = {
  monthly_leak: 487,
  annual_savings: 5844,
  top_leaks: [
    { category: 'Streaming', merchant: 'NETFLIX', monthly_cost: 15.99, yearly_cost: 191.88, explanation: 'Monthly', date: '2024-06-15', last_date: '2024-11-15' },
    { category: 'Food Delivery', merchant: 'DOORDASH', monthly_cost: 120, yearly_cost: 1440, explanation: 'Frequent delivery', date: '2024-10-01', last_date: '2024-11-20' },
  ],
  top_spending: [
    { date: '2024-11-15', merchant: 'RENT', amount: 2000, category: 'Housing' },
    { date: '2024-11-10', merchant: 'KROGER', amount: 180, category: 'Groceries' },
    { date: '2024-10-22', merchant: 'AMAZON', amount: 89.99, category: 'Shopping' },
  ],
  easy_wins: [
    { title: 'Cancel unused streaming', estimated_yearly_savings: 191.88, action: 'Cancel Netflix' },
    { title: 'Reduce food delivery', estimated_yearly_savings: 720, action: 'Set a weekly delivery budget' },
  ],
  recovery_plan: ['Cancel low-use subscriptions'],
  disclaimer: 'AI generated',
  category_summary: [
    { category: 'Housing', total: 24000, percent: 55, transaction_count: 12, top_merchants: [{ name: 'RENT', total: 24000 }] },
    { category: 'Food', total: 6000, percent: 14, transaction_count: 120, top_merchants: [{ name: 'KROGER', total: 3500 }] },
    { category: 'Shopping', total: 2400, percent: 5.5, transaction_count: 30, top_merchants: [{ name: 'AMAZON', total: 1500 }] },
  ],
  subscriptions: [
    { merchant: 'NETFLIX', monthly_cost: 15.99, annual_cost: 191.88, confidence: 0.95, last_date: '2024-11-15', occurrences: 12, reason: 'Monthly charge' },
    { merchant: 'SPOTIFY', monthly_cost: 10.99, annual_cost: 131.88, confidence: 0.9, last_date: '2024-11-10', occurrences: 12, reason: 'Monthly charge' },
  ],
  comparison: {
    previous_month: '2024-10',
    current_month: '2024-11',
    previous_total: 3800,
    current_total: 4200,
    total_change: 400,
    total_change_percent: 10.5,
    top_changes: [{ category: 'Food', previous: 450, current: 600, change: 150, change_percent: 33.3 }],
    spikes: [],
    months_analyzed: 12,
  },
}

/** WpStat-like: very sparse data, no subs, minimal categories */
const SPARSE_RESULT: AnalysisResult = {
  monthly_leak: 0,
  annual_savings: 0,
  top_leaks: [],
  top_spending: [
    { date: '2024-01-15', merchant: 'VENDOR A', amount: 500 },
    { date: '2024-02-20', merchant: 'VENDOR B', amount: 300 },
  ],
  easy_wins: [],
  recovery_plan: [],
  disclaimer: '',
  category_summary: [
    { category: 'Business', total: 800, percent: 100, transaction_count: 2, top_merchants: [{ name: 'VENDOR A', total: 500 }, { name: 'VENDOR B', total: 300 }] },
  ],
}

const POISON_RESULT: AnalysisResult = {
  monthly_leak: NaN,
  annual_savings: NaN,
  top_leaks: [
    { category: '', merchant: '', monthly_cost: NaN, yearly_cost: NaN, explanation: '', date: '', last_date: '' },
  ],
  top_spending: [
    { date: '', merchant: '', amount: NaN, category: undefined as unknown as string },
  ],
  easy_wins: [
    { title: '', estimated_yearly_savings: NaN, action: '' },
  ],
  recovery_plan: [],
  disclaimer: '',
  category_summary: [
    { category: 'Test', total: NaN, percent: NaN, transaction_count: 0, top_merchants: [{ name: '', total: NaN }] },
  ],
  subscriptions: [
    { merchant: '', monthly_cost: NaN, annual_cost: NaN, confidence: NaN, last_date: '', occurrences: NaN, reason: '' },
  ],
  comparison: {
    previous_month: '',
    current_month: '',
    previous_total: NaN,
    current_total: NaN,
    total_change: NaN,
    total_change_percent: NaN,
    top_changes: [{ category: 'Test', previous: NaN, current: NaN, change: NaN, change_percent: NaN }],
    spikes: [],
    months_analyzed: NaN,
  },
}

describe('Full Pipeline Integration', () => {
  const runPipeline = (input: AnalysisResult, qaOverride?: Partial<QaResult>) => {
    // Step 1: Generate
    const { report, warnings } = generateProReportWithWarnings(input)
    // Step 2: Validate
    const validation = validateReportData(report)
    // Step 3: Apply QA (simulated)
    const qaResult: QaResult = { ...QA_PASS, ...qaOverride }
    const output = applyQaResult(validation.safeData, qaResult, validation.failedSections)

    return { report: output.report, validation, warnings, output }
  }

  it('realistic data → zero NaN in final report', () => {
    const { report } = runPipeline(REALISTIC_RESULT)
    const bad = findBadValues(report)
    expect(bad).toEqual([])
  })

  it('minimal empty data → zero NaN in final report', () => {
    const { report } = runPipeline(MINIMAL_RESULT)
    const bad = findBadValues(report)
    expect(bad).toEqual([])
  })

  it('sparse data (WpStat-like) → zero NaN, no subscription nonsense', () => {
    const { report } = runPipeline(SPARSE_RESULT)
    const bad = findBadValues(report)
    expect(bad).toEqual([])

    // No subscriptions should appear
    expect(report.subscription_insights).toEqual([])

    // Executive summary should NOT mention subscriptions
    const para = report.executive_summary.paragraph.toLowerCase()
    expect(para).not.toMatch(/\d+ subscription/)

    // Health score should be valid
    expect(report.executive_summary.health_score).toBeGreaterThanOrEqual(0)
    expect(report.executive_summary.health_score).toBeLessThanOrEqual(100)
  })

  it('poison data → zero NaN after full pipeline', () => {
    const { report, warnings, validation } = runPipeline(POISON_RESULT)
    const bad = findBadValues(report)
    expect(bad).toEqual([])

    // Should have collected warnings
    expect(warnings.length).toBeGreaterThan(0)

    // All numeric values should be finite
    expect(Number.isFinite(report.executive_summary.health_score)).toBe(true)
    expect(Number.isFinite(report.savings_projection.month_3)).toBe(true)
    expect(Number.isFinite(report.savings_projection.month_6)).toBe(true)
    expect(Number.isFinite(report.savings_projection.month_12)).toBe(true)
    expect(Number.isFinite(report.behavioral_insights.avg_daily_spend)).toBe(true)
  })

  it('QA omits sections correctly in full pipeline', () => {
    const { report, output } = runPipeline(REALISTIC_RESULT, {
      pass: false,
      severity: 'high',
      omitSections: ['subscription_insights', 'behavioral_insights'],
    })

    expect(output.isSafeMode).toBe(true)
    expect(report.subscription_insights).toEqual([])
    expect(report.behavioral_insights.avg_daily_spend).toBe(0)
    // Executive summary and categories should survive
    expect(report.executive_summary.headline.length).toBeGreaterThan(0)
    expect(report.category_deep_dives.length).toBeGreaterThan(0)
  })

  it('validation failures cause sections to be dropped', () => {
    const { report: rawReport } = generateProReportWithWarnings(REALISTIC_RESULT)
    // Inject bad data into subscription_insights
    rawReport.subscription_insights.push({
      merchant: '', // empty = invalid
      monthly_cost: NaN,
      annual_cost: NaN,
      usage_estimate: 'Unknown',
      roi_label: 'Review usage',
      recommendation: 'test',
    })

    const validation = validateReportData(rawReport)
    expect(validation.failedSections).toContain('subscription_insights')

    const output = applyQaResult(validation.safeData, QA_PASS, validation.failedSections)
    // The invalid subscription was filtered out, valid ones remain
    for (const sub of output.report.subscription_insights) {
      expect(sub.merchant.length).toBeGreaterThan(0)
      expect(Number.isFinite(sub.monthly_cost)).toBe(true)
    }
  })

  it('executive summary never contains $NaN or $undefined in any scenario', () => {
    const scenarios = [MINIMAL_RESULT, REALISTIC_RESULT, SPARSE_RESULT, POISON_RESULT]
    for (const input of scenarios) {
      const { report } = runPipeline(input)
      const exec = report.executive_summary
      expect(exec.headline).not.toContain('NaN')
      expect(exec.headline).not.toContain('undefined')
      expect(exec.paragraph).not.toContain('NaN')
      expect(exec.paragraph).not.toContain('undefined')
      expect(exec.paragraph).not.toContain('$NaN')
    }
  })

  it('health label matches health score in all scenarios', () => {
    const scenarios = [MINIMAL_RESULT, REALISTIC_RESULT, SPARSE_RESULT, POISON_RESULT]
    for (const input of scenarios) {
      const { report } = runPipeline(input)
      const { health_score: hs, health_label: hl } = report.executive_summary
      const expected = hs >= 80 ? 'Excellent' : hs >= 60 ? 'Good' : hs >= 40 ? 'Fair' : 'Needs Attention'
      expect(hl).toBe(expected)
    }
  })

  it('savings projection is monotonically non-decreasing', () => {
    const scenarios = [MINIMAL_RESULT, REALISTIC_RESULT, SPARSE_RESULT, POISON_RESULT]
    for (const input of scenarios) {
      const { report } = runPipeline(input)
      const sp = report.savings_projection
      expect(sp.month_3).toBeLessThanOrEqual(sp.month_6)
      expect(sp.month_6).toBeLessThanOrEqual(sp.month_12)
    }
  })
})
