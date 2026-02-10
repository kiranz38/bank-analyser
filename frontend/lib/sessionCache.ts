/**
 * Session storage utilities for caching analysis results
 *
 * - Results are cached in sessionStorage (cleared when tab closes)
 * - Allows users to navigate away and return without re-analyzing
 * - Includes timestamp for optional TTL checking
 */

const CACHE_KEY = 'leaky_wallet_results'
const CACHE_VERSION = 1

interface CachedData<T> {
  version: number
  timestamp: number
  data: T
}

/**
 * Save data to session storage
 */
export function saveToSession<T>(data: T): boolean {
  if (typeof window === 'undefined') return false

  try {
    const cached: CachedData<T> = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data,
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached))
    return true
  } catch (error) {
    // Handle quota exceeded or other storage errors
    console.warn('[SessionCache] Failed to save:', error)
    return false
  }
}

/**
 * Load data from session storage
 * Returns null if no data, expired, or wrong version
 */
export function loadFromSession<T>(maxAgeMs?: number): T | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const cached: CachedData<T> = JSON.parse(raw)

    // Check version compatibility
    if (cached.version !== CACHE_VERSION) {
      clearSession()
      return null
    }

    // Check TTL if specified
    if (maxAgeMs && Date.now() - cached.timestamp > maxAgeMs) {
      clearSession()
      return null
    }

    return cached.data
  } catch (error) {
    console.warn('[SessionCache] Failed to load:', error)
    return null
  }
}

/**
 * Clear cached data from session storage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.warn('[SessionCache] Failed to clear:', error)
  }
}

/**
 * Check if session has cached data
 */
export function hasSessionData(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return sessionStorage.getItem(CACHE_KEY) !== null
  } catch {
    return false
  }
}

/**
 * Get the timestamp of cached data
 */
export function getSessionTimestamp(): number | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const cached = JSON.parse(raw)
    return cached.timestamp || null
  } catch {
    return null
  }
}
