import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Cash Flow Analyzer – See Your Real Monthly Income vs Spending',
  description: "Free cash flow analyzer. Upload your bank statement to see your real monthly income vs spending, find where money is going out faster than it's coming in, and get a personalized plan to improve your cash flow.",
  alternates: { canonical: 'https://whereismymoneygo.com/cash-flow-analyzer' },
  openGraph: {
    title: 'Free Cash Flow Analyzer – Upload Your Bank Statement',
    description: 'Upload your bank statement to see your real cash flow — income vs spending — and find exactly where money leaves faster than it arrives.',
    type: 'website',
    url: 'https://whereismymoneygo.com/cash-flow-analyzer',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is cash flow in personal finance?', acceptedAnswer: { '@type': 'Answer', text: "Personal cash flow is the difference between money coming into your account (income, transfers in) and money going out (bills, spending, subscriptions). Positive cash flow means you're saving; negative means you're spending more than you earn." } },
                { '@type': 'Question', name: 'How do I improve my personal cash flow?', acceptedAnswer: { '@type': 'Answer', text: "The fastest improvements come from reducing committed outflows — cancelling subscriptions you don't use, eliminating avoidable fees, and reducing recurring charges. These improve cash flow immediately without requiring behavior changes." } },
                { '@type': 'Question', name: 'How do I calculate my monthly cash flow?', acceptedAnswer: { '@type': 'Answer', text: 'Upload your bank statement to Leaky Wallet. The analyzer automatically separates income and spending, calculates the net position for each month, and shows which categories are consuming the most cash.' } },
                { '@type': 'Question', name: 'Why is my cash flow always negative?', acceptedAnswer: { '@type': 'Answer', text: "The most common causes are: subscriptions consuming more than budgeted (often 2–3x what people estimate), dining and delivery spending that's crept up, and irregular expenses (annual fees, insurance) that disrupt the monthly budget when they hit." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Cash Flow Analyzer — See Your Real Money In vs Money Out
        </h1>

        <p className="text-lg text-muted-foreground">
          Cash flow is the difference between what comes into your account and what goes out. When spending consistently outpaces income — even slightly — savings never build and you're always waiting for the next paycheck.
        </p>

        <p className="text-muted-foreground">
          Upload your bank statement to see your exact cash flow picture: income by source, spending by category, recurring charges that commit your future income, and the net position across each month.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your Cash Flow</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement to see your real money in vs money out — and where it goes.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Analyze My Cash Flow
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What Cash Flow Analysis Reveals</h2>
          <ul className="space-y-3">
            <li key='Income patterns' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Income patterns</p>
              <p className="text-xs text-muted-foreground pl-6">Salary, freelance, rental income — all sources with timing</p>
            </li>
            <li key='Fixed outflows' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Fixed outflows</p>
              <p className="text-xs text-muted-foreground pl-6">Rent, loan repayments, subscriptions — committed spending that can't easily change</p>
            </li>
            <li key='Variable outflows' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Variable outflows</p>
              <p className="text-xs text-muted-foreground pl-6">Dining, shopping, transport — spending you control month to month</p>
            </li>
            <li key='Subscription burden' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscription burden</p>
              <p className="text-xs text-muted-foreground pl-6">What percentage of monthly cash flow is committed to recurring charges</p>
            </li>
            <li key='Seasonal spikes' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Seasonal spikes</p>
              <p className="text-xs text-muted-foreground pl-6">Annual subscriptions, insurance renewals, and holiday spending that hit at certain times</p>
            </li>
            <li key='Net monthly position' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Net monthly position</p>
              <p className="text-xs text-muted-foreground pl-6">The gap between what you earned and what you spent each month</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Analyze Your Cash Flow</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Upload 3+ months of statements.</strong> Multiple months reveal patterns that a single month hides — upload up to 12 files at once.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>See income vs spending.</strong> The analyzer separates credits (income) from debits (spending) and shows the net position for each month.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Identify the committed spending.</strong> Subscriptions and fixed charges that run every month represent committed future cash flow — review and cancel the unnecessary ones.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Find the months where cash flow turns negative.</strong> Identify the categories driving overspending and set limits before the next month.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What is cash flow in personal finance?', a: "Personal cash flow is the difference between money coming into your account (income, transfers in) and money going out (bills, spending, subscriptions). Positive cash flow means you're saving; negative means you're spending more than you earn." },
          { q: 'How do I improve my personal cash flow?', a: "The fastest improvements come from reducing committed outflows — cancelling subscriptions you don't use, eliminating avoidable fees, and reducing recurring charges. These improve cash flow immediately without requiring behavior changes." },
          { q: 'How do I calculate my monthly cash flow?', a: 'Upload your bank statement to Leaky Wallet. The analyzer automatically separates income and spending, calculates the net position for each month, and shows which categories are consuming the most cash.' },
          { q: 'Why is my cash flow always negative?', a: "The most common causes are: subscriptions consuming more than budgeted (often 2–3x what people estimate), dining and delivery spending that's crept up, and irregular expenses (annual fees, insurance) that disrupt the monthly budget when they hit." },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/personal-finance-tracker" className="text-primary hover:underline">Personal Finance Tracker</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/budget-planner" className="text-primary hover:underline">Budget Planner</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/cash-flow-analyzer' />
    </main>
  )
}
