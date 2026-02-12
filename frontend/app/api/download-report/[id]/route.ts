import { NextRequest, NextResponse } from 'next/server'
import { getPdf } from '@/lib/paymentStore'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing report ID' }, { status: 400 })
  }

  const buffer = getPdf(id)

  if (!buffer) {
    return NextResponse.json(
      { error: 'Report not found or expired. Reports are available for 2 hours after generation.' },
      { status: 404 }
    )
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="leaky-wallet-pro-report.pdf"',
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, no-cache',
    },
  })
}
