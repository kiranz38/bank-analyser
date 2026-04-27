import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'TD Bank Statement Analyzer – Find Hidden Subscriptions & Fees (US & Canada)',
  description: 'Free TD Bank statement analyzer for US and Canadian customers. Export your TD transactions as CSV and instantly find hidden subscriptions, monthly fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/td-bank-statement-analyzer' },
  openGraph: {
    title: 'TD Bank Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for TD Bank customers in the US and Canada. Download your TD statement as CSV and find every hidden subscription and fee.',
    type: 'website', url: 'https://whereismymoneygo.com/td-bank-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportStepsUS = [
  { step: 'Log in to TD Bank Online at tdbank.com (US)', note: 'Or td.com for Canadian customers' },
  { step: 'Select your account', note: '' },
  { step: 'Click "Download" or "Export Transactions"', note: '' },
  { step: 'Choose CSV format and set your date range', note: '90 days recommended' },
  { step: 'Upload the file to Leaky Wallet', note: 'Results in 30 seconds' },
]

const faqs = [
  { q: 'How do I export my TD Bank statement as CSV?', a: 'For US customers: log in to tdbank.com, select your account, click Download or Export Transactions, choose CSV, and set your date range. For Canadian customers: log in to td.com (EasyWeb), go to My Accounts, select Download Transactions, and choose CSV format.' },
  { q: 'Does this work for both TD Bank US and TD Canada Trust?', a: 'Yes. Both TD Bank (US) and TD Canada Trust export CSV files in a format that Leaky Wallet can analyze. Follow the same upload process regardless of which country you\'re in.' },
  { q: 'Is Leaky Wallet affiliated with TD Bank?', a: 'No. Leaky Wallet is independent and not affiliated with TD Bank Group, TD Bank, N.A., or TD Canada Trust.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function TdBankAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇺🇸🇨🇦 United States & Canada · TD Bank</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">TD Bank Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Export your TD Bank (US) or TD Canada Trust transactions as CSV and get a full spending analysis in 30 seconds. Find every hidden subscription and fee — free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My TD Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works for TD US and TD Canada</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your TD Bank Statement</h2>
          <ol className="space-y-3">{exportStepsUS.map(({ step, note }, i) => (
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
          <Link href="/bank-statement-analyzer-usa" className="text-primary hover:underline">All US Banks</Link>
          <Link href="/bank-statement-analyzer-canada" className="text-primary hover:underline">All Canadian Banks</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>
    </main>
  )
}
