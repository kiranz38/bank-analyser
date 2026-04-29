import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import { JsonLd } from '@/components/JsonLd'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const GA_TRACKING_ID = 'G-BD8VF1JPDZ'

export const metadata: Metadata = {
  title: {
    default: 'Leaky Wallet – Free Bank Statement Analyzer | Find Hidden Subscriptions & Spending Leaks',
    template: '%s | Leaky Wallet',
  },
  description: 'Free bank statement analyzer. Upload your PDF or CSV to discover hidden subscriptions, unnecessary fees, and spending leaks. Works with ANZ, Westpac, CommBank, NAB, Chase, Barclays and more. Get a personalized savings plan instantly.',
  keywords: [
    'bank statement analyzer',
    'find hidden subscriptions',
    'subscription tracker',
    'spending tracker',
    'where is my money going',
    'money leak detector',
    'spending analysis',
    'free financial analyzer',
    'ANZ statement analyzer',
    'CommBank statement analyzer',
    'Westpac statement analyzer',
    'NAB bank statement',
    'CSV bank statement analyzer',
    'PDF bank statement analyzer',
    'leaky wallet',
  ],
  metadataBase: new URL('https://whereismymoneygo.com'),
  alternates: {
    canonical: 'https://whereismymoneygo.com',
  },
  openGraph: {
    title: 'Leaky Wallet – Find Hidden Subscriptions & Spending Leaks',
    description: 'Free tool to analyze your bank statement. Find forgotten subscriptions, unnecessary fees, and see exactly where your money is going.',
    type: 'website',
    url: 'https://whereismymoneygo.com',
    siteName: 'Leaky Wallet',
    locale: 'en_AU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leaky Wallet – Free Bank Statement Analyzer',
    description: 'Upload your bank statement to find hidden subscriptions, fees, and spending leaks instantly. Free, private, no signup.',
    site: '@leakywallet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Leaky Wallet',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: 'https://whereismymoneygo.com',
  description: 'Free bank statement analyzer that finds hidden subscriptions, spending leaks, and unnecessary fees. Upload CSV or PDF from any bank.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
  },
  featureList: [
    'Hidden subscription detection',
    'Spending category breakdown',
    'Month-over-month comparison',
    'Bank fee identification',
    'Personalized savings action plan',
    'CSV and PDF support',
    'Privacy-first: no data stored',
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Leaky Wallet',
  url: 'https://whereismymoneygo.com',
  logo: 'https://whereismymoneygo.com/icon.svg',
  description: 'Privacy-first bank statement analyzer helping people find hidden subscriptions and spending leaks.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@whereismymoneygo.com',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Leaky Wallet',
  url: 'https://whereismymoneygo.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://whereismymoneygo.com/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <JsonLd schema={softwareAppSchema} />
        <JsonLd schema={organizationSchema} />
        <JsonLd schema={websiteSchema} />
      </head>
      <body className="font-sans antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
            gtag('config', 'AW-17939844094');
          `}
        </Script>
        <Providers>
          <Header />
          <div className="site-content">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
