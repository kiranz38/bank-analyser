import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'

const GA_TRACKING_ID = 'G-BD8VF1JPDZ'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer – Find Hidden Subscriptions & Spending Leaks | Where Is My Money Go',
  description: 'Free bank statement analyzer. Upload your PDF or CSV to discover hidden subscriptions, unnecessary fees, and spending leaks. Works with ANZ, Westpac, CommBank, NAB. Get a personalized savings plan.',
  keywords: ['bank statement analyzer', 'spending tracker', 'subscription finder', 'money leak detector', 'personal finance', 'ANZ statement', 'Westpac statement', 'CommBank statement', 'where is my money going'],
  alternates: {
    canonical: 'https://whereismymoneygo.com',
  },
  openGraph: {
    title: 'Bank Statement Analyzer – Find Hidden Subscriptions & Spending Leaks',
    description: 'Free tool to analyze your bank statement. Find forgotten subscriptions, unnecessary fees, and see where your money is really going.',
    type: 'website',
    url: 'https://whereismymoneygo.com',
    siteName: 'Where Is My Money Go',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bank Statement Analyzer – Find Hidden Spending Leaks',
    description: 'Free tool to analyze your bank statement and find hidden subscriptions & fees.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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
