import { describe, it, expect } from 'vitest'
import { getProvider, isAffiliateEnabled } from '../affiliateRegistry'

/**
 * Tests for the /api/redirect route logic.
 * Since the Next.js API route import path doesn't resolve in vitest,
 * we test the underlying logic that the route handler uses.
 */

function simulateRedirect(pid: string | null) {
  if (!isAffiliateEnabled()) {
    return { status: 404, error: 'Affiliate redirects are disabled' }
  }

  if (!pid || pid.length > 100) {
    return { status: 400, error: 'Missing or invalid provider ID' }
  }

  const provider = getProvider(pid)

  if (!provider || !provider.isActive) {
    return { status: 404, error: 'Provider not found' }
  }

  const target = provider.affiliateUrl || provider.baseUrl

  if (!target) {
    return { status: 404, error: 'No redirect URL available' }
  }

  try {
    new URL(target)
  } catch {
    return { status: 500, error: 'Malformed redirect URL' }
  }

  return { status: 302, location: target }
}

describe('/api/redirect logic', () => {
  it('redirects 302 for valid provider with baseUrl', () => {
    const res = simulateRedirect('tubi')
    expect(res.status).toBe(302)
    expect(res.location).toBe('https://tubitv.com')
  })

  it('redirects to affiliate URL when available', () => {
    const res = simulateRedirect('bitwarden')
    expect(res.status).toBe(302)
    expect(res.location).toContain('bitwarden.com')
  })

  it('returns 400 for missing pid', () => {
    const res = simulateRedirect(null)
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown pid', () => {
    const res = simulateRedirect('nonexistent')
    expect(res.status).toBe(404)
  })

  it('returns 404 for provider with no URL', () => {
    const res = simulateRedirect('rotate-monthly')
    expect(res.status).toBe(404)
  })

  it('returns 400 for pid exceeding max length', () => {
    const res = simulateRedirect('a'.repeat(101))
    expect(res.status).toBe(400)
  })
})
