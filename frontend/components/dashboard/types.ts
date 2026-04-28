import type { AnalysisResult } from '@/lib/types'

export interface DashboardAnalysis {
  id: string
  title: string | null
  createdAt: string
  results: Partial<AnalysisResult>
}

export interface Delta {
  absolute: number
  percent: number
  direction: 'up' | 'down' | 'flat'
}

export interface ChartPoint {
  date: string        // formatted label
  rawDate: string     // ISO for sorting
  monthlyLeak: number
  annualSavings: number
  subscriptions: number
}

export function safeResults(raw: unknown): Partial<AnalysisResult> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return raw as Partial<AnalysisResult>
}

export function computeDelta(current: number, previous: number): Delta | null {
  if (previous === 0 && current === 0) return null
  const absolute = current - previous
  const percent = previous !== 0 ? (absolute / previous) * 100 : 0
  const direction: Delta['direction'] =
    Math.abs(percent) < 1 ? 'flat' : absolute > 0 ? 'up' : 'down'
  return { absolute, percent, direction }
}

export function buildChartData(analyses: DashboardAnalysis[]): ChartPoint[] {
  return [...analyses]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(a => ({
      date: new Date(a.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      rawDate: a.createdAt,
      monthlyLeak: a.results.monthly_leak ?? 0,
      annualSavings: a.results.annual_savings ?? 0,
      subscriptions: a.results.subscriptions?.length ?? 0,
    }))
}
