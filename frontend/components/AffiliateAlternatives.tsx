'use client'

import { useState, useEffect } from 'react'
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
    <div className="card">
      <div className="section-header-row" onClick={() => setExpanded(!expanded)}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Cheaper Alternatives ({enriched.length})
        </h2>
        <span className="toggle-icon">{expanded ? '\u25B2' : '\u25BC'}</span>
      </div>

      {expanded && (
        <div className="affiliate-section">
          {/* Disclosure banner */}
          {hasAnyAffiliate && isAffiliateEnabled() && (
            <div className="affiliate-disclosure">
              {config.disclosureText}
            </div>
          )}

          {/* Alternative cards */}
          <div className="affiliate-cards">
            {enriched.map((alt, index) => {
              const ctaUrl = getCtaUrl(alt)

              return (
                <div key={index} className="affiliate-alt-card">
                  <div className="affiliate-alt-header">
                    <span className="affiliate-alt-names">
                      {alt.original} &rarr; {alt.alternative}
                    </span>
                    {alt.alternative_price === 0 && (
                      <span className="free-badge">FREE</span>
                    )}
                  </div>

                  <div className="affiliate-alt-pricing">
                    <span className="affiliate-alt-current">
                      {formatCurrencyPrecise(alt.current_price)}/mo
                    </span>
                    <span className="affiliate-alt-savings">
                      Save {formatCurrency(alt.yearly_savings)}/yr
                    </span>
                  </div>

                  <details className="affiliate-alt-details">
                    <summary>Why this alternative?</summary>
                    <div className="affiliate-alt-details-body">
                      <p>{alt.note}</p>
                      <p className="affiliate-alt-meta">
                        Category: {alt.category} | Alt price: {alt.alternative_price === 0 ? 'Free' : `${formatCurrencyPrecise(alt.alternative_price)}/mo`}
                      </p>
                    </div>
                  </details>

                  {ctaUrl ? (
                    <a
                      href={ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="btn-affiliate-cta"
                      onClick={() => handleCtaClick(alt)}
                    >
                      {alt.hasAffiliate ? 'Switch & Save \u2192' : 'Visit site \u2192'}
                    </a>
                  ) : (
                    <span className="affiliate-alt-no-link">
                      {alt.alternative}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="affiliate-footer">
            <p>{config.footerNote}</p>
            <button
              className="affiliate-report-btn"
              onClick={() => {
                window.location.href = 'mailto:support@leakywallet.com?subject=Incorrect alternative reported'
              }}
            >
              Report incorrect alternative
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
