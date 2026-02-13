import { describe, it, expect } from 'vitest'
import {
  getProvider,
  findProviderByName,
  getProviderLink,
  getRegistryConfig,
  getAllProviders,
} from '../affiliateRegistry'

describe('affiliateRegistry', () => {
  // ── getProvider ──

  describe('getProvider', () => {
    it('returns provider by ID', () => {
      const p = getProvider('tubi')
      expect(p).not.toBeNull()
      expect(p!.name).toBe('Tubi')
      expect(p!.providerId).toBe('tubi')
    })

    it('returns null for unknown ID', () => {
      expect(getProvider('nonexistent')).toBeNull()
    })

    it('returns bitwarden with an affiliate URL', () => {
      const p = getProvider('bitwarden')
      expect(p).not.toBeNull()
      expect(p!.affiliateUrl).toBeTruthy()
    })
  })

  // ── findProviderByName ──

  describe('findProviderByName', () => {
    it('finds provider case-insensitively', () => {
      const p = findProviderByName('Tubi')
      expect(p).not.toBeNull()
      expect(p!.providerId).toBe('tubi')
    })

    it('finds provider with alias', () => {
      const p = findProviderByName('paramount essential')
      expect(p).not.toBeNull()
      expect(p!.providerId).toBe('paramount-essential')
    })

    it('returns null for unknown name', () => {
      expect(findProviderByName('SuperFakeService')).toBeNull()
    })

    it('handles whitespace in name', () => {
      const p = findProviderByName('  tubi  ')
      expect(p).not.toBeNull()
      expect(p!.providerId).toBe('tubi')
    })
  })

  // ── getProviderLink ──

  describe('getProviderLink', () => {
    it('returns redirect URL for provider with affiliate URL', () => {
      const link = getProviderLink('bitwarden')
      expect(link).toBe('/api/redirect?pid=bitwarden')
    })

    it('returns baseUrl for provider without affiliate URL', () => {
      const link = getProviderLink('tubi')
      expect(link).toBe('https://tubitv.com')
    })

    it('returns null for unknown provider', () => {
      expect(getProviderLink('nonexistent')).toBeNull()
    })

    it('returns null for provider with no baseUrl and no affiliate', () => {
      const link = getProviderLink('rotate-monthly')
      // rotate-monthly has baseUrl: '' and no affiliateUrl
      expect(link).toBeNull()
    })
  })

  // ── No duplicate matchNames ──

  describe('matchNames uniqueness', () => {
    it('has no duplicate matchNames across providers', () => {
      const allProviders = getAllProviders()
      const seen = new Map<string, string>()

      for (const p of allProviders) {
        for (const name of p.matchNames) {
          const lower = name.toLowerCase()
          if (seen.has(lower)) {
            throw new Error(
              `Duplicate matchName "${lower}" found in providers "${seen.get(lower)}" and "${p.providerId}"`
            )
          }
          seen.set(lower, p.providerId)
        }
      }
    })
  })

  // ── getRegistryConfig ──

  describe('getRegistryConfig', () => {
    it('returns disclosure text and footer note', () => {
      const config = getRegistryConfig()
      expect(config.disclosureText).toBeTruthy()
      expect(config.footerNote).toBeTruthy()
      expect(typeof config.disclosureText).toBe('string')
      expect(typeof config.footerNote).toBe('string')
    })
  })

  // ── getAllProviders ──

  describe('getAllProviders', () => {
    it('returns only active providers', () => {
      const providers = getAllProviders()
      expect(providers.length).toBeGreaterThan(0)
      for (const p of providers) {
        expect(p.isActive).toBe(true)
      }
    })
  })
})
