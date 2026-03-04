'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Subscription } from '@/lib/types'

interface SubscriptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptions: Subscription[]
}

export default function SubscriptionsModal({ open, onOpenChange, subscriptions }: SubscriptionsModalProps) {
  const formatCurrencyPrecise = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.monthly_cost, 0)
  const totalAnnual = subscriptions.reduce((s, sub) => s + sub.annual_cost, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detected Subscriptions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4 text-center">
            <div>
              <p className="text-xl font-bold">{subscriptions.length}</p>
              <p className="text-xs text-muted-foreground">Found</p>
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrencyPrecise(totalMonthly)}</p>
              <p className="text-xs text-muted-foreground">Monthly</p>
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalAnnual)}</p>
              <p className="text-xs text-muted-foreground">Annual</p>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {subscriptions.map((sub, index) => (
              <div key={index} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium">{sub.merchant}</p>
                  <p className="text-xs text-muted-foreground">{sub.reason}</p>
                  <p className="text-xs text-muted-foreground">Last charged: {sub.last_date}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold">{formatCurrencyPrecise(sub.monthly_cost)}/mo</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(sub.annual_cost)}/yr</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
