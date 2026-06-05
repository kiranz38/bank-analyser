import { NextRequest, NextResponse } from 'next/server'
import { getRecentPayments } from '@/lib/paymentStore'
import { getRecentDeliveries } from '@/lib/deliveryStore'
import { getMetricsSummary } from '@/lib/metrics'

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || !process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [memoryPayments, dbDeliveries, metrics] = await Promise.all([
    Promise.resolve(getRecentPayments(20)),
    getRecentDeliveries(50),
    getMetricsSummary(),
  ])

  return NextResponse.json({
    metrics,
    db: {
      count: dbDeliveries.length,
      deliveries: dbDeliveries,
    },
    memory: {
      count: memoryPayments.length,
      payments: memoryPayments,
    },
  })
}
