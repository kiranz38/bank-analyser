import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import PageViewTracker from '@/components/PageViewTracker'
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
    // High-volume intent queries
    'where did my money go',
    'where is my money going',
    'why am I always broke',
    'how to track spending',
    'analyze bank statement',
    'bank statement analyzer',
    // Tool-specific
    'find hidden subscriptions',
    'cancel unwanted subscriptions',
    'what subscriptions am I paying for',
    'subscription tracker',
    'spending tracker',
    'free expense tracker',
    'monthly expense tracker',
    'personal finance tracker',
    'money management tool',
    // Features
    'money leak detector',
    'spending analysis',
    'bank fee checker',
    'recurring charges finder',
    'free financial analyzer',
    'AI bank statement reader',
    // File formats
    'CSV bank statement analyzer',
    'PDF bank statement analyzer',
    // Australian banks
    'ANZ statement analyzer',
    'CommBank statement analyzer',
    'Westpac statement analyzer',
    'NAB bank statement analyzer',
    // US banks
    'Chase bank statement analyzer',
    'Bank of America statement analyzer',
    // UK/global
    'Barclays statement analyzer',
    'HSBC statement analyzer',
    // Brand
    'leaky wallet',
    'whereismymoneygo',
  ],
  metadataBase: new URL('https://whereismymoneygo.com'),
  alternates: {
    canonical: 'https://whereismymoneygo.com',
    languages: {
      'en-AU': 'https://whereismymoneygo.com/bank-statement-analyzer-australia',
      'en-US': 'https://whereismymoneygo.com/bank-statement-analyzer-usa',
      'en-GB': 'https://whereismymoneygo.com/bank-statement-analyzer-uk',
      'en-CA': 'https://whereismymoneygo.com/bank-statement-analyzer-canada',
      'en-NZ': 'https://whereismymoneygo.com/bank-statement-analyzer-new-zealand',
    },
  },
  openGraph: {
    title: 'Leaky Wallet – Find Hidden Subscriptions & Spending Leaks',
    description: 'Free tool to analyze your bank statement. Find forgotten subscriptions, unnecessary fees, and see exactly where your money is going.',
    type: 'website',
    url: 'https://whereismymoneygo.com',
    siteName: 'Leaky Wallet',
    locale: 'en_AU',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Leaky Wallet – Free Bank Statement Analyzer – Find hidden subscriptions and spending leaks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leaky Wallet – Free Bank Statement Analyzer',
    description: 'Upload your bank statement to find hidden subscriptions, fees, and spending leaks instantly. Free, private, no signup.',
    site: '@leakywallet',
    images: ['/opengraph-image'],
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Leaky Wallet',
  },
  formatDetection: {
    telephone: false,
  },
}

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Leaky Wallet',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: 'https://whereismymoneygo.com',
  description: 'Free bank statement analyzer that finds hidden subscriptions, spending leaks, and unnecessary fees. Upload CSV or PDF from any bank — ANZ, CommBank, Westpac, NAB, Chase, Barclays, and more.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Analysis',
      price: '0',
      priceCurrency: 'USD',
      description: 'Full bank statement analysis, subscription detection, spending breakdown — free, no account required.',
    },
    {
      '@type': 'Offer',
      name: 'Pro Report',
      price: '1.99',
      priceCurrency: 'USD',
      description: 'Downloadable PDF with financial health score, 12-month savings projection, and personalized action plan.',
    },
  ],
  featureList: [
    'Hidden subscription detection',
    'Spending category breakdown with charts',
    'Month-over-month spending comparison',
    'Bank fee and charge identification',
    'Personalized savings action plan',
    'CSV and PDF bank statement support',
    'Privacy-first: no data stored on servers',
    'Works with ANZ, CommBank, Westpac, NAB, Chase, Barclays, HSBC',
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
    <html lang="en" className={inter.variable}>
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
          <PageViewTracker />
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
