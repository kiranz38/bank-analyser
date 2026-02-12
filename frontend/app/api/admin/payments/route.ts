import { NextRequest, NextResponse } from 'next/server'
import { getRecentPayments } from '@/lib/paymentStore'

export async function GET(request: NextRequest) {
  // Simple API key auth — in production, use proper admin authentication
  const apiKey = request.headers.get('x-api-key')
  if (process.env.NODE_ENV === 'production' && apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payments = getRecentPayments(20)

  return NextResponse.json({
    count: payments.length,
    payments,
  })
}
