'use client'

import { useEffect } from 'react'
import ResultCards from '@/components/ResultCards'
import { DEMO_RESULTS } from '@/lib/demoResults'
import { trackExampleResultsViewed } from '@/lib/analytics'
import type { AnalysisResult } from '@/lib/types'

export default function ExampleResults() {
  useEffect(() => {
    trackExampleResultsViewed()
  }, [])

  return (
    <ResultCards results={DEMO_RESULTS as AnalysisResult} isDemo />
  )
}
