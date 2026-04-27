import { prisma } from './prisma'

type MetricEventName =
  | 'checkout_started'
  | 'payment_confirmed'
  | 'pdf_generated'
  | 'email_sent'
  | 'email_failed'
  | 'email_retried'
  | 'email_retry_succeeded'
  | 'refund_issued'
  | 'analysis_uploaded'
  | 'pro_upsell_viewed'

interface MetricContext {
  sessionId?: string
  email?: string
  valueUsd?: number
  [key: string]: string | number | boolean | null | undefined
}

export async function trackMetric(event: MetricEventName, context: MetricContext = {}): Promise<void> {
  const { sessionId, email, valueUsd, ...rest } = context
  try {
    await prisma.metricEvent.create({
      data: {
        event,
        sessionId: sessionId ?? null,
        email: email ?? null,
        valueUsd: valueUsd ?? null,
        meta: Object.keys(rest).length > 0 ? rest : undefined,
      },
    })
  } catch (err) {
    // Metrics are non-critical — never let them crash the main flow
    console.error('[Metrics] Failed to track event:', event, err)
  }
}

export async function getMetricsSummary() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalRevenue,
    revenueThisWeek,
    emailsSent,
    emailsFailed,
    checkouts,
    recentEvents,
  ] = await Promise.all([
    prisma.metricEvent.aggregate({
      where: { event: 'payment_confirmed' },
      _sum: { valueUsd: true },
    }),
    prisma.metricEvent.aggregate({
      where: { event: 'payment_confirmed', createdAt: { gte: sevenDaysAgo } },
      _sum: { valueUsd: true },
    }),
    prisma.metricEvent.count({ where: { event: 'email_sent', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.metricEvent.count({ where: { event: 'email_failed', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.metricEvent.count({ where: { event: 'checkout_started', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.metricEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const deliveryRate = emailsSent + emailsFailed > 0
    ? Math.round((emailsSent / (emailsSent + emailsFailed)) * 100)
    : null

  return {
    revenue: {
      total: totalRevenue._sum.valueUsd ?? 0,
      last7Days: revenueThisWeek._sum.valueUsd ?? 0,
    },
    email: {
      sent: emailsSent,
      failed: emailsFailed,
      deliveryRatePct: deliveryRate,
    },
    conversions: {
      checkoutsLast30d: checkouts,
    },
    recentEvents,
  }
}
