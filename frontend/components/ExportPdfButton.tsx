'use client'

import { useState } from 'react'
import type { AnalysisResult } from '@/lib/types'

interface ExportPdfButtonProps {
  results: AnalysisResult
  chartContainerId: string
}

export default function ExportPdfButton({ results, chartContainerId }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      const { generatePdf } = await import('@/lib/generatePdf')
      await generatePdf(results, chartContainerId)
    } catch (err) {
      console.error('PDF generation failed:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setError(`PDF generation failed: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className="btn btn-secondary btn-export-pdf"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF Report
          </>
        )}
      </button>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
    </>
  )
}
