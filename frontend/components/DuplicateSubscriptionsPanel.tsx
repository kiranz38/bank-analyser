'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Tv, Music, Cloud, Heart, ShoppingCart, Info } from 'lucide-react'

interface DuplicateSubscription {
  category: string
  services: string[]
  count: number
  combined_monthly: number
  combined_yearly: number
  suggestion: string
}

interface DuplicateSubscriptionsPanelProps {
  duplicates: DuplicateSubscription[]
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Streaming': <Tv className="h-4 w-4" />,
  'Music': <Music className="h-4 w-4" />,
  'Cloud': <Cloud className="h-4 w-4" />,
  'Fitness': <Heart className="h-4 w-4" />,
  'Food Delivery': <ShoppingCart className="h-4 w-4" />,
}

export default function DuplicateSubscriptionsPanel({ duplicates }: DuplicateSubscriptionsPanelProps) {
  if (!duplicates || duplicates.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Copy className="h-5 w-5" />
          Overlapping Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You have multiple subscriptions in the same category. Consider consolidating to save money.
        </p>

        <div className="space-y-3">
          {duplicates.map((dup, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {CATEGORY_ICONS[dup.category] || <Copy className="h-4 w-4" />}
                  <span className="font-medium">{dup.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{dup.count} services</Badge>
                  <span className="font-semibold">{formatCurrency(dup.combined_monthly)}/mo</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {dup.services.map((service, i) => (
                  <Badge key={i} variant="outline">{service}</Badge>
                ))}
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{dup.suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
