import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Barclays Statement Analyzer – Find Hidden Subscriptions & Fees',
  description: 'Free Barclays bank statement analyzer. Export your Barclays transactions as CSV and instantly find hidden subscriptions, bank fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/barclays-statement-analyzer' },
  openGraph: {
    title: 'Barclays Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for Barclays customers. Download your Barclays statement as CSV and find every hidden subscription and fee instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/barclays-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to Barclays Online Banking at barclays.co.uk', note: 'Desktop browser for best export options' },
  { step: 'Go to your account and select "Statements & transactions"', note: '' },
  { step: 'Choose your date range — last 90 days recommended', note: '' },
  { step: 'Click "Download" and select CSV format', note: 'Barclays also supports OFX and PDF' },
  { step: 'Upload the file to Leaky Wallet', note: 'Results in 30 seconds — no account needed' },
]

const commonLeaks = [
  'Barclays Blue Rewards monthly fee (£5/month — check if benefits exceed cost)',
  'Barclaycard annual fee on premium credit cards',
  'Travel insurance bundled with current account that you already have separately',
  'Forgotten direct debits that Barclays continues charging after service cancelled',
  'Mobile phone insurance duplicating existing contents insurance cover',
]

const faqs = [
  { q: 'How do I export my Barclays statement as CSV?', a: 'Log in to Barclays Online Banking, navigate to your account, select Statements & Transactions, choose your date range, click Download, and select CSV. Upload the file to Leaky Wallet.' },
  { q: 'Does this work with Barclaycard?', a: 'Yes. Export your Barclaycard transaction history from the Barclaycard website and upload it to Leaky Wallet — works identically.' },
  { q: 'Is Leaky Wallet affiliated with Barclays?', a: 'No. Leaky Wallet is independent and not affiliated with or endorsed by Barclays Bank PLC.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function BarclaysAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇬🇧 United Kingdom · Barclays</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Barclays Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Export your Barclays transactions as CSV and get a complete spending breakdown in 30 seconds. Find every hidden subscription, fee, and spending leak — completely free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Barclays Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your Barclays Statement</h2>
          <ol className="space-y-3">{exportSteps.map(({ step, note }, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <div><p>{step}</p>{note && <p className="text-muted-foreground text-xs mt-0.5">{note}</p>}</div>
            </li>
          ))}</ol>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common Barclays Spending Leaks</h2>
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
          <Link href="/hsbc-statement-analyzer" className="text-primary hover:underline">HSBC</Link>
          <Link href="/bank-statement-analyzer-uk" className="text-primary hover:underline">All UK Banks</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/barclays-statement-analyzer" />

    </main>
  )
}
