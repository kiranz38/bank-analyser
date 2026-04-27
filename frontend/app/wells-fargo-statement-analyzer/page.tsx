import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Wells Fargo Statement Analyzer – Find Hidden Subscriptions & Fees',
  description: 'Free Wells Fargo statement analyzer. Export your Wells Fargo transactions as CSV and instantly find hidden subscriptions, monthly fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/wells-fargo-statement-analyzer' },
  openGraph: {
    title: 'Wells Fargo Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for Wells Fargo customers. Download your statement as CSV and find every hidden subscription and fee instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/wells-fargo-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Sign in to Wells Fargo Online at wellsfargo.com', note: 'Desktop browser recommended' },
  { step: 'Go to Accounts and select the account to analyze', note: '' },
  { step: 'Click "Download Account Activity" in the Activity section', note: '' },
  { step: 'Choose CSV format and select your date range', note: '90 days recommended for best subscription detection' },
  { step: 'Download and upload the CSV to Leaky Wallet', note: 'Results appear in 30 seconds' },
]

const faqs = [
  { q: 'How do I export my Wells Fargo statement as CSV?', a: 'Sign in to wellsfargo.com, go to your account, click Download Account Activity, choose CSV as the file type, select your date range, and click Download. Upload the file to Leaky Wallet for instant analysis.' },
  { q: 'Does this work with Wells Fargo credit cards?', a: 'Yes. Select your Wells Fargo credit card from the accounts list and download its transaction history as CSV.' },
  { q: 'Is Leaky Wallet affiliated with Wells Fargo?', a: 'No. Leaky Wallet is independent and not affiliated with Wells Fargo & Company.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function WellsFargoAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇺🇸 United States · Wells Fargo</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Wells Fargo Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Download your Wells Fargo transactions as CSV and detect every hidden subscription, recurring charge, and fee in 30 seconds. Completely free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Wells Fargo Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your Wells Fargo Statement</h2>
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
          <Link href="/chase-bank-statement-analyzer" className="text-primary hover:underline">Chase</Link>
          <Link href="/bank-of-america-statement-analyzer" className="text-primary hover:underline">Bank of America</Link>
          <Link href="/bank-statement-analyzer-usa" className="text-primary hover:underline">All US Banks</Link>
        </nav>
      </article>
    </main>
  )
}
