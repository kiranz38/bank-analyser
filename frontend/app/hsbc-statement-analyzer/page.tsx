import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'HSBC Statement Analyzer – Find Hidden Subscriptions & Fees (UK)',
  description: 'Free HSBC bank statement analyzer. Export your HSBC UK transactions as CSV and instantly find hidden subscriptions, bank fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/hsbc-statement-analyzer' },
  openGraph: {
    title: 'HSBC Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for HSBC UK customers. Download your HSBC statement as CSV and find every hidden subscription and fee instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/hsbc-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to HSBC Online Banking at hsbc.co.uk', note: 'Desktop browser recommended' },
  { step: 'Select your account', note: 'Works for current accounts, savings, and credit cards' },
  { step: 'Go to "Statements" or "Transaction History"', note: '' },
  { step: 'Click "Download Transactions" and choose CSV', note: 'HSBC supports CSV and PDF formats' },
  { step: 'Upload the file to Leaky Wallet', note: 'Free, instant, no account required' },
]

const faqs = [
  { q: 'How do I download my HSBC statement as CSV?', a: 'Log in to hsbc.co.uk, select your account, go to Statements or Transaction History, click Download Transactions, and choose CSV format. Upload to Leaky Wallet for instant analysis.' },
  { q: 'Does this work with HSBC credit cards?', a: 'Yes. Export your HSBC credit card transactions from Online Banking as CSV. Works identically to a current account export.' },
  { q: 'Is Leaky Wallet affiliated with HSBC?', a: 'No. Leaky Wallet is an independent service with no affiliation with HSBC Holdings plc or HSBC UK Bank plc.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function HsbcAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇬🇧 United Kingdom · HSBC</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">HSBC Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Export your HSBC UK transactions as CSV and get a full spending breakdown in 30 seconds. Find every hidden subscription and bank fee — completely free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My HSBC Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your HSBC Statement</h2>
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
          <Link href="/barclays-statement-analyzer" className="text-primary hover:underline">Barclays</Link>
          <Link href="/bank-statement-analyzer-uk" className="text-primary hover:underline">All UK Banks</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/hsbc-statement-analyzer" />

    </main>
  )
}
