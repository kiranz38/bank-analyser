'use client'

import { useEffect, useState } from 'react'
import { getCountryConfig, getCountryFromCookie, type CountryConfig, DEFAULT_CONFIG } from './geo'

export function useCountry(): CountryConfig {
  const [config, setConfig] = useState<CountryConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const code = getCountryFromCookie()
    setConfig(getCountryConfig(code))
  }, [])

  return config
}
