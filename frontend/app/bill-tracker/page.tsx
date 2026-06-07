import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Free Bill Tracker – Find & Track Every Bill Automatically From Your Bank Statement',
  description: "Free bill tracker. Upload your bank statement to automatically find and track every bill — utilities, subscriptions, insurance, rent, and recurring charges. See what's due, what changed, and what you could cut.",
  alternates: { canonical: 'https://whereismymoneygo.com/bill-tracker' },
  openGraph: {
    title: 'Free Bill Tracker – Every Bill Found in Your Bank Statement Automatically',
    description: 'Upload your bank statement and every bill is automatically found and tracked — utilities, subscriptions, insurance, and more. Free, instant.',
    type: 'website',
    url: 'https://whereismymoneygo.com/bill-tracker',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I track all my bills in one place?', acceptedAnswer: { '@type': 'Answer', text: 'Upload your bank statement to Leaky Wallet and every recurring charge — bills, subscriptions, and memberships — is automatically detected and displayed in one list. No manual entry or spreadsheet required.' } },
                { '@type': 'Question', name: 'How do I know what bills I have?', acceptedAnswer: { '@type': 'Answer', text: "Export your last 90 days of transactions from your bank's website and upload to Leaky Wallet. Every recurring charge is surfaced automatically, including ones you may have forgotten." } },
                { '@type': 'Question', name: 'How do I track bills without a budgeting app?', acceptedAnswer: { '@type': 'Answer', text: 'Upload your bank statement periodically (monthly or quarterly) for a complete bill review. This gives you full visibility without requiring an app or permanent bank account connection.' } },
                { '@type': 'Question', name: 'What if a bill amount changed without me knowing?', acceptedAnswer: { '@type': 'Answer', text: 'The analyzer detects price changes in recurring charges — flagging when a subscription or bill amount changed compared to previous months. This catches price increases that often happen without notification.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Automatic Bill Tracker — Every Bill Found in 30 Seconds
        </h1>

        <p className="text-lg text-muted-foreground">
          Manual bill tracking requires spreadsheets, calendar reminders, and constant updating. Leaky Wallet automatically finds every bill in your bank statement — utilities, subscriptions, insurance, rent, and all other recurring charges — with amounts, dates, and yearly totals.
        </p>

        <p className="text-muted-foreground">
          Upload your bank statement and see every bill you're paying at once. You'll immediately spot bills that have increased, bills for services you don't use, and bills you completely forgot about.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find All Your Bills Automatically</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and see every bill in one place — no manual entry required.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Track My Bills
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Types of Bills Found Automatically</h2>
          <ul className="space-y-3">
            <li key='Utility bills' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Utility bills</p>
              <p className="text-xs text-muted-foreground pl-6">Electricity, gas, water — with month-over-month amount changes flagged</p>
            </li>
            <li key='Subscription services' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscription services</p>
              <p className="text-xs text-muted-foreground pl-6">Netflix, Spotify, Adobe, Microsoft 365, and all recurring digital services</p>
            </li>
            <li key='Insurance premiums' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Insurance premiums</p>
              <p className="text-xs text-muted-foreground pl-6">Health, car, home, and life insurance — often increasing annually</p>
            </li>
            <li key='Loan and finance repayments' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Loan and finance repayments</p>
              <p className="text-xs text-muted-foreground pl-6">Car loans, personal loans, buy-now-pay-later plans</p>
            </li>
            <li key='Phone and internet plans' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Phone and internet plans</p>
              <p className="text-xs text-muted-foreground pl-6">Monthly telecoms bills across all providers</p>
            </li>
            <li key='Memberships' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Memberships</p>
              <p className="text-xs text-muted-foreground pl-6">Gym, professional, and club memberships — including inactive ones still charging</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Track All Your Bills</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your bank statement.</strong> Download 90 days of transactions as CSV or PDF from your bank's website.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload to the bill tracker.</strong> Every recurring charge is automatically detected and grouped by merchant.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Review your complete bill list.</strong> See every bill with the amount, frequency, and total yearly cost.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Identify bills to reduce or cancel.</strong> Flag bills for services you no longer use and cancel or negotiate them.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I track all my bills in one place?', a: 'Upload your bank statement to Leaky Wallet and every recurring charge — bills, subscriptions, and memberships — is automatically detected and displayed in one list. No manual entry or spreadsheet required.' },
          { q: 'How do I know what bills I have?', a: "Export your last 90 days of transactions from your bank's website and upload to Leaky Wallet. Every recurring charge is surfaced automatically, including ones you may have forgotten." },
          { q: 'How do I track bills without a budgeting app?', a: 'Upload your bank statement periodically (monthly or quarterly) for a complete bill review. This gives you full visibility without requiring an app or permanent bank account connection.' },
          { q: 'What if a bill amount changed without me knowing?', a: 'The analyzer detects price changes in recurring charges — flagging when a subscription or bill amount changed compared to previous months. This catches price increases that often happen without notification.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/recurring-payments" className="text-primary hover:underline">Recurring Payments Finder</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/bill-tracker' />
    </main>
  )
}
