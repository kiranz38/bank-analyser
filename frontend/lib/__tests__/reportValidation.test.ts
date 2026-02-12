import { describe, it, expect } from 'vitest'
import { validateReportData, checkInvariants, ProReportSchema } from '../reportValidation'
import { generateProReport, generateProReportWithWarnings } from '../proReportGenerator'
import type { ProReportData } from '../proReportTypes'
import type { AnalysisResult } from '../types'

// ── Minimal valid AnalysisResult ──

const MINIMAL_RESULT: AnalysisResult = {
  monthly_leak: 0,
  annual_savings: 0,
  top_leaks: [],
  top_spending: [],
  easy_wins: [],
  recovery_plan: [],
  disclaimer: '',
}

// ── Realistic AnalysisResult ──

const REALISTIC_RESULT: AnalysisResult = {
  monthly_leak: 487,
  annual_savings: 5844,
  top_leaks: [
    { category: 'Streaming', merchant: 'NETFLIX', monthly_cost: 15.99, yearly_cost: 191.88, explanation: 'Monthly subscription', date: '2024-06-15', last_date: '2024-11-15' },
    { category: 'Food Delivery', merchant: 'DOORDASH', monthly_cost: 120, yearly_cost: 1440, explanation: 'Frequent delivery orders', date: '2024-10-01', last_date: '2024-11-20' },
  ],
  top_spending: [
    { date: '2024-11-15', merchant: 'RENT', amount: 2000, category: 'Housing' },
    { date: '2024-11-10', merchant: 'KROGER', amount: 180, category: 'Groceries' },
    { date: '2024-10-22', merchant: 'AMAZON', amount: 89.99, category: 'Shopping' },
    { date: '2024-09-05', merchant: 'SHELL', amount: 55, category: 'Gas' },
  ],
  easy_wins: [
    { title: 'Cancel unused streaming', estimated_yearly_savings: 191.88, action: 'Cancel Netflix if you watch less than 4 hours/month' },
    { title: 'Reduce food delivery', estimated_yearly_savings: 720, action: 'Set a weekly delivery budget of $30' },
  ],
  recovery_plan: ['Cancel low-use subscriptions', 'Set delivery budget'],
  disclaimer: 'AI generated',
  category_summary: [
    { category: 'Housing', total: 24000, percent: 55, transaction_count: 12, top_merchants: [{ name: 'RENT', total: 24000 }] },
    { category: 'Food', total: 6000, percent: 14, transaction_count: 120, top_merchants: [{ name: 'KROGER', total: 3500 }, { name: 'DOORDASH', total: 2500 }] },
    { category: 'Streaming', total: 192, percent: 0.4, transaction_count: 12, top_merchants: [{ name: 'NETFLIX', total: 192 }] },
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
    top_changes: [
      { category: 'Food', previous: 450, current: 600, change: 150, change_percent: 33.3 },
    ],
    spikes: [],
    months_analyzed: 12,
  },
}

// ── Poison AnalysisResult (all NaN/undefined) ──

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
}

