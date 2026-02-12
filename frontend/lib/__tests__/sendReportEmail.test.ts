import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Resend SDK before importing module under test
const mockSend = vi.fn()

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend }
    },
  }
})

// Set env vars before importing module
vi.stubEnv('RESEND_API_KEY', 'test_key')
vi.stubEnv('RESEND_FROM_PRIMARY', 'Primary <primary@example.com>')
vi.stubEnv('RESEND_FROM_FALLBACK', 'Fallback <fallback@resend.dev>')
vi.stubEnv('EMAIL_SENDING_ENABLED', 'true')
vi.stubEnv('EMAIL_FALLBACK_ENABLED', 'true')

const { sendReportEmail } = await import('../sendReportEmail')

const baseParams = {
  toEmail: 'user@example.com',
  subject: 'Test Report',
  html: '<p>Your report</p>',
}

describe('sendReportEmail', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('succeeds with primary sender on first attempt', async () => {
    mockSend.mockResolvedValueOnce({
      data: { id: 'msg_primary_123' },
      error: null,
    })

    const result = await sendReportEmail(baseParams)

    expect(result.ok).toBe(true)
    expect(result.usedFallback).toBe(false)
    expect(result.resendMessageId).toBe('msg_primary_123')
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Primary <primary@example.com>',
        to: 'user@example.com',
      })
    )
  })

  it('falls back when primary returns 403 domain not verified', async () => {
    // Primary fails with 403
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { statusCode: 403, message: 'Domain not verified', name: 'validation_error' },
    })

    // Fallback succeeds
    mockSend.mockResolvedValueOnce({
      data: { id: 'msg_fallback_456' },
      error: null,
    })

    const result = await sendReportEmail(baseParams)

    expect(result.ok).toBe(true)
    expect(result.usedFallback).toBe(true)
    expect(result.resendMessageId).toBe('msg_fallback_456')
    expect(mockSend).toHaveBeenCalledTimes(2)

    // Verify second call used fallback sender
    expect(mockSend.mock.calls[1][0]).toMatchObject({
      from: 'Fallback <fallback@resend.dev>',
    })
  })

  it('returns ok=false when both primary and fallback fail', async () => {
    // Primary fails with 403
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { statusCode: 403, message: 'Domain not verified', name: 'validation_error' },
    })

    // Fallback also fails
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { statusCode: 500, message: 'Internal error', name: 'server_error' },
    })

    const result = await sendReportEmail(baseParams)

    expect(result.ok).toBe(false)
    expect(result.usedFallback).toBe(true)
    expect(result.errorCode).toBe('FALLBACK_FAILED')
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('does not fallback on non-domain errors (e.g. rate limit)', async () => {
    // Primary fails with 429 (not a domain error)
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { statusCode: 429, message: 'Rate limit exceeded', name: 'rate_limit_error' },
    })

    const result = await sendReportEmail(baseParams)

    expect(result.ok).toBe(false)
    expect(result.usedFallback).toBe(false)
    expect(result.errorCode).toBe('PRIMARY_FAILED')
    // Should NOT have attempted fallback
    expect(mockSend).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid email without calling Resend', async () => {
    const result = await sendReportEmail({
      ...baseParams,
      toEmail: 'not-an-email',
    })

    expect(result.ok).toBe(false)
    expect(result.errorCode).toBe('INVALID_EMAIL')
    expect(mockSend).not.toHaveBeenCalled()
  })
})
