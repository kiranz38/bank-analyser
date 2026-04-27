import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'ANZ New Zealand Statement Analyzer – Find Hidden Subscriptions & Fees',
  description: 'Free ANZ NZ bank statement analyzer. Export your ANZ New Zealand transactions as CSV and instantly find hidden subscriptions, bank fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/anz-nz-statement-analyzer' },
  openGraph: {
    title: 'ANZ New Zealand Statement Analyzer – Find Hidden Subscriptions',
    description: 'Free tool for ANZ NZ customers. Download your ANZ NZ statement as CSV and find every hidden subscription and fee.',
    type: 'website', url: 'https://whereismymoneygo.com/anz-nz-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to ANZ Internet Banking at anz.co.nz', note: 'Desktop browser recommended' },
  { step: 'Select your account from the accounts list', note: '' },
  { step: 'Go to "Transaction History"', note: '' },
  { step: 'Click "Export Transactions" and choose CSV', note: '90-day range recommended' },
  { step: 'Upload the file to Leaky Wallet', note: 'Results in 30 seconds' },
]

const faqs = [
  { q: 'How do I export my ANZ NZ statement as CSV?', a: 'Log in to anz.co.nz, select your account, go to Transaction History, click Export Transactions, choose CSV format, set your date range, and download. Upload the CSV to Leaky Wallet for instant analysis.' },
  { q: 'Is this the same as ANZ Australia?', a: 'ANZ NZ and ANZ Australia are separate entities with different online banking portals. Use anz.co.nz for New Zealand accounts. The Leaky Wallet analyzer works with both.' },
  { q: 'Is Leaky Wallet affiliated with ANZ New Zealand?', a: 'No. Leaky Wallet is independent and not affiliated with ANZ Bank New Zealand Limited.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function AnzNzAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇳🇿 New Zealand · ANZ NZ</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ANZ New Zealand Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Export your ANZ NZ transactions and get a complete spending analysis in 30 seconds. Find every hidden subscription and bank fee — completely free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My ANZ NZ Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your ANZ NZ Statement</h2>
          <ol className="space-y-3">{exportSteps.map(({ step, note }, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <div><p>{step}</p>{note && <p className="text-muted-foreground text-xs mt-0.5">{note}</p>}</div>
            </li>
          ))}</ol>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/bank-statement-analyzer-new-zealand" className="text-primary hover:underline">All NZ Banks</Link>
          <Link href="/anz-bank-statement-analyzer" className="text-primary hover:underline">ANZ Australia</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>
    </main>
  )
}
