import { describe, it, expect } from 'vitest'
import { generateProReportWithWarnings } from '../proReportGenerator'
import type { AnalysisResult } from '../types'

// ── Helper: recursively check an object for NaN/Infinity ──

function findBadValues(obj: unknown, path = ''): string[] {
  const bad: string[] = []
  if (obj === null || obj === undefined) return bad

  if (typeof obj === 'number') {
    if (Number.isNaN(obj)) bad.push(`${path} is NaN`)
    if (!Number.isFinite(obj)) bad.push(`${path} is non-finite (${obj})`)
    return bad
  }

  if (typeof obj === 'string') {
    if (obj.includes('NaN')) bad.push(`${path} contains "NaN" in string: "${obj.slice(0, 80)}"`)
    if (obj.includes('undefined')) bad.push(`${path} contains "undefined" in string: "${obj.slice(0, 80)}"`)
    if (obj.includes('Infinity')) bad.push(`${path} contains "Infinity" in string: "${obj.slice(0, 80)}"`)
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

// ── Minimal valid result ──

const MINIMAL_RESULT: AnalysisResult = {
  monthly_leak: 0,
  annual_savings: 0,
  top_leaks: [],
  top_spending: [],
  easy_wins: [],
  recovery_plan: [],
  disclaimer: '',
}

// ── Poison result: every optional field is NaN/undefined/empty ──

const POISON_RESULT: AnalysisResult = {
  monthly_leak: NaN,
  annual_savings: NaN,
  top_leaks: [
    { category: '', merchant: '', monthly_cost: NaN, yearly_cost: NaN, explanation: '', date: '', last_date: '' },
  ],
  top_spending: [
    { date: '', merchant: '', amount: NaN, category: undefined as unknown as string },
    { date: 'not-a-date', merchant: 'STORE', amount: undefined as unknown as number },
  ],
  easy_wins: [
    { title: '', estimated_yearly_savings: NaN, action: '' },
  ],
  recovery_plan: [],
  disclaimer: '',
  category_summary: [
    { category: 'Test', total: NaN, percent: NaN, transaction_count: 0, top_merchants: [{ name: '', total: NaN }] },
    { category: 'Empty', total: 0, percent: 0, transaction_count: NaN, top_merchants: [] },
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
    top_changes: [
      { category: 'Test', previous: NaN, current: NaN, change: NaN, change_percent: NaN },
    ],
    spikes: [],
    months_analyzed: NaN,
  },
  alternatives: [
    { original: 'A', alternative: 'B', current_price: NaN, alternative_price: NaN, monthly_savings: NaN, yearly_savings: NaN, note: '', category: '' },
  ],
  price_changes: [
    { merchant: '', old_price: NaN, new_price: NaN, increase: NaN, percent_change: NaN, first_date: '', latest_date: '', yearly_impact: NaN },
  ],
  duplicate_subscriptions: [],
}

describe('proReportGenerator — NaN prevention', () => {
  it('produces zero NaN/Infinity from minimal empty input', () => {
    const { report } = generateProReportWithWarnings(MINIMAL_RESULT)
    const bad = findBadValues(report)
    expect(bad).toEqual([])
  })

  it('produces zero NaN/Infinity from poison input', () => {
    const { report, warnings } = generateProReportWithWarnings(POISON_RESULT)
    const bad = findBadValues(report)
    expect(bad).toEqual([])
    // Should have tracked warnings for the NaN inputs
    expect(warnings.length).toBeGreaterThan(0)
  })

  it('health score is always 0-100', () => {
    const { report: r1 } = generateProReportWithWarnings(MINIMAL_RESULT)
    expect(r1.executive_summary.health_score).toBeGreaterThanOrEqual(0)
    expect(r1.executive_summary.health_score).toBeLessThanOrEqual(100)

    const { report: r2 } = generateProReportWithWarnings(POISON_RESULT)
    expect(r2.executive_summary.health_score).toBeGreaterThanOrEqual(0)
    expect(r2.executive_summary.health_score).toBeLessThanOrEqual(100)
  })

  it('monthly trends months never contain NaN strings', () => {
    const { report } = generateProReportWithWarnings(POISON_RESULT)
    for (const t of report.monthly_trends) {
      expect(t.month).not.toContain('NaN')
      expect(Number.isFinite(t.total_spend)).toBe(true)
    }
  })

  it('all action plan savings are finite', () => {
    const { report } = generateProReportWithWarnings(POISON_RESULT)
    for (const a of report.action_plan) {
      expect(Number.isFinite(a.estimated_monthly_savings)).toBe(true)
      expect(Number.isFinite(a.estimated_yearly_savings)).toBe(true)
      expect(a.priority).toBeGreaterThanOrEqual(1)
    }
  })

  it('executive summary never contains $NaN or $undefined', () => {
    const { report } = generateProReportWithWarnings(POISON_RESULT)
    expect(report.executive_summary.headline).not.toContain('NaN')
    expect(report.executive_summary.paragraph).not.toContain('NaN')
    expect(report.executive_summary.paragraph).not.toContain('undefined')
  })

  it('subscription insights have finite costs', () => {
    const { report } = generateProReportWithWarnings(POISON_RESULT)
    for (const sub of report.subscription_insights) {
      expect(Number.isFinite(sub.monthly_cost)).toBe(true)
      expect(Number.isFinite(sub.annual_cost)).toBe(true)
      expect(sub.merchant.length).toBeGreaterThan(0)
    }
  })

  it('category deep dives have finite values', () => {
    const { report } = generateProReportWithWarnings(POISON_RESULT)
    for (const cat of report.category_deep_dives) {
      expect(Number.isFinite(cat.total)).toBe(true)
      expect(Number.isFinite(cat.percent)).toBe(true)
      expect(Number.isFinite(cat.monthly_average)).toBe(true)
      expect(Number.isFinite(cat.trend_percent)).toBe(true)
      expect(cat.category.length).toBeGreaterThan(0)
    }
  })

  it('savings projection is finite', () => {
    const { report } = generateProReportWithWarnings(POISON_RESULT)
    expect(Number.isFinite(report.savings_projection.month_3)).toBe(true)
    expect(Number.isFinite(report.savings_projection.month_6)).toBe(true)
    expect(Number.isFinite(report.savings_projection.month_12)).toBe(true)
  })

  it('behavioral insights are finite', () => {
    const { report } = generateProReportWithWarnings(POISON_RESULT)
    expect(Number.isFinite(report.behavioral_insights.avg_daily_spend)).toBe(true)
    expect(Number.isFinite(report.behavioral_insights.avg_weekly_spend)).toBe(true)
    expect(Number.isFinite(report.behavioral_insights.impulse_spend_estimate)).toBe(true)
  })
})
