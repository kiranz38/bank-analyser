import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Chase Bank Statement Analyzer – Find Hidden Subscriptions & Fees',
  description: 'Free Chase bank statement analyzer. Export your Chase account transactions as CSV and instantly find hidden subscriptions, recurring charges, and unnecessary fees.',
  alternates: { canonical: 'https://whereismymoneygo.com/chase-bank-statement-analyzer' },
  openGraph: {
    title: 'Chase Bank Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Free tool for Chase customers. Download your Chase statement as CSV and find every hidden subscription and fee instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/chase-bank-statement-analyzer', siteName: 'Leaky Wallet',
  },
}

const exportSteps = [
  { step: 'Log in to Chase Online at chase.com', note: 'Desktop browser recommended for full export options' },
  { step: 'Click on the account you want to analyze', note: 'Works for checking, savings, and credit cards' },
  { step: 'Click "Download account activity" (above the transaction list)', note: '' },
  { step: 'Set date range — last 90 days for best results', note: 'You can export up to 7 years of history' },
  { step: 'Select CSV format and download', note: 'Upload the file to Leaky Wallet — analysis in 30 seconds' },
]

const commonLeaks = [
  'Chase Sapphire or Preferred card annual fees ($95–$550/year)',
  'Chase Total Checking monthly fee ($12/month if minimum balance not maintained)',
  'Chase Overdraft Fees ($34 per occurrence)',
  'Recurring charges from Amazon Prime, subscriptions billed to the Chase card',
  'Dormant Chase credit cards with annual fees still charging',
]

const faqs = [
  { q: 'How do I download my Chase bank statement as CSV?', a: 'Log in to chase.com, select your account, click "Download account activity" near the top of the transactions list, select your date range, choose CSV as the file type, and click Download. Upload the CSV to Leaky Wallet.' },
  { q: 'Does this work with Chase credit card statements?', a: 'Yes. Follow the same steps for your Chase credit card account. Select the credit card from your accounts list and download activity as CSV.' },
  { q: 'Can it detect Amazon charges on my Chase card?', a: 'Yes. Amazon Prime, Amazon channels, Audible, and other Amazon services show up as separate recurring charges and are all detected and grouped correctly.' },
  { q: 'Is Leaky Wallet affiliated with JPMorgan Chase?', a: 'No. Leaky Wallet is an independent service with no affiliation with or endorsement from JPMorgan Chase & Co.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function ChaseAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇺🇸 United States · Chase Bank</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Chase Bank Statement Analyzer — Find Hidden Subscriptions & Fees</h1>
        </div>
        <p className="text-lg text-muted-foreground">Export your Chase account transactions as CSV and get a full spending breakdown in 30 seconds. Find every hidden subscription and unnecessary fee — free.</p>
        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Chase Statement</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your Chase Statement as CSV</h2>
          <ol className="space-y-3">{exportSteps.map(({ step, note }, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <div><p>{step}</p>{note && <p className="text-muted-foreground text-xs mt-0.5">{note}</p>}</div>
            </li>
          ))}</ol>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common Chase Spending Leaks</h2>
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
          <Link href="/bank-of-america-statement-analyzer" className="text-primary hover:underline">Bank of America</Link>
          <Link href="/wells-fargo-statement-analyzer" className="text-primary hover:underline">Wells Fargo</Link>
          <Link href="/bank-statement-analyzer-usa" className="text-primary hover:underline">All US Banks</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/chase-bank-statement-analyzer" />

    </main>
  )
}
