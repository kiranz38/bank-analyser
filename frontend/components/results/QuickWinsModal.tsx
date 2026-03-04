'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { EasyWin } from '@/lib/types'

interface QuickWinsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  easyWins: EasyWin[]
}

export default function QuickWinsModal({ open, onOpenChange, easyWins }: QuickWinsModalProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  const totalYearlySavings = easyWins.reduce((s, w) => s + w.estimated_yearly_savings, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Wins - Easy Savings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
            <div>
              <p className="text-xl font-bold">{easyWins.length}</p>
              <p className="text-xs text-muted-foreground">Quick Actions</p>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalYearlySavings)}</p>
              <p className="text-xs text-muted-foreground">Potential Yearly Savings</p>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {easyWins.map((win, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{win.title}</p>
                  <p className="text-sm text-muted-foreground">{win.action}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">Save {formatCurrency(win.estimated_yearly_savings)}</p>
                  <p className="text-xs text-muted-foreground">/year</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
