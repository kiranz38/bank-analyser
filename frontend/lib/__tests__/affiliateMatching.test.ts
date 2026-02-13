import { describe, it, expect } from 'vitest'
import {
  matchProvider,
  computeRankScore,
  enrichAlternatives,
} from '../affiliateMatching'
import type { Alternative } from '../types'

const makeAlt = (overrides: Partial<Alternative> = {}): Alternative => ({
  original: 'Netflix',
  alternative: 'Tubi',
  current_price: 15.49,
  alternative_price: 0,
  monthly_savings: 15.49,
  yearly_savings: 185.88,
  note: 'Free with ads',
  category: 'streaming',
  ...overrides,
})

describe('affiliateMatching', () => {
  // ── matchProvider ──

  describe('matchProvider', () => {
    it('matches exact name', () => {
      const p = matchProvider('Tubi')
      expect(p).not.toBeNull()
      expect(p!.providerId).toBe('tubi')
    })

    it('matches alias', () => {
      const p = matchProvider('Paramount+ Essential')
      expect(p).not.toBeNull()
      expect(p!.providerId).toBe('paramount-essential')
    })

    it('returns null for unknown name', () => {
      expect(matchProvider('NonexistentService')).toBeNull()
    })

    it('handles whitespace', () => {
      const p = matchProvider('  Tubi  ')
      expect(p).not.toBeNull()
    })

    it('returns null for empty string', () => {
      expect(matchProvider('')).toBeNull()
    })
  })

  // ── computeRankScore ──

  describe('computeRankScore', () => {
    it('gives free bonus', () => {
      const alt = makeAlt({ alternative_price: 0 })
      const scoreWithFree = computeRankScore(alt, null)
      const altPaid = makeAlt({ alternative_price: 5, monthly_savings: 10.49 })
      const scoreWithPaid = computeRankScore(altPaid, null)
      expect(scoreWithFree).toBeGreaterThan(scoreWithPaid)
    })

    it('gives category match bonus', () => {
      const alt = makeAlt({ category: 'streaming' })
      const provider = matchProvider('Tubi')
      const scoreWithMatch = computeRankScore(alt, provider)
      const scoreNoMatch = computeRankScore(alt, null)
      expect(scoreWithMatch).toBeGreaterThan(scoreNoMatch)
    })

    it('gives affiliate link bonus for providers with affiliate URLs', () => {
      const alt = makeAlt({ alternative: 'Bitwarden', category: 'software', current_price: 3, alternative_price: 0, monthly_savings: 3 })
      const provider = matchProvider('Bitwarden')
      const score = computeRankScore(alt, provider)
      // Should include the +10 affiliate bonus
      expect(score).toBeGreaterThan(0)
    })

    it('always returns a positive score', () => {
      const alt = makeAlt({ current_price: 0, monthly_savings: 0, alternative_price: 5 })
      const score = computeRankScore(alt, null)
      expect(score).toBeGreaterThan(0)
    })
  })

  // ── enrichAlternatives ──

  describe('enrichAlternatives', () => {
    it('preserves all backend alternatives', () => {
      const alts = [
        makeAlt({ alternative: 'Tubi' }),
        makeAlt({ alternative: 'UnknownService', category: 'streaming' }),
      ]
      const result = enrichAlternatives(alts)
      expect(result.alternatives).toHaveLength(2)
    })

    it('sorts by score descending', () => {
      const alts = [
        makeAlt({ alternative: 'UnknownService', category: 'other', alternative_price: 10, monthly_savings: 5 }),
        makeAlt({ alternative: 'Tubi', category: 'streaming', alternative_price: 0, monthly_savings: 15.49 }),
      ]
      const result = enrichAlternatives(alts)
      // Tubi should rank higher (free, category match, known provider)
      expect(result.alternatives[0].alternative).toBe('Tubi')
    })

    it('calculates total potential savings', () => {
      const alts = [
        makeAlt({ yearly_savings: 100 }),
        makeAlt({ yearly_savings: 200 }),
      ]
      const result = enrichAlternatives(alts)
      expect(result.totalPotentialSavings).toBe(300)
    })

    it('handles empty array', () => {
      const result = enrichAlternatives([])
      expect(result.alternatives).toHaveLength(0)
      expect(result.totalPotentialSavings).toBe(0)
      expect(result.hasAnyAffiliate).toBe(false)
    })

    it('never injects new alternatives', () => {
      const alts = [makeAlt()]
      const result = enrichAlternatives(alts)
      expect(result.alternatives).toHaveLength(1)
      expect(result.alternatives[0].original).toBe('Netflix')
    })

    it('sets hasAnyAffiliate when affiliate provider present', () => {
      const alts = [
        makeAlt({ alternative: 'Bitwarden', category: 'software' }),
      ]
      const result = enrichAlternatives(alts)
      expect(result.hasAnyAffiliate).toBe(true)
    })

    it('sets hasAnyAffiliate false when no affiliate providers', () => {
      const alts = [
        makeAlt({ alternative: 'Tubi' }),
      ]
      const result = enrichAlternatives(alts)
      expect(result.hasAnyAffiliate).toBe(false)
    })
  })
})
