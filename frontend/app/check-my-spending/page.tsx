import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Check My Spending – Instant Spending Check From Your Bank Statement',
  description: 'Check your spending instantly. Upload your bank statement CSV or PDF and get a complete spending check — by category, by merchant, by month — with hidden subscriptions and savings opportunities highlighted.',
  alternates: { canonical: 'https://whereismymoneygo.com/check-my-spending' },
  openGraph: {
    title: 'Check My Spending – Upload Your Bank Statement for an Instant Spending Check',
    description: 'Upload your bank statement to check your spending instantly — every category, every merchant, every subscription. Free, private, no signup.',
    type: 'website',
    url: 'https://whereismymoneygo.com/check-my-spending',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "How do I check what I'm spending money on?", acceptedAnswer: { '@type': 'Answer', text: "Export your bank statement as CSV or PDF from your bank's website, then upload it to Leaky Wallet. Every transaction is categorized and displayed — groceries, dining, transport, subscriptions, and more — with monthly totals and trends." } },
                { '@type': 'Question', name: 'How do I check my spending for the month?', acceptedAnswer: { '@type': 'Answer', text: "Download your current month's transactions from your bank's website (even if the month isn't over) and upload the CSV or PDF. The analyzer shows spending to date by category." } },
                { '@type': 'Question', name: 'How do I check if I have any subscriptions I forgot about?', acceptedAnswer: { '@type': 'Answer', text: "Upload at least 90 days of bank statements — the analyzer detects recurring patterns and flags every subscription, including quarterly and annual ones that wouldn't appear in a single month." } },
                { '@type': 'Question', name: 'Is there a free way to check my spending?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — Leaky Wallet is completely free. Upload your bank statement CSV or PDF and get a complete spending check with no account required.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Check My Spending — An Instant Spending Review
        </h1>

        <p className="text-lg text-muted-foreground">
          Checking your spending manually means scrolling through hundreds of transactions and trying to add them up by category in your head. A bank statement analyzer does this instantly and more accurately — every transaction categorized, every subscription flagged, every trend surfaced.
        </p>

        <p className="text-muted-foreground">
          Upload your bank statement for a complete spending check. You'll see exactly where your money went, which categories are over or under your expectations, and what you're paying for that you didn't realize.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Check Your Spending Now</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — complete spending check in 30 seconds, free.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Check My Spending
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What the Spending Check Covers</h2>
          <ul className="space-y-3">
            <li key='Spending by category' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Spending by category</p>
              <p className="text-xs text-muted-foreground pl-6">Groceries, dining, transport, subscriptions, fees, entertainment, shopping</p>
            </li>
            <li key='Top merchants' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Top merchants</p>
              <p className="text-xs text-muted-foreground pl-6">The 10 businesses getting most of your money — often surprising</p>
            </li>
            <li key='All subscriptions and recurring charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />All subscriptions and recurring charges</p>
              <p className="text-xs text-muted-foreground pl-6">Every recurring charge with merchant name, amount, and yearly cost</p>
            </li>
            <li key='Month-over-month changes' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Month-over-month changes</p>
              <p className="text-xs text-muted-foreground pl-6">Which categories increased or decreased compared to last month</p>
            </li>
            <li key='Hidden charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Hidden charges</p>
              <p className="text-xs text-muted-foreground pl-6">Charges that are hard to spot — obscure merchant names, foreign currency, annual fees</p>
            </li>
            <li key='Savings action plan' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Savings action plan</p>
              <p className="text-xs text-muted-foreground pl-6">Specific steps to reduce spending — based on your actual patterns</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Check Your Spending</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your statement.</strong> Download 90 days of transactions from your bank's website as CSV or PDF.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload for the check.</strong> Drop your file and your complete spending check appears in under 30 seconds.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Review category by category.</strong> Identify which categories surprised you — these are the ones to focus on.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Act on the easy wins.</strong> Cancel any subscriptions you don't recognize or no longer use.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How do I check what I'm spending money on?", a: "Export your bank statement as CSV or PDF from your bank's website, then upload it to Leaky Wallet. Every transaction is categorized and displayed — groceries, dining, transport, subscriptions, and more — with monthly totals and trends." },
          { q: 'How do I check my spending for the month?', a: "Download your current month's transactions from your bank's website (even if the month isn't over) and upload the CSV or PDF. The analyzer shows spending to date by category." },
          { q: 'How do I check if I have any subscriptions I forgot about?', a: "Upload at least 90 days of bank statements — the analyzer detects recurring patterns and flags every subscription, including quarterly and annual ones that wouldn't appear in a single month." },
          { q: 'Is there a free way to check my spending?', a: 'Yes — Leaky Wallet is completely free. Upload your bank statement CSV or PDF and get a complete spending check with no account required.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/check-my-spending' />
    </main>
  )
}
