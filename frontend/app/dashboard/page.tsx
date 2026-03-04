'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Loader2 } from 'lucide-react'

interface SavedAnalysis {
  id: string
  title: string | null
  createdAt: string
  results: {
    monthly_leak?: number
    annual_savings?: number
    subscriptions?: { name: string }[]
    category_summary?: { category: string; total: number }[]
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analyses')
      .then((res) => res.json())
      .then((data) => {
        setAnalyses(data.analyses || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0'
    return `$${Math.round(amount).toLocaleString()}`
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mb-3 h-6 w-6 animate-spin" />
            <p className="text-sm">Loading your analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold">No analyses yet</h2>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              Upload a bank statement to get started. Your results will be saved here automatically.
            </p>
            <Button asChild>
              <Link href="/">Analyze Your First Statement</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {analyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDate(analysis.createdAt)}</span>
                    {analysis.title && (
                      <span className="text-sm font-medium">{analysis.title}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly leak</p>
                      <p className="text-sm font-semibold text-destructive">
                        {formatCurrency(analysis.results.monthly_leak)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Annual savings</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(analysis.results.annual_savings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Subscriptions</p>
                      <p className="text-sm font-semibold">
                        {analysis.results.subscriptions?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
