import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Credit Card Statement Analyzer – Find Hidden Charges & Subscriptions',
  description: 'Free credit card statement analyzer. Upload your credit card CSV or PDF to find hidden subscriptions, recurring charges, and unnecessary fees. Works with any credit card from any bank.',
  alternates: { canonical: 'https://whereismymoneygo.com/credit-card-statement-analyzer' },
  openGraph: {
    title: 'Free Credit Card Statement Analyzer – Spot Every Hidden Charge',
    description: 'Upload your credit card statement to find hidden subscriptions, recurring charges, and unnecessary fees. Free, instant, works with any card.',
    type: 'website',
    url: 'https://whereismymoneygo.com/credit-card-statement-analyzer',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Can I analyze a credit card statement with Leaky Wallet?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — Leaky Wallet works identically for credit card and bank statements. Export your credit card transactions as CSV or PDF and upload them. Visa, Mastercard, American Express, and any other credit card statements are all supported.' } },
                { '@type': 'Question', name: 'How do I download my credit card statement as CSV?', acceptedAnswer: { '@type': 'Answer', text: "Log in to your card provider's website on desktop, navigate to Account Activity or Transactions, select a date range, and look for a Download or Export option. Most major card providers offer CSV or Excel export on the web version." } },
                { '@type': 'Question', name: 'What types of credit card charges does the analyzer detect?', acceptedAnswer: { '@type': 'Answer', text: 'All transaction types: subscription and recurring charges, dining and shopping, travel and transport, bank fees and interest, and one-time purchases. The analyzer also detects merchant name patterns that are specific to credit card billing.' } },
                { '@type': 'Question', name: 'Does the analyzer work with American Express statements?', acceptedAnswer: { '@type': 'Answer', text: "Yes — download your American Express transaction history as CSV from americanexpress.com and upload it to Leaky Wallet. The analyzer identifies all merchants including the 'AMEX*' prefixed charges." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Credit Card Statement Analyzer — Find Every Hidden Charge
        </h1>

        <p className="text-lg text-muted-foreground">
          Credit cards are where most subscription charges land — and where they're hardest to spot. Dozens of merchants, foreign currency charges, cashback transactions, and payment processor prefixes make credit card statements particularly difficult to review manually.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet analyzes your credit card statement exactly the same way as a bank statement. Upload your CSV or PDF and every charge is identified, categorized, and checked for recurring patterns — subscriptions you forgot, fees you didn't notice, and services you could cancel.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your Credit Card Statement</h2>
          <p className="text-sm text-muted-foreground">Upload your credit card statement and find every hidden charge — free, instant, private.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Analyze My Credit Card Statement
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What the Credit Card Analyzer Finds</h2>
          <ul className="space-y-3">
            <li key='Subscription charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscription charges</p>
              <p className="text-xs text-muted-foreground pl-6">Netflix, Spotify, Adobe, Apple, and every recurring service charged to your card</p>
            </li>
            <li key='Foreign currency charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Foreign currency charges</p>
              <p className="text-xs text-muted-foreground pl-6">US-billed services with FX conversion fees on top — often hidden in the total</p>
            </li>
            <li key='Annual fees' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Annual fees</p>
              <p className="text-xs text-muted-foreground pl-6">Once-a-year card fees and membership renewals that are easy to overlook</p>
            </li>
            <li key='Interest and late fees' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Interest and late fees</p>
              <p className="text-xs text-muted-foreground pl-6">Recurring interest charges that indicate a balance management issue</p>
            </li>
            <li key='Duplicate charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Duplicate charges</p>
              <p className="text-xs text-muted-foreground pl-6">The same merchant appearing twice in the same period</p>
            </li>
            <li key='Spending by category' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Spending by category</p>
              <p className="text-xs text-muted-foreground pl-6">Where your credit card spending goes — dining, shopping, travel, subscriptions</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Analyze Your Credit Card Statement</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Download your statement.</strong> Log in to your credit card provider's website, navigate to Statements or Transaction History, and download as CSV or PDF.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload to the analyzer.</strong> Drop your file — results appear in under 30 seconds. Your data is processed privately and immediately deleted.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Review subscriptions and recurring charges.</strong> Every recurring charge is grouped by merchant with the total yearly cost visible.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Find and cancel what you don't use.</strong> The analyzer identifies subscriptions you may have forgotten — cancel them directly or use the cancellation guide.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I analyze a credit card statement with Leaky Wallet?', a: 'Yes — Leaky Wallet works identically for credit card and bank statements. Export your credit card transactions as CSV or PDF and upload them. Visa, Mastercard, American Express, and any other credit card statements are all supported.' },
          { q: 'How do I download my credit card statement as CSV?', a: "Log in to your card provider's website on desktop, navigate to Account Activity or Transactions, select a date range, and look for a Download or Export option. Most major card providers offer CSV or Excel export on the web version." },
          { q: 'What types of credit card charges does the analyzer detect?', a: 'All transaction types: subscription and recurring charges, dining and shopping, travel and transport, bank fees and interest, and one-time purchases. The analyzer also detects merchant name patterns that are specific to credit card billing.' },
          { q: 'Does the analyzer work with American Express statements?', a: "Yes — download your American Express transaction history as CSV from americanexpress.com and upload it to Leaky Wallet. The analyzer identifies all merchants including the 'AMEX*' prefixed charges." },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/american-express-statement-analyzer" className="text-primary hover:underline">Amex Statement Analyzer</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/credit-card-statement-analyzer' />
    </main>
  )
}
