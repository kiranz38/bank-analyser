import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

// Pages where we want to set the country cookie
const GEO_PATHS = [
  '/',
  '/bank-statement-analyzer',
  '/bank-statement-analyzer-australia',
  '/bank-statement-analyzer-usa',
  '/bank-statement-analyzer-uk',
  '/bank-statement-analyzer-canada',
  '/bank-statement-analyzer-new-zealand',
]

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl
  const response = NextResponse.next()

  // Set country cookie on relevant pages so client components can read it.
  // Vercel sets x-vercel-ip-country automatically on all edge requests.
  if (GEO_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    const country =
      req.headers.get('x-vercel-ip-country') ||
      (req.geo as { country?: string } | undefined)?.country ||
      ''

    if (country && !req.cookies.get('user_country')) {
      response.cookies.set('user_country', country, {
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: false,       // readable by client JS
        sameSite: 'lax',
        path: '/',
      })
    }
  }

  return response
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)',
  ],
}
