import { describe, it, expect, beforeEach } from 'vitest'
import {
  safeNumber, safeDivide, safePercent, safeRound,
  safeCurrency, safeFixed, safeString, clamp, isDisplayable,
  resetWarnings, getWarnings,
} from '../numberSafe'

describe('numberSafe', () => {
  beforeEach(() => {
    resetWarnings()
  })

  // ── safeNumber ──

  describe('safeNumber', () => {
    it('passes through finite numbers', () => {
      expect(safeNumber(42)).toBe(42)
      expect(safeNumber(-3.14)).toBe(-3.14)
      expect(safeNumber(0)).toBe(0)
    })

    it('returns fallback for NaN', () => {
      expect(safeNumber(NaN, 99)).toBe(99)
    })

    it('returns fallback for Infinity', () => {
      expect(safeNumber(Infinity, 0)).toBe(0)
      expect(safeNumber(-Infinity, 0)).toBe(0)
    })

    it('returns fallback for null/undefined', () => {
      expect(safeNumber(null, 5)).toBe(5)
      expect(safeNumber(undefined, 5)).toBe(5)
    })

    it('coerces numeric strings', () => {
      expect(safeNumber('42')).toBe(42)
      expect(safeNumber('3.14')).toBe(3.14)
    })

    it('returns fallback for non-numeric strings', () => {
      expect(safeNumber('hello', 0)).toBe(0)
      expect(safeNumber('', 0)).toBe(0)
    })

    it('tracks warnings when field is provided', () => {
      safeNumber(NaN, 0, 'test.field')
      const warnings = getWarnings()
      expect(warnings).toHaveLength(1)
      expect(warnings[0].field).toBe('test.field')
      expect(warnings[0].reason).toBe('nan')
    })

    it('does not track warning for valid values', () => {
      safeNumber(42, 0, 'test.field')
      expect(getWarnings()).toHaveLength(0)
    })

    it('tracks infinity warning', () => {
      safeNumber(Infinity, 0, 'inf.field')
      const w = getWarnings()
      expect(w).toHaveLength(1)
      expect(w[0].reason).toBe('infinity')
    })
  })

  // ── safeDivide ──

  describe('safeDivide', () => {
    it('divides normally', () => {
      expect(safeDivide(10, 2)).toBe(5)
      expect(safeDivide(7, 3)).toBeCloseTo(2.333, 2)
    })

    it('returns fallback on division by zero', () => {
      expect(safeDivide(10, 0, 99)).toBe(99)
    })

    it('returns fallback when denominator is NaN', () => {
      expect(safeDivide(10, NaN, 0)).toBe(0)
    })

    it('returns fallback when numerator is NaN', () => {
      expect(safeDivide(NaN, 5, 0)).toBe(0)
    })

    it('tracks warning on division by zero with field', () => {
      safeDivide(10, 0, 0, 'div.field')
      expect(getWarnings()).toHaveLength(1)
      expect(getWarnings()[0].reason).toBe('division_by_zero')
    })
  })

  // ── safePercent ──

  describe('safePercent', () => {
    it('calculates correct percentage', () => {
      expect(safePercent(25, 100)).toBe(25)
      expect(safePercent(1, 3)).toBeCloseTo(33.33, 1)
    })

    it('returns fallback on zero denominator', () => {
      expect(safePercent(10, 0, -1)).toBe(-1)
    })
  })

  // ── safeRound ──

  describe('safeRound', () => {
    it('rounds to specified decimals', () => {
      expect(safeRound(3.14159, 2)).toBe(3.14)
      expect(safeRound(3.14159, 0)).toBe(3)
    })

    it('returns fallback for NaN', () => {
      expect(safeRound(NaN, 2, 0)).toBe(0)
    })

    it('returns fallback for Infinity', () => {
      expect(safeRound(Infinity, 2, 0)).toBe(0)
    })
  })

  // ── clamp ──

  describe('clamp', () => {
    it('clamps within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('clamps NaN to min', () => {
      expect(clamp(NaN, 0, 100)).toBe(0)
    })
  })

  // ── safeCurrency ──

  describe('safeCurrency', () => {
    it('formats valid amounts', { timeout: 15000 }, () => {
      expect(safeCurrency(1234.56)).toBe('$1,234.56')
      expect(safeCurrency(1234.56, 0)).toBe('$1,235')
    })

    it('formats zero', () => {
      expect(safeCurrency(0)).toBe('$0.00')
    })

    it('never returns $NaN', () => {
      expect(safeCurrency(NaN)).toBe('$0.00')
      expect(safeCurrency(undefined)).toBe('$0.00')
      expect(safeCurrency(null)).toBe('$0.00')
      expect(safeCurrency('hello')).toBe('$0.00')
      expect(safeCurrency(Infinity)).toBe('$0.00')
    })
  })

  // ── safeFixed ──

  describe('safeFixed', () => {
    it('formats valid numbers', () => {
      expect(safeFixed(3.14159, 2)).toBe('3.14')
      expect(safeFixed(100, 0)).toBe('100')
    })

    it('never returns "NaN"', () => {
      expect(safeFixed(NaN, 2)).toBe('0.00')
      expect(safeFixed(undefined, 2)).toBe('0.00')
      expect(safeFixed(null, 2)).toBe('0.00')
    })
  })

  // ── safeString ──

  describe('safeString', () => {
    it('passes through non-empty strings', () => {
      expect(safeString('hello')).toBe('hello')
    })

    it('returns fallback for empty/whitespace', () => {
      expect(safeString('', 'fallback')).toBe('fallback')
      expect(safeString('   ', 'fallback')).toBe('fallback')
    })

    it('returns fallback for non-strings', () => {
      expect(safeString(null, 'x')).toBe('x')
      expect(safeString(undefined, 'x')).toBe('x')
      expect(safeString(42, 'x')).toBe('x')
    })
  })

  // ── isDisplayable ──

  describe('isDisplayable', () => {
    it('rejects null/undefined/NaN/zero/empty', () => {
      expect(isDisplayable(null)).toBe(false)
      expect(isDisplayable(undefined)).toBe(false)
      expect(isDisplayable(NaN)).toBe(false)
      expect(isDisplayable(0)).toBe(false)
      expect(isDisplayable('')).toBe(false)
      expect(isDisplayable('  ')).toBe(false)
    })

    it('accepts valid values', () => {
      expect(isDisplayable(42)).toBe(true)
      expect(isDisplayable('hello')).toBe(true)
      expect(isDisplayable(-5)).toBe(true)
    })
  })

  // ── warning accumulation ──

  describe('warning accumulation', () => {
    it('accumulates multiple warnings', () => {
      safeNumber(NaN, 0, 'a')
      safeNumber(undefined, 0, 'b')
      safeDivide(1, 0, 0, 'c')
      expect(getWarnings()).toHaveLength(3)
    })

    it('resets warnings', () => {
      safeNumber(NaN, 0, 'a')
      expect(getWarnings()).toHaveLength(1)
      resetWarnings()
      expect(getWarnings()).toHaveLength(0)
    })
  })
})
