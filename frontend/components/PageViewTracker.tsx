'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { trackPageView } from '@/lib/analytics'
import { tiktokIdentify } from '@/lib/tiktok'

export default function PageViewTracker() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const identifiedRef = useRef<string | null>(null)

  useEffect(() => {
    trackPageView(pathname, document.title)
  }, [pathname])

  // Call ttq.identify() once per session when user is logged in
  useEffect(() => {
    const email = session?.user?.email
    if (email && identifiedRef.current !== email) {
      identifiedRef.current = email
      tiktokIdentify(email, (session?.user as { id?: string })?.id)
    }
  }, [session])

  return null
}
