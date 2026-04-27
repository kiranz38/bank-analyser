import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'CommBank Statement Analyzer – Find Hidden Subscriptions & Fees | CBA',
  description: 'Free Commonwealth Bank statement analyzer. Export your CommBank or CBA NetBank transactions as CSV and instantly find hidden subscriptions, bank fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/commbank-statement-analyzer' },
  openGraph: {
    title: 'CommBank Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for CommBank customers. Export your CBA NetBank statement and find every hidden subscription and fee instantly.',
    type: 'website',
    url: 'https://whereismymoneygo.com/commbank-statement-analyzer',
    siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to CommBank NetBank at netbank.com.au', note: 'Or open the CommBank app on your phone' },
  { step: 'Go to your account and click "View Transactions"', note: '' },
  { step: 'Set date range — last 90 days recommended', note: 'Wider range catches annual subscriptions' },
  { step: 'Click "Export" and choose CSV format', note: 'CommBank also supports OFX and PDF' },
  { step: 'Upload the file to Leaky Wallet', note: 'Results in 30 seconds — no account required' },
]

const commonLeaks = [
  'CommBank monthly account fees ($4/month for many standard accounts)',
  'Foreign currency conversion fees on US/UK subscriptions',
  'Overdrawn account dishonour fees',
  'Duplicate streaming services (Netflix + Stan + Binge running simultaneously)',
  'CommSec brokerage fees on inactive accounts',
]

const faqs = [
  { q: 'How do I export my CommBank statement as CSV?', a: 'Log in to NetBank, navigate to your account, click View Transactions, set your date range, click Export, and select CSV. The file downloads immediately and can be uploaded to Leaky Wallet.' },
  { q: 'Does this work with the CommBank app?', a: 'CommBank app exports are limited — we recommend exporting from NetBank on desktop for best results. The CSV format from NetBank works perfectly with Leaky Wallet.' },
  { q: 'Can I analyze my CommBank credit card as well?', a: 'Yes. Export your credit card transaction history from NetBank as a separate CSV and upload it. The analyzer works with both transaction accounts and credit cards.' },
  { q: 'Is this affiliated with Commonwealth Bank?', a: 'No. Leaky Wallet is an independent service with no affiliation with or endorsement from Commonwealth Bank of Australia.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

export default function CommbankAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Australia · Commonwealth Bank (CBA)</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            CommBank Statement Analyzer — Find Hidden Subscriptions & Fees
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">
          Export your Commonwealth Bank transactions from NetBank as CSV and upload to Leaky Wallet.
          Find every hidden subscription, recurring charge, and bank fee in 30 seconds — completely free.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg">
            <Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My CommBank Statement</Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Privacy-first</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your CommBank Statement</h2>
          <ol className="space-y-3">
            {exportSteps.map(({ step, note }, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <div>
                  <p>{step}</p>
                  {note && <p className="text-muted-foreground text-xs mt-0.5">{note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common CommBank Spending Leaks</h2>
          <ul className="space-y-2">
            {commonLeaks.map(leak => (
              <li key={leak} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span className="text-muted-foreground">{leak}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/anz-bank-statement-analyzer" className="text-primary hover:underline">ANZ Analyzer</Link>
          <Link href="/westpac-statement-analyzer" className="text-primary hover:underline">Westpac Analyzer</Link>
          <Link href="/nab-bank-statement-analyzer" className="text-primary hover:underline">NAB Analyzer</Link>
          <Link href="/bank-statement-analyzer-australia" className="text-primary hover:underline">Australia Guide</Link>
        </nav>
      </article>
    </main>
  )
}
