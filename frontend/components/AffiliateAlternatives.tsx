'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ArrowUpFromLine, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import type { Alternative } from '@/lib/types'
import { enrichAlternatives, type EnrichedAlternative } from '@/lib/affiliateMatching'
import { getRegistryConfig, isAffiliateEnabled } from '@/lib/affiliateRegistry'
import {
  trackAlternativesViewed,
  trackAlternativeClicked,
  trackAffiliateLinkImpression,
  trackAffiliateLinkClick,
} from '@/lib/analytics'

interface AffiliateAlternativesProps {
  alternatives: Alternative[]
  isPro: boolean
  isDemo: boolean
}

export default function AffiliateAlternatives({ alternatives, isPro, isDemo }: AffiliateAlternativesProps) {
  const { alternatives: enriched, hasAnyAffiliate } = enrichAlternatives(alternatives)

  const [expanded, setExpanded] = useState(true)
  const [impressionTracked, setImpressionTracked] = useState(false)
  const config = getRegistryConfig()

  useEffect(() => {
    if (expanded && !impressionTracked && !isDemo) {
      trackAlternativesViewed(enriched.length)
      trackAffiliateLinkImpression({
        count: enriched.length,
        isPro,
        affiliateCount: enriched.filter(a => a.hasAffiliate).length,
      })
      setImpressionTracked(true)
    }
  }, [expanded, impressionTracked, isDemo, enriched, isPro])

  const handleCtaClick = (alt: EnrichedAlternative) => {
    if (isDemo) return
    trackAlternativeClicked({
      original: alt.original,
      alternative: alt.alternative,
      potentialSavings: alt.yearly_savings,
    })
    if (alt.hasAffiliate && alt.provider) {
      trackAffiliateLinkClick({
        providerId: alt.provider.providerId,
        network: alt.provider.network,
        isPro,
        placement: 'alternatives_card',
      })
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  const formatCurrencyPrecise = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

  if (!enriched.length) return null

  const getCtaUrl = (alt: EnrichedAlternative): string | null => {
    if (alt.redirectUrl) return alt.redirectUrl
    if (alt.provider?.baseUrl) return alt.provider.baseUrl
    return null
  }

  return (
    <Card>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5" />
              Cheaper Alternatives ({enriched.length})
            </CardTitle>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Disclosure banner */}
            {hasAnyAffiliate && isAffiliateEnabled() && (
              <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                {config.disclosureText}
              </p>
            )}

            {/* Alternative cards */}
            <div className="space-y-3">
              {enriched.map((alt, index) => {
                const ctaUrl = getCtaUrl(alt)

                return (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {alt.original} → {alt.alternative}
                      </span>
                      {alt.alternative_price === 0 && (
                        <Badge variant="default" className="bg-emerald-500">FREE</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrencyPrecise(alt.current_price)}/mo
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Save {formatCurrency(alt.yearly_savings)}/yr
                      </span>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                        Why this alternative?
                      </summary>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>{alt.note}</p>
                        <p>
                          Category: {alt.category} | Alt price: {alt.alternative_price === 0 ? 'Free' : `${formatCurrencyPrecise(alt.alternative_price)}/mo`}
                        </p>
                      </div>
                    </details>

                    {ctaUrl ? (
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <a
                          href={ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          onClick={() => handleCtaClick(alt)}
                        >
                          {alt.hasAffiliate ? 'Switch & Save' : 'Visit site'}
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">{alt.alternative}</p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs text-muted-foreground">{config.footerNote}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  window.location.href = 'mailto:support@leakywallet.com?subject=Incorrect alternative reported'
                }}
              >
                Report incorrect alternative
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
