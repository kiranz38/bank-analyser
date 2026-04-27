import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Westpac Bank Statement Analyzer – Find Hidden Subscriptions & Fees',
  description: 'Free Westpac bank statement analyzer. Export your Westpac Online Banking transactions as CSV and instantly find hidden subscriptions, bank fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/westpac-statement-analyzer' },
  openGraph: {
    title: 'Westpac Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for Westpac customers. Export your Westpac statement and find every hidden subscription and fee instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/westpac-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to Westpac Online Banking at westpac.com.au', note: 'Or use the Westpac app' },
  { step: 'Select your account and click "Transaction History"', note: '' },
  { step: 'Choose your date range — 90 days recommended', note: '' },
  { step: 'Click "Export Transactions" and choose CSV', note: 'Westpac also supports OFX format' },
  { step: 'Upload the CSV to Leaky Wallet', note: 'Free, instant, no account required' },
]

const commonLeaks = [
  'Westpac Lite or Choice account monthly fees ($5–$10/month)',
  'Westpac Altitude credit card annual fees',
  'Foreign transaction fees on international subscriptions',
  'Westpac lenders mortgage insurance (if still being charged)',
  'Forgotten streaming and app subscriptions billed in USD',
]

const faqs = [
  { q: 'How do I export my Westpac bank statement as CSV?', a: 'Log in to Westpac Online Banking, go to Transaction History on your account, select your date range, click Export Transactions, and choose CSV format. Upload the file to Leaky Wallet for instant analysis.' },
  { q: 'Does this work with Westpac credit card statements?', a: 'Yes. Export your Westpac credit card transaction history from Online Banking and upload it to Leaky Wallet separately or combined with your transaction account.' },
  { q: 'Is this tool affiliated with Westpac?', a: 'No. Leaky Wallet is an independent service not affiliated with, endorsed by, or connected to Westpac Banking Corporation.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function WestpacAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Australia · Westpac Bank</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Westpac Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Export your Westpac transactions as CSV and get a full spending breakdown in 30 seconds. Find every hidden subscription and bank fee — completely free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Westpac Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your Westpac Statement</h2>
          <ol className="space-y-3">{exportSteps.map(({ step, note }, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <div><p>{step}</p>{note && <p className="text-muted-foreground text-xs mt-0.5">{note}</p>}</div>
            </li>
          ))}</ol>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common Westpac Spending Leaks</h2>
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
          <Link href="/nab-bank-statement-analyzer" className="text-primary hover:underline">NAB Analyzer</Link>
          <Link href="/bank-statement-analyzer-australia" className="text-primary hover:underline">Australia Guide</Link>
        </nav>
      </article>
    </main>
  )
}
