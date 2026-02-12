/**
 * Dual-sender email utility with automatic fallback.
 *
 * Tries primary domain sender first (reports@whereismymoneygo.com).
 * If Resend rejects with 403 "Domain not verified", retries once
 * using the fallback sender (onboarding@resend.dev).
 *
 * Never blocks the purchase flow — caller should always allow
 * PDF download regardless of email outcome.
 */

import { Resend } from 'resend'
import crypto from 'crypto'

// ── Config ──

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_PRIMARY =
  process.env.RESEND_FROM_PRIMARY ||
  process.env.EMAIL_FROM ||
  'Leaky Wallet <reports@whereismymoneygo.com>'

const FROM_FALLBACK =
  process.env.RESEND_FROM_FALLBACK ||
  'Leaky Wallet <onboarding@resend.dev>'

const SENDING_ENABLED = process.env.EMAIL_SENDING_ENABLED !== 'false'
const FALLBACK_ENABLED = process.env.EMAIL_FALLBACK_ENABLED !== 'false'

// ── Types ──

export interface EmailAttachment {
  filename: string
  content: Buffer
  contentType?: string
}

export interface SendReportEmailParams {
  toEmail: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
  downloadUrl?: string
}

export interface SendReportEmailResult {
  ok: boolean
  usedFallback: boolean
  resendMessageId?: string
  errorCode?: string
  errorMessage?: string
}

// ── Helpers ──

function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 12)
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    if (typeof err.message === 'string') return err.message
  }
  return String(error)
}

function isDomainNotVerifiedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const err = error as Record<string, unknown>

  // Resend SDK returns { statusCode: 403, message: "..." }
  if (err.statusCode === 403) return true

  const msg = String(err.message || '').toLowerCase()
  if (msg.includes('domain') && msg.includes('not verified')) return true
  if (msg.includes('403')) return true

  return false
}

// ── Main function ──

export async function sendReportEmail(
  params: SendReportEmailParams
): Promise<SendReportEmailResult> {
  const { toEmail, subject, html, attachments } = params
  const emailHash = hashEmail(toEmail)

  // Guard: sending disabled
  if (!SENDING_ENABLED) {
    console.log(
      `[Email] event="email_skip" reason="sending_disabled" emailHash=${emailHash}`
    )
    return { ok: false, usedFallback: false, errorCode: 'SENDING_DISABLED' }
  }

  // Guard: invalid email
  if (!toEmail || !isEmailValid(toEmail)) {
    console.log(
      `[Email] event="email_skip" reason="invalid_email" emailHash=${emailHash}`
    )
    return { ok: false, usedFallback: false, errorCode: 'INVALID_EMAIL' }
  }

  // Guard: no API key
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] event="email_skip" reason="no_api_key"`)
    return { ok: false, usedFallback: false, errorCode: 'NO_API_KEY' }
  }

  const resendPayload = {
    to: toEmail,
    subject,
    html,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  }

  // ── Attempt 1: Primary sender ──
  try {
    console.log(
      `[Email] event="email_send_attempt" attempt="primary" emailHash=${emailHash}`
    )

    const { data, error } = await resend.emails.send({
      ...resendPayload,
      from: FROM_PRIMARY,
    })

    if (error) {
      throw error
    }

    console.log(
      `[Email] event="email_send_result" attempt="primary" ok=true messageId=${data?.id} emailHash=${emailHash}`
    )
    return {
      ok: true,
      usedFallback: false,
      resendMessageId: data?.id,
    }
  } catch (primaryError) {
    const primaryMsg = extractErrorMessage(primaryError)

    console.log(
      `[Email] event="email_send_result" attempt="primary" ok=false error="${primaryMsg}" emailHash=${emailHash}`
    )

    // ── Attempt 2: Fallback sender (only on domain-not-verified) ──
    if (FALLBACK_ENABLED && isDomainNotVerifiedError(primaryError)) {
      try {
        console.log(
          `[Email] event="email_send_attempt" attempt="fallback" emailHash=${emailHash}`
        )

        const { data, error } = await resend.emails.send({
          ...resendPayload,
          from: FROM_FALLBACK,
        })

        if (error) {
          throw error
        }

        console.log(
          `[Email] event="email_send_result" attempt="fallback" ok=true messageId=${data?.id} emailHash=${emailHash}`
        )
        return {
          ok: true,
          usedFallback: true,
          resendMessageId: data?.id,
        }
      } catch (fallbackError) {
        const fallbackMsg = extractErrorMessage(fallbackError)

        console.log(
          `[Email] event="email_send_result" attempt="fallback" ok=false error="${fallbackMsg}" emailHash=${emailHash}`
        )
        return {
          ok: false,
          usedFallback: true,
          errorCode: 'FALLBACK_FAILED',
          errorMessage: fallbackMsg,
        }
      }
    }

    // Primary failed with a non-domain error — no fallback
    return {
      ok: false,
      usedFallback: false,
      errorCode: 'PRIMARY_FAILED',
      errorMessage: primaryMsg,
    }
  }
}
