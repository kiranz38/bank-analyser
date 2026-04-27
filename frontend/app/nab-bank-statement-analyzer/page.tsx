import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'NAB Bank Statement Analyzer – Find Hidden Subscriptions & Fees',
  description: 'Free NAB bank statement analyzer. Export your NAB Internet Banking transactions as CSV and instantly find hidden subscriptions, bank fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/nab-bank-statement-analyzer' },
  openGraph: {
    title: 'NAB Bank Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for NAB customers. Export your NAB statement and find every hidden subscription and fee instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/nab-bank-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to NAB Internet Banking at nab.com.au', note: 'Or use the NAB app' },
  { step: 'Select your account and go to "Transaction History"', note: '' },
  { step: 'Set date range to last 90 days', note: 'Wider range catches annual charges' },
  { step: 'Click "Download transactions" and select CSV', note: 'NAB supports CSV and QIF formats' },
  { step: 'Upload the file to Leaky Wallet', note: '30 seconds to results, free, no account needed' },
]

const commonLeaks = [
  'NAB Classic Banking $0 fee (check if you are actually on a fee-free account)',
  'NAB Visa Platinum or Rewards card annual fees',
  'Foreign transaction fees on international subscriptions (3% typically)',
  'NAB Flexiplus Mortgage or lending fees',
  'Multiple streaming services running simultaneously without review',
]

const faqs = [
  { q: 'How do I download my NAB bank statement as CSV?', a: 'Log in to NAB Internet Banking at nab.com.au, navigate to your account, click Transaction History, choose your date range, click Download Transactions, and select CSV format. Upload this file to Leaky Wallet for instant analysis.' },
  { q: 'Does Leaky Wallet work with NAB credit cards?', a: 'Yes. Export your NAB credit card statement from Internet Banking as CSV and upload it. The analyzer works with both transaction accounts and credit cards.' },
  { q: 'Is Leaky Wallet affiliated with NAB?', a: 'No. Leaky Wallet is an independent tool with no affiliation with or endorsement from National Australia Bank.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function NabAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Australia · National Australia Bank (NAB)</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">NAB Bank Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Export your NAB transactions as CSV and get a full spending analysis in 30 seconds. Detect every hidden subscription, recurring charge, and bank fee for free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My NAB Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your NAB Statement</h2>
          <ol className="space-y-3">{exportSteps.map(({ step, note }, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <div><p>{step}</p>{note && <p className="text-muted-foreground text-xs mt-0.5">{note}</p>}</div>
            </li>
          ))}</ol>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common NAB Spending Leaks</h2>
          <ul className="space-y-2">{commonLeaks.map(leak => (
            <li key={leak} className="flex gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span className="text-muted-foreground">{leak}</span></li>
          ))}</ul>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/anz-bank-statement-analyzer" className="text-primary hover:underline">ANZ Analyzer</Link>
          <Link href="/commbank-statement-analyzer" className="text-primary hover:underline">CommBank Analyzer</Link>
          <Link href="/westpac-statement-analyzer" className="text-primary hover:underline">Westpac Analyzer</Link>
          <Link href="/bank-statement-analyzer-australia" className="text-primary hover:underline">Australia Guide</Link>
        </nav>
      </article>
    </main>
  )
}
