import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const analyses = await prisma.analysis.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      results: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ analyses })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, results } = await request.json()

    if (!results) {
      return NextResponse.json({ error: 'Results are required' }, { status: 400 })
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        title: title || null,
        results,
      },
    })

    return NextResponse.json({ analysis }, { status: 201 })
  } catch (error) {
    console.error('Save analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    )
  }
}
