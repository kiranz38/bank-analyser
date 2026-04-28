export interface CountryConfig {
  country: string       // ISO code
  name: string
  currency: string
  currencySymbol: string
  regionalPage: string
  banks: string[]
  fileFormats: string[]
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  AU: {
    country: 'AU',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: '$',
    regionalPage: '/bank-statement-analyzer-australia',
    banks: ['ANZ', 'CommBank', 'Westpac', 'NAB', 'Macquarie', 'ING'],
    fileFormats: ['CSV from NetBank, ANZ Internet Banking, Westpac Online'],
  },
  US: {
    country: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    regionalPage: '/bank-statement-analyzer-usa',
    banks: ['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One'],
    fileFormats: ['CSV from Chase, Bank of America, Wells Fargo, Mint'],
  },
  GB: {
    country: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    regionalPage: '/bank-statement-analyzer-uk',
    banks: ['Barclays', 'HSBC', 'Lloyds', 'NatWest', 'Monzo', 'Starling'],
    fileFormats: ['CSV from Barclays, HSBC Online, Lloyds Internet Banking'],
  },
  CA: {
    country: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: '$',
    regionalPage: '/bank-statement-analyzer-canada',
    banks: ['TD Bank', 'RBC', 'Scotiabank', 'BMO', 'CIBC'],
    fileFormats: ['CSV from TD EasyWeb, RBC Online Banking, Scotiabank'],
  },
  NZ: {
    country: 'NZ',
    name: 'New Zealand',
    currency: 'NZD',
    currencySymbol: '$',
    regionalPage: '/bank-statement-analyzer-new-zealand',
    banks: ['ANZ NZ', 'ASB', 'BNZ', 'Westpac NZ', 'Kiwibank'],
    fileFormats: ['CSV from ANZ Internet Banking, ASB FastNet, BNZ'],
  },
}

// Which regional page slug maps to which country code
export const REGION_SLUG_TO_COUNTRY: Record<string, string> = {
  australia: 'AU',
  usa: 'US',
  uk: 'GB',
  canada: 'CA',
  'new-zealand': 'NZ',
}

export const DEFAULT_CONFIG: CountryConfig = {
  country: '',
  name: '',
  currency: 'USD',
  currencySymbol: '$',
  regionalPage: '/bank-statement-analyzer',
  banks: ['Chase', 'ANZ', 'Barclays', 'CommBank', 'TD Bank'],
  fileFormats: ['CSV or PDF from any bank worldwide'],
}

export function getCountryConfig(countryCode: string): CountryConfig {
  return COUNTRY_CONFIGS[countryCode] || DEFAULT_CONFIG
}

export function getCountryFromCookie(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)user_country=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}
