'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import type { CategorySummary, MonthComparisonData } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  'Subscriptions': '#8b5cf6',
  'Dining & Delivery': '#f97316',
  'Food Delivery': '#fb923c',
  'Shopping': '#3b82f6',
  'Transport': '#10b981',
  'Groceries': '#22c55e',
  'Entertainment': '#ec4899',
  'Utilities & Bills': '#6366f1',
  'Health & Fitness': '#14b8a6',
  'Travel': '#f59e0b',
  'Fees': '#ef4444',
  'Fees & Charges': '#dc2626',
  'Transfers': '#64748b',
  'Other': '#94a3b8',
}

interface PieDataItem {
  name: string
  value: number
  color: string
}

interface SpendingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pieData: PieDataItem[]
  categorySummary?: CategorySummary[]
  comparison?: MonthComparisonData | null
}

export default function SpendingModal({ open, onOpenChange, pieData, categorySummary, comparison }: SpendingModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Spending Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {comparison && (
            <p className="text-sm text-muted-foreground">
              Analyzing: {comparison.current_month}
              {comparison.months_analyzed > 1 && ` (${comparison.months_analyzed} months)`}
            </p>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Pie Chart */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">By Category</h3>
              <div className="h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                {pieData.slice(0, 6).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="font-medium">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Spending Breakdown</h3>
              <div className="h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pieData.slice(0, 6).map(d => ({
                      name: d.name.length > (isMobile ? 10 : 12) ? d.name.slice(0, isMobile ? 10 : 12) + '...' : d.name,
                      amount: d.value,
                      fill: d.color,
                    }))}
                    layout="vertical"
                    margin={isMobile ? { left: 10, right: 10, top: 5, bottom: 5 } : { left: 10, right: 15, top: 10, bottom: 10 }}
                  >
                    <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} tick={{ fontSize: isMobile ? 9 : 10 }} />
                    <YAxis type="category" dataKey="name" width={isMobile ? 60 : 75} tick={{ fontSize: isMobile ? 9 : 11 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={isMobile ? 16 : 20}>
                      {pieData.slice(0, 6).map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Details */}
          {categorySummary && categorySummary.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Category Details</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categorySummary
                  .filter(c => c.category !== 'Transfers' && c.category !== 'Income')
                  .slice(0, 8)
                  .map((cat, index) => (
                    <div
                      key={index}
                      className="rounded-lg border-l-4 bg-muted/30 p-3"
                      style={{ borderLeftColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cat.category}</span>
                        <span className="text-xs text-muted-foreground">{cat.percent.toFixed(1)}%</span>
                      </div>
                      <p className="text-lg font-bold">{formatCurrency(cat.total)}</p>
                      <p className="text-xs text-muted-foreground">{cat.transaction_count} transactions</p>
                      {cat.top_merchants && cat.top_merchants.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {cat.top_merchants.slice(0, 3).map((m, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{m.name}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
