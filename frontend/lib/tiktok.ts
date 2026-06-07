/**
 * TikTok Pixel event tracking
 *
 * Wraps window.ttq with typed helpers and SHA-256 hashing for Advanced Matching.
 * Maps Leaky Wallet's conversion funnel to TikTok's standard event taxonomy:
 *
 *   Analysis shown     → ViewContent
 *   Pro Report clicked → InitiateCheckout
 *   Pay clicked        → AddPaymentInfo
 *   Payment success    → Purchase
 *   User signed up     → CompleteRegistration
 *   User logged in     → ttq.identify (Advanced Matching)
 */

declare global {
  interface Window {
    ttq?: {
      identify: (data: TikTokIdentity) => void
      track: (event: string, params?: object, options?: object) => void
      page: () => void
    }
  }
}

interface TikTokIdentity {
  email?: string
  phone_number?: string
  external_id?: string
}

const PRO_REPORT_CONTENT = {
  content_id: 'pro-report',
  content_type: 'product',
  content_name: 'Leaky Wallet Pro Report',
}

/** SHA-256 hash using Web Crypto API (required by TikTok for PII fields) */
async function sha256(value: string): Promise<string> {
  const normalized = value.toLowerCase().trim()
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalized)
  )
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function ttq() {
  return typeof window !== 'undefined' ? window.ttq : undefined
}

/** Call after login/session load to enable Advanced Matching */
export async function tiktokIdentify(email: string, userId?: string): Promise<void> {
  const pixel = ttq()
  if (!pixel) return
  try {
    const identity: TikTokIdentity = {
      email: await sha256(email),
    }
    if (userId) {
      identity.external_id = await sha256(userId)
    }
    pixel.identify(identity)
  } catch {
    // Non-fatal — pixel still works without identity
  }
}

/** User sees their analysis results */
export function tiktokViewContent(): void {
  ttq()?.track('ViewContent', {
    contents: [PRO_REPORT_CONTENT],
    value: 0,
    currency: 'USD',
  })
}

/** User clicks "Get Pro Report" (moves to checkout state) */
export function tiktokInitiateCheckout(): void {
  ttq()?.track('InitiateCheckout', {
    contents: [PRO_REPORT_CONTENT],
    value: 1.99,
    currency: 'USD',
  })
}

/** User clicks "Pay" — about to be redirected to Stripe */
export function tiktokAddPaymentInfo(): void {
  ttq()?.track('AddPaymentInfo', {
    contents: [PRO_REPORT_CONTENT],
    value: 1.99,
    currency: 'USD',
  })
}

/** Payment confirmed — primary revenue conversion */
export function tiktokPurchase(eventId?: string): void {
  ttq()?.track(
    'Purchase',
    {
      contents: [PRO_REPORT_CONTENT],
      value: 1.99,
      currency: 'USD',
    },
    eventId ? { event_id: eventId } : undefined
  )
}

/** User completes signup */
export function tiktokCompleteRegistration(): void {
  ttq()?.track('CompleteRegistration', {
    contents: [{ content_id: 'signup', content_type: 'product', content_name: 'Leaky Wallet Account' }],
    value: 0,
    currency: 'USD',
  })
}
