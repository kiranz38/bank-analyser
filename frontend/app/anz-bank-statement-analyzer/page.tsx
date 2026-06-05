import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'ANZ Bank Statement Analyzer – Find Hidden Subscriptions & Spending Leaks',
  description: 'Free ANZ bank statement analyzer. Export your ANZ transactions as CSV and upload to instantly find hidden subscriptions, bank fees, and spending leaks. Works with ANZ Plus and ANZ Internet Banking.',
  alternates: { canonical: 'https://whereismymoneygo.com/anz-bank-statement-analyzer' },
  openGraph: {
    title: 'ANZ Bank Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for ANZ customers. Export your ANZ statement as CSV and find every hidden subscription, fee, and spending leak instantly.',
    type: 'website',
    url: 'https://whereismymoneygo.com/anz-bank-statement-analyzer',
    siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to ANZ Internet Banking at anz.com.au', note: 'Or open the ANZ App on your phone' },
  { step: 'Go to your account and select "Transaction History"', note: 'Choose the account you want to analyze' },
  { step: 'Set date range to last 90 days', note: 'More history = better subscription detection' },
  { step: 'Click "Export" and choose CSV format', note: 'ANZ also supports PDF — both work with Leaky Wallet' },
  { step: 'Upload the downloaded file to Leaky Wallet', note: 'Results appear within 30 seconds' },
]

const commonAnzLeaks = [
  'ANZ Everyday Account monthly fee ($5/month if balance conditions not met)',
  'ANZ Safe Custody fee charged annually',
  'International transaction fees on online subscriptions (typically 3%)',
  'Overseas ATM withdrawal fees',
  'Forgotten subscriptions billed in USD showing as variable AUD amounts',
]

const faqs = [
  { q: 'How do I export my ANZ bank statement as CSV?', a: 'Log in to ANZ Internet Banking, go to your account, select Transaction History, set your desired date range, click Export, and choose CSV or OFX format. The file downloads to your device and can be uploaded directly to Leaky Wallet.' },
  { q: 'Does Leaky Wallet work with ANZ Plus?', a: 'Yes. Export your ANZ Plus transaction history as CSV from the ANZ App and upload it to Leaky Wallet. The analyzer handles all ANZ transaction formats.' },
  { q: 'What ANZ fees does the analyzer detect?', a: 'The analyzer detects monthly account fees, transaction fees, international transaction fees, overdraft fees, and any other recurring bank charges — and shows you the total cost per year.' },
  { q: 'Can I analyze multiple ANZ accounts?', a: 'Yes. Export each account separately and upload them one at a time, or combine them into a single CSV before uploading.' },
  { q: 'Is this affiliated with ANZ Bank?', a: 'No. Leaky Wallet is an independent tool. ANZ Bank has no affiliation with or endorsement of this service.' },
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

export default function AnzStatementAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Australia · ANZ Bank</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ANZ Bank Statement Analyzer — Find Hidden Subscriptions & Fees
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">
          Export your ANZ transactions as CSV and upload them to Leaky Wallet. In 30 seconds,
          you&apos;ll see every subscription, recurring charge, and bank fee — with estimated annual savings.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your ANZ Statement Now</h2>
          <p className="text-sm text-muted-foreground">Free · No signup · Your data is never stored</p>
          <Button asChild size="lg">
            <Link href="/"><Search className="mr-2 h-4 w-4" />Analyze ANZ Statement</Link>
          </Button>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your ANZ Bank Statement</h2>
          <ol className="space-y-3">
            {exportSteps.map(({ step, note }, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <div>
                  <p className="text-foreground">{step}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{note}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common ANZ Spending Leaks</h2>
          <ul className="space-y-2">
            {commonAnzLeaks.map(leak => (
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
          <Link href="/commbank-statement-analyzer" className="text-primary hover:underline">CommBank Analyzer</Link>
          <Link href="/westpac-statement-analyzer" className="text-primary hover:underline">Westpac Analyzer</Link>
          <Link href="/nab-bank-statement-analyzer" className="text-primary hover:underline">NAB Analyzer</Link>
          <Link href="/bank-statement-analyzer-australia" className="text-primary hover:underline">Australia Guide</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">All Banks</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/anz-bank-statement-analyzer" />

    </main>
  )
}
