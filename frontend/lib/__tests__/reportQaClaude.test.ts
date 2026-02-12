import { describe, it, expect } from 'vitest'
import {
  buildRedactedSummary,
  applyQaResult,
  isReportQaEnabled,
  type QaResult,
} from '../reportQaClaude'
import { validateReportData } from '../reportValidation'
import { generateProReport } from '../proReportGenerator'
import type { AnalysisResult } from '../types'
import type { ProReportData } from '../proReportTypes'

// ── Fixtures ──

const REALISTIC_RESULT: AnalysisResult = {
  monthly_leak: 487,
  annual_savings: 5844,
  top_leaks: [
    { category: 'Streaming', merchant: 'NETFLIX', monthly_cost: 15.99, yearly_cost: 191.88, explanation: 'Monthly subscription', date: '2024-06-15', last_date: '2024-11-15' },
  ],
  top_spending: [
    { date: '2024-11-15', merchant: 'RENT', amount: 2000, category: 'Housing' },
    { date: '2024-11-10', merchant: 'KROGER', amount: 180, category: 'Groceries' },
  ],
  easy_wins: [
    { title: 'Cancel unused streaming', estimated_yearly_savings: 191.88, action: 'Cancel Netflix' },
  ],
  recovery_plan: ['Cancel low-use subscriptions'],
  disclaimer: 'AI generated',
  category_summary: [
    { category: 'Housing', total: 24000, percent: 55, transaction_count: 12, top_merchants: [{ name: 'RENT', total: 24000 }] },
    { category: 'Food', total: 6000, percent: 14, transaction_count: 120, top_merchants: [{ name: 'KROGER', total: 3500 }] },
  ],
  subscriptions: [
    { merchant: 'NETFLIX', monthly_cost: 15.99, annual_cost: 191.88, confidence: 0.95, last_date: '2024-11-15', occurrences: 12, reason: 'Monthly charge' },
  ],
}

const MINIMAL_RESULT: AnalysisResult = {
  monthly_leak: 0,
  annual_savings: 0,
  top_leaks: [],
  top_spending: [],
  easy_wins: [],
  recovery_plan: [],
  disclaimer: '',
}

describe('reportQaClaude', () => {
  describe('isReportQaEnabled', () => {
    it('returns false by default (no env var set)', () => {
      expect(isReportQaEnabled()).toBe(false)
    })
  })

  describe('buildRedactedSummary', () => {
    it('builds summary without PII from realistic data', () => {
      const report = generateProReport(REALISTIC_RESULT)
      const validation = validateReportData(report)
      const summary = buildRedactedSummary(report, validation)

      expect(summary.subscriptionCount).toBe(1)
      expect(summary.healthScore).toBeGreaterThan(0)
      expect(summary.healthScore).toBeLessThanOrEqual(100)
      expect(summary.topCategories.length).toBeGreaterThan(0)
      // Merchant names should be truncated if long
      for (const m of summary.topMerchants) {
        expect(m.label.length).toBeLessThanOrEqual(15)
      }
      // No raw transactions in summary
      expect(JSON.stringify(summary)).not.toContain('2024-11-15')
      // Spend values are rounded
      for (const cat of summary.topCategories) {
        expect(cat.spend).toBe(Math.round(cat.spend))
      }
    })

    it('handles minimal empty data', () => {
      const report = generateProReport(MINIMAL_RESULT)
      const validation = validateReportData(report)
      const summary = buildRedactedSummary(report, validation)

      expect(summary.subscriptionCount).toBe(0)
      expect(summary.topCategories).toEqual([])
      expect(summary.topMerchants).toEqual([])
      expect(summary.monthCount).toBe(0)
    })

    it('includes validation issues in summary', () => {
      const report = generateProReport(REALISTIC_RESULT)
      // Corrupt savings to cause invariant violation
      report.savings_projection = { month_3: 500, month_6: 200, month_12: 100, assumptions: [] }
      const validation = validateReportData(report)
      const summary = buildRedactedSummary(report, validation)

      expect(summary.validationIssues.length).toBeGreaterThan(0)
      expect(summary.validationIssues.some(i => i.includes('savings_not_monotonic'))).toBe(true)
    })
  })

  describe('applyQaResult', () => {
    function makeReport(): ProReportData {
      return generateProReport(REALISTIC_RESULT)
    }

    it('passes through report unchanged when QA passes', () => {
      const report = makeReport()
      const qaResult: QaResult = {
        pass: true,
        severity: 'low',
        omitSections: [],
        notesForUser: '',
        narrativeBullets: [],
        checks: [],
      }

      const output = applyQaResult(report, qaResult, [])
      expect(output.isSafeMode).toBe(false)
      expect(output.omittedSections).toEqual([])
      expect(output.report.subscription_insights.length).toBe(report.subscription_insights.length)
    })

    it('enables safe mode when QA fails', () => {
      const report = makeReport()
      const qaResult: QaResult = {
        pass: false,
        severity: 'high',
        omitSections: ['subscription_insights'],
        notesForUser: 'Data quality issues detected',
        narrativeBullets: [],
        checks: [],
      }

      const output = applyQaResult(report, qaResult, [])
      expect(output.isSafeMode).toBe(true)
      expect(output.omittedSections).toContain('subscription_insights')
      expect(output.report.subscription_insights).toEqual([])
    })

    it('merges QA omissions with validation failures', () => {
      const report = makeReport()
      const qaResult: QaResult = {
        pass: true,
        severity: 'medium',
        omitSections: ['behavioral_insights'],
        notesForUser: '',
        narrativeBullets: [],
        checks: [],
      }

      const output = applyQaResult(report, qaResult, ['savings_projection'])
      expect(output.omittedSections).toContain('behavioral_insights')
      expect(output.omittedSections).toContain('savings_projection')
      expect(output.report.behavioral_insights.avg_daily_spend).toBe(0)
      expect(output.report.savings_projection.month_12).toBe(0)
    })

    it('omits all requested sections correctly', () => {
      const report = makeReport()
      const qaResult: QaResult = {
        pass: false,
        severity: 'high',
        omitSections: ['subscription_insights', 'savings_projection', 'action_plan', 'behavioral_insights', 'category_deep_dives', 'monthly_trends'],
        notesForUser: 'All sections failed',
        narrativeBullets: [],
        checks: [],
      }

      const output = applyQaResult(report, qaResult, [])
      expect(output.isSafeMode).toBe(true)
      expect(output.report.subscription_insights).toEqual([])
      expect(output.report.action_plan).toEqual([])
      expect(output.report.category_deep_dives).toEqual([])
      expect(output.report.monthly_trends).toEqual([])
      expect(output.report.savings_projection.month_12).toBe(0)
      expect(output.report.behavioral_insights.avg_daily_spend).toBe(0)
      // Executive summary should still be present
      expect(output.report.executive_summary.headline.length).toBeGreaterThan(0)
    })

    it('does not mutate the original report', () => {
      const report = makeReport()
      const original = JSON.stringify(report)
      const qaResult: QaResult = {
        pass: false,
        severity: 'high',
        omitSections: ['subscription_insights'],
        notesForUser: '',
        narrativeBullets: [],
        checks: [],
      }

      applyQaResult(report, qaResult, [])
      expect(JSON.stringify(report)).toBe(original)
    })
  })
})
