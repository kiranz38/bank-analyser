import { NextRequest, NextResponse } from 'next/server'
import { getProvider, isAffiliateEnabled } from '@/lib/affiliateRegistry'

export async function GET(request: NextRequest) {
  if (!isAffiliateEnabled()) {
    return NextResponse.json({ error: 'Affiliate redirects are disabled' }, { status: 404 })
  }

  const pid = request.nextUrl.searchParams.get('pid')

  if (!pid || pid.length > 100) {
    return NextResponse.json(
      { error: 'Missing or invalid provider ID' },
      { status: 400 }
    )
  }

  const provider = getProvider(pid)

  if (!provider || !provider.isActive) {
    return NextResponse.json(
      { error: 'Provider not found' },
      { status: 404 }
    )
  }

  const target = provider.affiliateUrl || provider.baseUrl

  if (!target) {
    return NextResponse.json(
      { error: 'No redirect URL available' },
      { status: 404 }
    )
  }

  // Validate URL
  try {
    new URL(target)
  } catch {
    console.error(`[Redirect] Malformed URL for pid=${pid}: ${target}`)
    return NextResponse.json(
      { error: 'Malformed redirect URL' },
      { status: 500 }
    )
  }

  console.log(`[Redirect] pid=${pid} network=${provider.network} hasAffiliate=${!!provider.affiliateUrl}`)

  return NextResponse.redirect(target, {
    status: 302,
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  })
}
