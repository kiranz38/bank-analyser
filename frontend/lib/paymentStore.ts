/**
 * In-memory payment store for Pro Report transactions.
 * In production, replace with a database (Postgres, etc.).
 *
 * Stores payment records, PDF buffers, and event logs.
 * Auto-cleans entries older than 2 hours.
 */

export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type PdfStatus = 'pending' | 'generated' | 'failed'
export type EmailStatus = 'pending' | 'sent' | 'failed'

export type EventType =
  | 'payment_started'
  | 'payment_success'
  | 'payment_webhook_verified'
  | 'pdf_generated'
  | 'pdf_failed'
  | 'email_sent'
  | 'email_failed'
  | 'pdf_downloaded'
  | 'refund_issued'
  | 'legal_accepted'

export interface PaymentEvent {
  type: EventType
  timestamp: string
  detail?: string
}

export interface PaymentRecord {
  sessionId: string
  paymentIntentId: string | null
  email: string
  status: PaymentStatus
  pdfStatus: PdfStatus
  emailStatus: EmailStatus
  reportId: string | null
  legalAcceptedAt: string | null
  events: PaymentEvent[]
  createdAt: string
}

// In-memory stores
const payments = new Map<string, PaymentRecord>()
const pdfBuffers = new Map<string, Buffer>()

const CLEANUP_INTERVAL = 10 * 60 * 1000 // 10 minutes
const MAX_AGE = 2 * 60 * 60 * 1000 // 2 hours

// Auto-cleanup old entries
setInterval(() => {
  const cutoff = Date.now() - MAX_AGE
  const keys = Array.from(payments.keys())
  for (const key of keys) {
    const record = payments.get(key)!
    if (new Date(record.createdAt).getTime() < cutoff) {
      payments.delete(key)
      if (record.reportId) pdfBuffers.delete(record.reportId)
    }
  }
}, CLEANUP_INTERVAL)

// ── CRUD Operations ──

export function createPayment(sessionId: string, email: string, legalAcceptedAt?: string): PaymentRecord {
  const record: PaymentRecord = {
    sessionId,
    paymentIntentId: null,
    email,
    status: 'pending',
    pdfStatus: 'pending',
    emailStatus: 'pending',
    reportId: null,
    legalAcceptedAt: legalAcceptedAt || null,
    events: [{ type: 'payment_started', timestamp: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  }
  if (legalAcceptedAt) {
    record.events.push({ type: 'legal_accepted', timestamp: legalAcceptedAt })
  }
  payments.set(sessionId, record)
  return record
}

export function getPayment(sessionId: string): PaymentRecord | undefined {
  return payments.get(sessionId)
}

export function getPaymentByIntent(paymentIntentId: string): PaymentRecord | undefined {
  const all = Array.from(payments.values())
  return all.find(r => r.paymentIntentId === paymentIntentId)
}

export function updatePayment(sessionId: string, updates: Partial<PaymentRecord>): PaymentRecord | undefined {
  const record = payments.get(sessionId)
  if (!record) return undefined
  Object.assign(record, updates)
  return record
}

export function logEvent(sessionId: string, type: EventType, detail?: string): void {
  const record = payments.get(sessionId)
  if (record) {
    record.events.push({ type, timestamp: new Date().toISOString(), detail })
  }
  console.log(`[PaymentLog] ${type} | session=${sessionId} | ${detail || ''}`)
}

// ── PDF Storage ──

export function storePdf(reportId: string, buffer: Buffer): void {
  pdfBuffers.set(reportId, buffer)
}

export function getPdf(reportId: string): Buffer | undefined {
  return pdfBuffers.get(reportId)
}

// ── Admin ──

export function getRecentPayments(limit = 20): Array<{
  email: string
  payment_id: string
  pdf_status: PdfStatus
  email_status: EmailStatus
  status: PaymentStatus
  timestamp: string
  events: PaymentEvent[]
}> {
  const all = Array.from(payments.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  return all.map(r => ({
    email: r.email,
    payment_id: r.paymentIntentId || r.sessionId,
    pdf_status: r.pdfStatus,
    email_status: r.emailStatus,
    status: r.status,
    timestamp: r.createdAt,
    events: r.events,
  }))
}
