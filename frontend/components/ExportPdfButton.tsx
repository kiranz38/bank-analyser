'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, CheckCircle } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

interface ExportPdfButtonProps {
  results: AnalysisResult
  chartContainerId: string
}

export default function ExportPdfButton({ results, chartContainerId }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(false), 5000)
    return () => clearTimeout(timer)
  }, [success])

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const { generatePdf } = await import('@/lib/generatePdf')
      await generatePdf(results, chartContainerId)
      setSuccess(true)
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
      <Button variant="outline" onClick={handleExport} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </>
        )}
      </Button>
      {success && (
        <p className="flex items-center gap-1 text-sm text-success">
          <CheckCircle className="h-3.5 w-3.5" />
          PDF generated successfully
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  )
}