describe('reportValidation', () => {
  describe('ProReportSchema', () => {
    it('accepts a valid report from realistic input', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const result = ProReportSchema.safeParse(report)
      expect(result.success).toBe(true)
    })

    it('rejects a report with NaN health score', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const bad = { ...report, executive_summary: { ...report.executive_summary, health_score: NaN } }
      const result = ProReportSchema.safeParse(bad)
      expect(result.success).toBe(false)
    })

    it('rejects a report with NaN in monthly trend', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const bad = {
        ...report,
        monthly_trends: [{ month: '2024-01', total_spend: NaN, by_category: {} }],
      }
      const result = ProReportSchema.safeParse(bad)
      expect(result.success).toBe(false)
    })

    it('rejects invalid month format', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const bad = {
        ...report,
        monthly_trends: [{ month: 'NaN-NaN', total_spend: 100, by_category: {} }],
      }
      const result = ProReportSchema.safeParse(bad)
      expect(result.success).toBe(false)
    })
  })

  describe('checkInvariants', () => {
    it('passes for a well-formed report', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const violations = checkInvariants(report)
      const errors = violations.filter(v => v.severity === 'error')
      expect(errors).toEqual([])
    })

    it('catches savings not monotonic', () => {
      const report = generateProReport(REALISTIC_RESULT)
      report.savings_projection = { month_3: 500, month_6: 200, month_12: 1000, assumptions: [] }
      const violations = checkInvariants(report)
      expect(violations.some(v => v.rule === 'savings_not_monotonic')).toBe(true)
    })

    it('catches health label mismatch', () => {
      const report = generateProReport(REALISTIC_RESULT)
      report.executive_summary.health_score = 95
      report.executive_summary.health_label = 'Needs Attention'
      const violations = checkInvariants(report)
      expect(violations.some(v => v.rule === 'health_label_mismatch')).toBe(true)
    })

    it('catches inverted period', () => {
      const report = generateProReport(REALISTIC_RESULT)
      report.period = { start: '2025-01-01', end: '2024-01-01' }
      const violations = checkInvariants(report)
      expect(violations.some(v => v.rule === 'period_inverted')).toBe(true)
    })

    it('catches duplicate trend months', () => {
      const report = generateProReport(REALISTIC_RESULT)
      if (report.monthly_trends.length >= 2) {
        report.monthly_trends[1].month = report.monthly_trends[0].month
      }
      const violations = checkInvariants(report)
      expect(violations.some(v => v.rule === 'duplicate_trend_months')).toBe(true)
    })
  })

  describe('validateReportData', () => {
    it('valid=true for a good report from realistic data', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const result = validateReportData(report)
      expect(result.valid).toBe(true)
      expect(result.failedSections).toEqual([])
      expect(result.schemaErrors).toEqual([])
    })

    it('valid=true for minimal input (generator makes safe defaults)', () => {
      const report = generateProReport(MINIMAL_RESULT)
      const result = validateReportData(report)
      expect(result.valid).toBe(true)
      expect(result.failedSections).toEqual([])
    })

    it('produces usable safeData from poison input', () => {
      const { report } = generateProReportWithWarnings(POISON_RESULT)
      const result = validateReportData(report)
      // The generator sanitizes numbers, but some empty-string fields
      // may still fail the nonEmpty schema check — that's expected.
      // What matters is that safeData is fully usable:
      expect(Number.isFinite(result.safeData.executive_summary.health_score)).toBe(true)
      expect(result.safeData.executive_summary.headline.length).toBeGreaterThan(0)
      expect(Number.isFinite(result.safeData.savings_projection.month_12)).toBe(true)
      expect(Number.isFinite(result.safeData.behavioral_insights.avg_daily_spend)).toBe(true)
      // Failed sections get safe defaults, so safeData is always displayable
      for (const trend of result.safeData.monthly_trends) {
        expect(Number.isFinite(trend.total_spend)).toBe(true)
        expect(trend.month).toMatch(/^\d{4}-\d{2}$/)
      }
    })

    it('safeData replaces invalid executive_summary with safe default', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const bad: ProReportData = {
        ...report,
        executive_summary: {
          headline: '',
          paragraph: 'Contains $NaN in it',
          health_score: NaN,
          health_label: 'Good' as const,
        },
      }
      const result = validateReportData(bad)
      expect(result.failedSections).toContain('executive_summary')
      // safeData should have the safe default
      expect(result.safeData.executive_summary.headline).toBe('Your Spending Analysis')
      expect(Number.isFinite(result.safeData.executive_summary.health_score)).toBe(true)
    })

    it('safeData filters out invalid monthly trends', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const bad: ProReportData = {
        ...report,
        monthly_trends: [
          { month: '2024-01', total_spend: 1000, by_category: {} }, // valid
          { month: 'NaN-NaN', total_spend: NaN, by_category: {} }, // invalid
        ],
      }
      const result = validateReportData(bad)
      expect(result.failedSections).toContain('monthly_trends')
      expect(result.safeData.monthly_trends).toHaveLength(1)
      expect(result.safeData.monthly_trends[0].month).toBe('2024-01')
    })

    it('safeData filters out invalid subscription insights', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const bad: ProReportData = {
        ...report,
        subscription_insights: [
          ...report.subscription_insights,
          {
            merchant: '', // invalid: empty
            monthly_cost: NaN,
            annual_cost: NaN,
            usage_estimate: 'Unknown' as const,
            roi_label: 'Review usage' as const,
            recommendation: 'test',
          },
        ],
      }
      const result = validateReportData(bad)
      expect(result.failedSections).toContain('subscription_insights')
      // The valid ones survive
      expect(result.safeData.subscription_insights.length).toBe(report.subscription_insights.length)
    })

    it('safeData replaces invalid savings_projection with safe default', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const bad: ProReportData = {
        ...report,
        savings_projection: {
          month_3: NaN,
          month_6: -100,
          month_12: Infinity,
          assumptions: [],
        },
      }
      const result = validateReportData(bad)
      expect(result.failedSections).toContain('savings_projection')
      expect(result.safeData.savings_projection.month_3).toBe(0)
      expect(result.safeData.savings_projection.month_6).toBe(0)
      expect(result.safeData.savings_projection.month_12).toBe(0)
    })

    it('safeData replaces invalid behavioral_insights with safe default', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const bad: ProReportData = {
        ...report,
        behavioral_insights: {
          peak_spending_day: 'Saturday',
          avg_daily_spend: NaN,
          avg_weekly_spend: NaN,
          impulse_spend_estimate: NaN,
          top_impulse_merchants: [],
          spending_velocity: '',
        },
      }
      const result = validateReportData(bad)
      expect(result.failedSections).toContain('behavioral_insights')
      expect(result.safeData.behavioral_insights.avg_daily_spend).toBe(0)
    })

    it('returns invariant violations alongside schema errors', () => {
      const report = generateProReport(REALISTIC_RESULT)
      report.savings_projection = { month_3: 500, month_6: 200, month_12: 100, assumptions: [] }
      const result = validateReportData(report)
      expect(result.invariantViolations.some(v => v.rule === 'savings_not_monotonic')).toBe(true)
    })

    it('does not mutate the original report', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const originalJson = JSON.stringify(report)
      const bad: ProReportData = {
        ...report,
        executive_summary: { ...report.executive_summary, health_score: NaN },
      }
      validateReportData(bad)
      // Original report unchanged
      expect(JSON.stringify(report)).toBe(originalJson)
    })
  })
})
