'use client'

import ResultCards from '@/components/ResultCards'
import { DEMO_RESULTS } from '@/lib/demoResults'
import type { AnalysisResult } from '@/lib/types'

export default function ExampleResults() {
  return (
    <ResultCards results={DEMO_RESULTS as AnalysisResult} isDemo />
  )
}
