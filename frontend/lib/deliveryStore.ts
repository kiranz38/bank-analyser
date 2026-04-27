import { prisma } from './prisma'

export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type PdfStatus = 'pending' | 'generated' | 'failed'
export type EmailStatus = 'pending' | 'sent' | 'failed'

export interface DeliveryRecord {
  id: string
  stripeSessionId: string
  paymentIntentId: string | null
  email: string
  paymentStatus: string
  pdfStatus: string
  emailStatus: string
  reportId: string | null
  pdfBlobUrl: string | null
  retryCount: number
  lastAttemptAt: Date | null
  legalAcceptedAt: Date | null
  pdfSizeBytes: number | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

export async function createDelivery(
  stripeSessionId: string,
  email: string,
  legalAcceptedAt?: string
): Promise<DeliveryRecord> {
  return prisma.proReportDelivery.create({
    data: {
      stripeSessionId,
      email,
      legalAcceptedAt: legalAcceptedAt ? new Date(legalAcceptedAt) : null,
    },
  })
}

export async function getDelivery(stripeSessionId: string): Promise<DeliveryRecord | null> {
  return prisma.proReportDelivery.findUnique({
    where: { stripeSessionId },
  })
}

export async function updateDelivery(
  stripeSessionId: string,
  updates: {
    paymentIntentId?: string
    email?: string
    paymentStatus?: string
    pdfStatus?: string
    emailStatus?: string
    reportId?: string
    pdfBlobUrl?: string
    retryCount?: number
    lastAttemptAt?: Date
    pdfSizeBytes?: number
    errorMessage?: string
  }
): Promise<DeliveryRecord | null> {
  return prisma.proReportDelivery.update({
    where: { stripeSessionId },
    data: updates,
  })
}

export async function upsertDelivery(
  stripeSessionId: string,
  email: string,
  legalAcceptedAt?: string
): Promise<DeliveryRecord> {
  return prisma.proReportDelivery.upsert({
    where: { stripeSessionId },
    update: { email, legalAcceptedAt: legalAcceptedAt ? new Date(legalAcceptedAt) : undefined },
    create: {
      stripeSessionId,
      email,
      legalAcceptedAt: legalAcceptedAt ? new Date(legalAcceptedAt) : null,
    },
  })
}

export async function saveAnalysisSnapshot(
  deliveryId: string,
  results: object,
  sourceType = 'upload'
): Promise<void> {
  await prisma.analysisSnapshot.upsert({
    where: { deliveryId },
    update: { results: results as never },
    create: { deliveryId, results: results as never, sourceType },
  })
}

export async function getFailedDeliveries(): Promise<DeliveryRecord[]> {
  return prisma.proReportDelivery.findMany({
    where: {
      paymentStatus: 'paid',
      emailStatus: 'failed',
      retryCount: { lt: 3 },
      pdfBlobUrl: { not: null },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getRecentDeliveries(limit = 50): Promise<DeliveryRecord[]> {
  return prisma.proReportDelivery.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
