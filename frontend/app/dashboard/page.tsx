'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Loader2, TrendingDown, RefreshCw, Zap, Calendar } from 'lucide-react'

interface SavedAnalysis {
  id: string
  title: string | null
  createdAt: string
  results: {
    monthly_leak?: number
    annual_savings?: number
    subscriptions?: { name: string }[]
    easy_wins?: { title: string; estimated_yearly_savings: number }[]
    category_summary?: { category: string; total: number }[]
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false)
      return
    }
    if (status !== 'authenticated') return

    fetch('/api/analyses')
      .then((res) => res.json())
      .then((data) => setAnalyses(data.analyses || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [status])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

  const formatCurrency = (amount: number | undefined) =>
    amount ? `$${Math.round(amount).toLocaleString()}` : '$0'

  if (status === 'unauthenticated') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <h1 className="mb-2 text-xl font-semibold">Sign in to view your dashboard</h1>
        <p className="mb-6 text-sm text-muted-foreground">Your past analyses are saved to your account.</p>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </main>
    )
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
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Upload a bank statement — your results are saved here automatically so you can track spending over time.
            </p>
            <Button asChild>
              <Link href="/"><Plus className="mr-2 h-4 w-4" />Analyze Your First Statement</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/30 p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Statements</p>
                <p className="text-2xl font-bold">{analyses.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Avg monthly leak</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(
                    analyses.reduce((s, a) => s + (a.results.monthly_leak || 0), 0) / analyses.length
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total potential savings</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(
                    analyses.reduce((s, a) => s + (a.results.annual_savings || 0), 0)
                  )}/yr
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {analyses.map((analysis) => {
                const topSub = analysis.results.subscriptions?.[0]?.name
                const topWin = analysis.results.easy_wins?.[0]
                const topCategory = analysis.results.category_summary?.sort((a, b) => b.total - a.total)[0]

                return (
                  <Card key={analysis.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(analysis.createdAt)}
                        </div>
                        {analysis.title && (
                          <span className="text-xs font-medium text-muted-foreground">{analysis.title}</span>
                        )}
                      </div>

                      {/* Key metrics */}
                      <div className="grid grid-cols-3 divide-x p-0">
                        <div className="px-4 py-3 text-center">
                          <div className="flex justify-center mb-1">
                            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                          </div>
                          <p className="text-xs text-muted-foreground">Monthly leak</p>
                          <p className="text-base font-bold text-destructive">
                            {formatCurrency(analysis.results.monthly_leak)}
                          </p>
                        </div>
                        <div className="px-4 py-3 text-center">
                          <div className="flex justify-center mb-1">
                            <Zap className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                          <p className="text-xs text-muted-foreground">Can save</p>
                          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(analysis.results.annual_savings)}/yr
                          </p>
                        </div>
                        <div className="px-4 py-3 text-center">
                          <div className="flex justify-center mb-1">
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">Subscriptions</p>
                          <p className="text-base font-bold">
                            {analysis.results.subscriptions?.length || 0}
                          </p>
                        </div>
                      </div>

                      {/* Highlights */}
                      {(topSub || topWin || topCategory) && (
                        <div className="space-y-1 border-t bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
                          {topCategory && (
                            <p>Biggest spend: <span className="font-medium text-foreground">{topCategory.category}</span> ({formatCurrency(topCategory.total)}/mo)</p>
                          )}
                          {topWin && (
                            <p>Top win: <span className="font-medium text-foreground">{topWin.title}</span> — saves {formatCurrency(topWin.estimated_yearly_savings)}/yr</p>
                          )}
                          {topSub && !topWin && (
                            <p>Largest subscription: <span className="font-medium text-foreground">{topSub}</span></p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
