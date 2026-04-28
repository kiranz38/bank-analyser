import type { AnalysisResult } from './types'

const CACHE_PREFIX = 'lw_analysis_'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CacheEntry {
  result: AnalysisResult
  cachedAt: number
}

export async function hashFiles(files: File[]): Promise<string> {
  const buffers = await Promise.all(files.map(f => f.arrayBuffer()))
  const combined = buffers.reduce((acc, buf) => {
    const merged = new Uint8Array(acc.byteLength + buf.byteLength)
    merged.set(new Uint8Array(acc), 0)
    merged.set(new Uint8Array(buf), acc.byteLength)
    return merged.buffer
  }, new ArrayBuffer(0))

  const digest = await crypto.subtle.digest('SHA-256', combined)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function getCachedResult(hash: string): AnalysisResult | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + hash)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + hash)
      return null
    }
    return entry.result
  } catch {
    return null
  }
}

export function setCachedResult(hash: string, result: AnalysisResult): void {
  try {
    const entry: CacheEntry = { result, cachedAt: Date.now() }
    localStorage.setItem(CACHE_PREFIX + hash, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

export function clearAnalysisCache(): void {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .forEach(k => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}
