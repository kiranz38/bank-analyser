'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Copy } from 'lucide-react'

interface ShareSummary {
  monthly_leak: number
  annual_savings: number
  top_categories: Array<{ category: string; monthly: number }>
  subscription_count: number
  tagline: string
}

interface ShareCardProps {
  shareSummary: ShareSummary | null
  onShare?: (platform: string) => void
}

export default function ShareCard({ shareSummary, onShare }: ShareCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (!shareSummary) {
    return null
  }

  const handleShare = (platform: string) => {
    if (onShare) {
      onShare(platform)
    }
  }

  const shareText = `I found ${formatCurrency(shareSummary.annual_savings)}/year in hidden spending leaks using this free tool!`
  const shareUrl = 'https://whereismymoneygo.com'

  return (
    <div className="space-y-4">
      {/* Visual share card */}
      <Card className="overflow-hidden" id="share-card">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Where&apos;s My Money Going?</span>
          </div>

          <div className="mb-5 space-y-1">
            <p className="text-sm text-muted-foreground">I discovered</p>
            <p className="text-3xl font-bold">{formatCurrency(shareSummary.annual_savings)}</p>
            <p className="text-sm text-muted-foreground">in hidden spending per year</p>
          </div>

          <div className="mb-4 flex gap-6">
            <div>
              <p className="text-lg font-bold">{formatCurrency(shareSummary.monthly_leak)}</p>
              <p className="text-xs text-muted-foreground">Monthly leaks</p>
            </div>
            <div>
              <p className="text-lg font-bold">{shareSummary.subscription_count}</p>
              <p className="text-xs text-muted-foreground">Subscriptions</p>
            </div>
          </div>

          {shareSummary.top_categories.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Top spending:</p>
              <div className="flex flex-wrap gap-1.5">
                {shareSummary.top_categories.slice(0, 3).map((cat, index) => (
                  <Badge key={index} variant="secondary">{cat.category}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <CardContent className="flex items-center justify-between border-t px-6 py-3">
          <span className="text-xs text-muted-foreground">Analyze your spending free at</span>
          <span className="text-xs font-medium text-primary">whereismymoneygo.com</span>
        </CardContent>
      </Card>

      {/* Share buttons */}
      <div className="space-y-3">
        <p className="text-center text-sm font-medium">Found savings? Share with friends & family</p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleShare('twitter')}
            >
              Twitter
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleShare('facebook')}
            >
              Facebook
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleShare('whatsapp')}
            >
              WhatsApp
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl)
              handleShare('copy')
              alert('Link copied!')
            }}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  )
}
