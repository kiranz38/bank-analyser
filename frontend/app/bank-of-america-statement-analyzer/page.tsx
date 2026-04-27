import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Bank of America Statement Analyzer – Find Hidden Subscriptions & Fees',
  description: 'Free Bank of America statement analyzer. Export your BofA transactions as CSV and instantly find hidden subscriptions, recurring charges, monthly fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/bank-of-america-statement-analyzer' },
  openGraph: {
    title: 'Bank of America Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for Bank of America customers. Download your BofA statement as CSV and find every hidden subscription and fee instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/bank-of-america-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to bankofamerica.com', note: 'Use desktop browser for full download options' },
  { step: 'Select your account from the Accounts Overview', note: '' },
  { step: 'Click "Download" near the top of the transaction list', note: '' },
  { step: 'Select Microsoft Excel format (CSV) and choose your date range', note: 'Last 90 days recommended' },
  { step: 'Click Download and upload the file to Leaky Wallet', note: 'Results appear in 30 seconds' },
]

const commonLeaks = [
  'BofA Advantage Banking monthly maintenance fee ($12–$25/month if conditions not met)',
  'BofA Premium Rewards or Travel Rewards annual credit card fee',
  'Overdraft fees and insufficient funds charges',
  'Subscriptions auto-renewed to a saved BofA card',
  'Safety deposit box annual rental fees',
]

const faqs = [
  { q: 'How do I download my Bank of America statement as CSV?', a: 'Log in to bankofamerica.com, select your account, click Download above the transaction list, choose Microsoft Excel (CSV) as the format, set your date range, and click Download. Upload the CSV to Leaky Wallet for instant analysis.' },
  { q: 'Does this work with BofA credit card statements?', a: 'Yes. Select your credit card from the Accounts Overview and download its transaction history as CSV. The analyzer handles both checking and credit card data.' },
  { q: 'Can I avoid the BofA monthly maintenance fee?', a: 'Many BofA accounts waive the monthly fee if you maintain a minimum balance, set up qualifying direct deposits, or hold certain credit cards. The analyzer will flag if you\'re paying this fee so you can evaluate whether you qualify for a waiver.' },
  { q: 'Is Leaky Wallet affiliated with Bank of America?', a: 'No. Leaky Wallet is an independent service with no affiliation with Bank of America Corporation.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function BofaAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇺🇸 United States · Bank of America</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bank of America Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Download your Bank of America transactions as CSV and get a full spending analysis in 30 seconds. Detect every hidden subscription and unnecessary fee — completely free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My BofA Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your BofA Statement</h2>
          <ol className="space-y-3">{exportSteps.map(({ step, note }, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <div><p>{step}</p>{note && <p className="text-muted-foreground text-xs mt-0.5">{note}</p>}</div>
            </li>
          ))}</ol>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common BofA Spending Leaks</h2>
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
          <Link href="/chase-bank-statement-analyzer" className="text-primary hover:underline">Chase</Link>
          <Link href="/wells-fargo-statement-analyzer" className="text-primary hover:underline">Wells Fargo</Link>
          <Link href="/bank-statement-analyzer-usa" className="text-primary hover:underline">All US Banks</Link>
        </nav>
      </article>
    </main>
  )
}
