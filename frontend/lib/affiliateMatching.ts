/**
 * Enrichment & ranking — maps backend Alternative[] to affiliate providers
 * and produces sorted, scored results for the UI.
 *
 * Key constraint: never injects alternatives not in the backend response,
 * and never filters out alternatives just because they lack an affiliate.
 */

import type { Alternative } from './types'
import {
  findProviderByName,
  getProviderLink,
  isAffiliateEnabled,
  type AffiliateProvider,
} from './affiliateRegistry'

// ── Types ──────────────────────────────────────────────────────────

export interface EnrichedAlternative extends Alternative {
  provider: AffiliateProvider | null
  hasAffiliate: boolean
  redirectUrl: string | null
  rankScore: number
}

export interface AffiliateMatchResult {
  alternatives: EnrichedAlternative[]
  totalPotentialSavings: number
  hasAnyAffiliate: boolean
}

// ── Matching ───────────────────────────────────────────────────────

export function matchProvider(name: string): AffiliateProvider | null {
  if (!name || typeof name !== 'string') return null
  return findProviderByName(name)
}

// ── Scoring ────────────────────────────────────────────────────────

/**
 * Additive scoring:
 *   +30 category match (provider tags include alt's category)
 *   +25 price advantage (proportional to savings vs current price)
 *   +20 free bonus (alternative_price === 0)
 *   +15 affiliate priority (scaled 0-100 → 0-15)
 *   +10 has affiliate link
 */
export function computeRankScore(
  alt: Alternative,
  provider: AffiliateProvider | null
): number {
  let score = 0

  // Category match
  if (provider && alt.category) {
    const normalizedCategory = alt.category.toLowerCase().replace(/[& ]+/g, '_')
    if (provider.categoryTags.some(tag => tag === normalizedCategory || normalizedCategory.includes(tag))) {
      score += 30
    }
  }

  // Price advantage (proportional)
  if (alt.current_price > 0 && alt.monthly_savings > 0) {
    const savingsRatio = Math.min(alt.monthly_savings / alt.current_price, 1)
    score += Math.round(savingsRatio * 25)
  }

  // Free bonus
  if (alt.alternative_price === 0) {
    score += 20
  }

  // Affiliate priority (scaled)
  if (provider) {
    score += Math.round((provider.priority / 100) * 15)
  }

  // Has affiliate link
  if (provider?.affiliateUrl && isAffiliateEnabled()) {
    score += 10
  }

  return Math.max(score, 1) // Always positive
}

// ── Enrichment ─────────────────────────────────────────────────────

export function enrichAlternatives(alts: Alternative[]): AffiliateMatchResult {
  if (!alts || alts.length === 0) {
    return { alternatives: [], totalPotentialSavings: 0, hasAnyAffiliate: false }
  }

  const enriched: EnrichedAlternative[] = alts.map(alt => {
    const provider = matchProvider(alt.alternative)
    const hasAffiliate = !!(provider?.affiliateUrl && isAffiliateEnabled())
    const redirectUrl = provider ? getProviderLink(provider.providerId) : null
    const rankScore = computeRankScore(alt, provider)

    return {
      ...alt,
      provider,
      hasAffiliate,
      redirectUrl,
      rankScore,
    }
  })

  // Sort descending by rank score
  enriched.sort((a, b) => b.rankScore - a.rankScore)

  const totalPotentialSavings = enriched.reduce((sum, alt) => sum + alt.yearly_savings, 0)
  const hasAnyAffiliate = enriched.some(a => a.hasAffiliate)

  return { alternatives: enriched, totalPotentialSavings, hasAnyAffiliate }
}
