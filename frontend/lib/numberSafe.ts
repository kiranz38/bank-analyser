/**
 * Safe numeric helpers for Pro Report generation.
 *
 * Every function returns a finite fallback on NaN / Infinity / undefined.
 * Each invalid conversion is tracked as a warning so upstream can decide
 * whether to omit the containing section.
 */

// ── Warning collector ──────────────────────────────────────

export interface NumericWarning {
  field: string
  raw: unknown
  fallback: number | string
  reason: 'nan' | 'infinity' | 'negative_unexpected' | 'division_by_zero' | 'out_of_range'
}

let _warnings: NumericWarning[] = []

/** Start a new collection run (call before generateProReport). */
export function resetWarnings(): void {
  _warnings = []
}

/** Retrieve all warnings collected since the last reset. */
export function getWarnings(): ReadonlyArray<NumericWarning> {
  return _warnings
}

function warn(w: NumericWarning): void {
  _warnings.push(w)
}

// ── Core helpers ───────────────────────────────────────────

/**
 * Coerce any value to a finite number.
 * Returns `fallback` for NaN, Infinity, null, undefined, non-number strings.
 */
export function safeNumber(x: unknown, fallback = 0, field = ''): number {
  if (x === null || x === undefined) {
    if (field) warn({ field, raw: x, fallback, reason: 'nan' })
    return fallback
  }
  const n = typeof x === 'number' ? x : Number(x)
  if (!Number.isFinite(n)) {
    if (field) warn({ field, raw: x, fallback, reason: Number.isNaN(n) ? 'nan' : 'infinity' })
    return fallback
  }
  return n
}

/**
 * Safe division that returns `fallback` when denominator is 0 or result is non-finite.
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0, field = ''): number {
  if (denominator === 0 || !Number.isFinite(denominator)) {
    if (field) warn({ field, raw: `${numerator}/${denominator}`, fallback, reason: 'division_by_zero' })
    return fallback
  }
  const result = numerator / denominator
  if (!Number.isFinite(result)) {
    if (field) warn({ field, raw: `${numerator}/${denominator}`, fallback, reason: 'nan' })
    return fallback
  }
  return result
}

/**
 * Safe percentage: (numerator / denominator) * 100.
 * Returns `fallback` on division by zero or NaN.
 */
export function safePercent(numerator: number, denominator: number, fallback = 0, field = ''): number {
  return safeDivide(numerator * 100, denominator, fallback, field)
}

/**
 * Clamp a value between min and max (inclusive).
 * Non-finite inputs get clamped to the nearest bound.
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

/**
 * Round to N decimal places, returning fallback if input is non-finite.
 */
export function safeRound(value: number, decimals = 2, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Format a number as USD currency string. Never returns "$NaN".
 * This is the SINGLE formatting entry point — nothing else should
 * call Intl.NumberFormat for currency in the PDF.
 */
export function safeCurrency(amount: unknown, decimals: 0 | 2 = 2): string {
  const n = safeNumber(amount, 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

/**
 * Safe .toFixed() that never returns "NaN".
 */
export function safeFixed(value: unknown, decimals = 2, fallback = '0'): string {
  const n = safeNumber(value, 0)
  if (!Number.isFinite(n)) return fallback
  return n.toFixed(decimals)
}

/**
 * Ensure a string is non-empty, returning fallback otherwise.
 */
export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim().length > 0) return value
  return fallback
}

/**
 * Check whether a given value would survive as valid display data.
 * Useful for deciding whether to include a section.
 */
export function isDisplayable(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'number') return Number.isFinite(value) && value !== 0
  if (typeof value === 'string') return value.trim().length > 0
  return true
}
