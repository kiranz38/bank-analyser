import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Subscription {
  merchant: string
  monthly_cost: number
  annual_cost: number
  confidence: number
  last_date: string
  occurrences: number
  reason: string
}

interface SubscriptionListProps {
  subscriptions: Subscription[]
}

export default function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (!subscriptions || subscriptions.length === 0) {
    return null
  }

  const confirmedSubs = subscriptions.filter(s => s.confidence >= 0.6)
  const possibleSubs = subscriptions.filter(s => s.confidence >= 0.5 && s.confidence < 0.6)

  const totalMonthly = confirmedSubs.reduce((sum, s) => sum + s.monthly_cost, 0)
  const totalAnnual = totalMonthly * 12

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return { text: 'Confirmed', variant: 'default' as const }
    if (confidence >= 0.7) return { text: 'Likely', variant: 'secondary' as const }
    return { text: 'Possible', variant: 'outline' as const }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Detected Subscriptions
          <Badge variant="secondary" className="ml-1">{confirmedSubs.length} found</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary banner */}
        <div className="flex items-center justify-around rounded-lg bg-muted/50 p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Monthly Total</p>
            <p className="text-lg font-bold">{formatCurrency(totalMonthly)}</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Annual Cost</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(totalAnnual)}</p>
          </div>
        </div>

        {/* Subscription list */}
        <ul className="space-y-3">
          {confirmedSubs.map((sub, index) => {
            const confidenceInfo = getConfidenceLabel(sub.confidence)
            return (
              <li key={index} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{sub.merchant}</span>
                    <Badge variant={confidenceInfo.variant} className="text-xs">
                      {confidenceInfo.text}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span>{sub.reason}</span>
                    {sub.last_date && <span>Last: {sub.last_date}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold">{formatCurrency(sub.monthly_cost)}/mo</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(sub.annual_cost)}/yr</p>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Possible subscriptions */}
        {possibleSubs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Possible Subscriptions</h3>
            <ul className="space-y-2">
              {possibleSubs.map((sub, index) => (
                <li key={index} className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-70">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium">{sub.merchant}</span>
                    <p className="text-xs text-muted-foreground">{sub.reason}</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(sub.monthly_cost)}/mo</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Review each subscription and cancel ones you no longer use to save {formatCurrency(totalAnnual)}/year</span>
        </div>
      </CardContent>
    </Card>
  )
}
