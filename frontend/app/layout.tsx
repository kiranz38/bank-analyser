import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer - Find Hidden Subscriptions, Fees & Spending Leaks',
  description: 'Upload your bank statement CSV to discover hidden subscriptions, unnecessary fees, and spending leaks. Get a personalized recovery plan to save money.',
  keywords: ['bank statement analyzer', 'spending tracker', 'subscription finder', 'money leak detector', 'personal finance'],
  openGraph: {
    title: 'Bank Statement Analyzer - Find Hidden Spending Leaks',
    description: 'Upload your bank CSV and see exactly where your money is going. Find subscriptions, fees, and get savings tips.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
