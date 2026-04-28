'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe, X } from 'lucide-react'
import { COUNTRY_CONFIGS, REGION_SLUG_TO_COUNTRY, getCountryFromCookie } from '@/lib/geo'

interface GeoMismatchBannerProps {
  pageRegionSlug: string // e.g. "australia", "usa"
}

export default function GeoMismatchBanner({ pageRegionSlug }: GeoMismatchBannerProps) {
  const [userCountry, setUserCountry] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setUserCountry(getCountryFromCookie())
  }, [])

  if (!userCountry || dismissed) return null

  const pageCountryCode = REGION_SLUG_TO_COUNTRY[pageRegionSlug]
  if (!pageCountryCode || userCountry === pageCountryCode) return null

  const userConfig = COUNTRY_CONFIGS[userCountry]
  if (!userConfig) return null // Unknown country — don't show banner

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-800 dark:bg-blue-950/40 mb-6">
      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
        <Globe className="h-4 w-4 shrink-0" />
        <span>
          You appear to be in <strong>{userConfig.name}</strong>.{' '}
          <Link
            href={userConfig.regionalPage}
            className="font-semibold underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-200"
          >
            View the {userConfig.name} version →
          </Link>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-blue-600 hover:text-blue-800 dark:text-blue-400"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
