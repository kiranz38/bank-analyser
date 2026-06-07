import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Free Budget Planner – Build a Budget From Your Actual Bank Transactions',
  description: 'Free budget planner that uses your actual bank statement data. Upload your CSV or PDF to see real spending by category, then create a personalized budget plan based on your real numbers.',
  alternates: { canonical: 'https://whereismymoneygo.com/budget-planner' },
  openGraph: {
    title: 'Free Budget Planner – Real Numbers, Not Guesses',
    description: 'Upload your bank statement and get a complete budget plan based on your real spending — not estimates. Free, instant, no signup.',
    type: 'website',
    url: 'https://whereismymoneygo.com/budget-planner',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What makes a good budget planner?', acceptedAnswer: { '@type': 'Answer', text: 'The best budget planners start with real data, not estimates. A bank statement-based planner is more accurate than any app that relies on manual category entry, because it captures every transaction automatically.' } },
                { '@type': 'Question', name: 'How do I make a monthly budget?', acceptedAnswer: { '@type': 'Answer', text: 'Upload your last 90 days of bank statements to see your average monthly spending by category. Use those real averages as your budget baseline, then set targets 10–20% below your actual spend in discretionary categories.' } },
                { '@type': 'Question', name: 'What should I prioritize in my budget?', acceptedAnswer: { '@type': 'Answer', text: "Start with fixed costs (rent, utilities, insurance) — these don't change much. Then look at subscriptions and dining, which tend to have the most room for quick cuts. Finally, work toward building an emergency fund." } },
                { '@type': 'Question', name: 'Is a monthly or weekly budget better?', acceptedAnswer: { '@type': 'Answer', text: 'Monthly budgets work best for most people since bills and income are monthly. Weekly tracking helps with variable spending like dining and groceries. Upload monthly statements for the big picture and track weekly for spending habits.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Budget Planner — Built From Your Real Spending
        </h1>

        <p className="text-lg text-muted-foreground">
          Traditional budget planners ask you to estimate what you spend. This one starts from the truth: your actual bank transactions. Upload your statement and get a complete spending breakdown in under 30 seconds — the only honest foundation for a budget.
        </p>

        <p className="text-muted-foreground">
          Once you see your real numbers, the leaks become obvious. Most people find $150–$400 in subscriptions and fees they can eliminate immediately — before they even need to change any spending habits.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Build Your Budget Plan</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and get your real spending breakdown — the starting point for any budget that works.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Build My Budget Plan
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What the Budget Planner Shows You</h2>
          <ul className="space-y-3">
            <li key='Monthly spending by category' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Monthly spending by category</p>
              <p className="text-xs text-muted-foreground pl-6">Groceries, dining, transport, subscriptions, entertainment, fees</p>
            </li>
            <li key='Hidden subscriptions and recurring charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Hidden subscriptions and recurring charges</p>
              <p className="text-xs text-muted-foreground pl-6">Every service that auto-charges your account, grouped by merchant</p>
            </li>
            <li key='Month-over-month trends' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Month-over-month trends</p>
              <p className="text-xs text-muted-foreground pl-6">Which categories are growing and which are stable</p>
            </li>
            <li key='Savings opportunities' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Savings opportunities</p>
              <p className="text-xs text-muted-foreground pl-6">Specific subscriptions to cancel and fees to avoid</p>
            </li>
            <li key='Financial health score' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Financial health score</p>
              <p className="text-xs text-muted-foreground pl-6">How your spending compares to recommended budget ratios</p>
            </li>
            <li key='Goal projections' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Goal projections</p>
              <p className="text-xs text-muted-foreground pl-6">How much you'd save over 12 months by making specific cuts</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Create Your Budget Plan</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your bank statement.</strong> Log in to your bank's website, download your last 90 days as CSV or PDF.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload to the planner.</strong> Drop your file in the analyzer — your real spending appears in under 30 seconds.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Find the easy wins first.</strong> Cancel subscriptions you don't use — these are immediate savings with no lifestyle change.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Set realistic category limits.</strong> Use your real spending as the baseline, then reduce each category by 10–20% to create a budget you can stick to.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What makes a good budget planner?', a: 'The best budget planners start with real data, not estimates. A bank statement-based planner is more accurate than any app that relies on manual category entry, because it captures every transaction automatically.' },
          { q: 'How do I make a monthly budget?', a: 'Upload your last 90 days of bank statements to see your average monthly spending by category. Use those real averages as your budget baseline, then set targets 10–20% below your actual spend in discretionary categories.' },
          { q: 'What should I prioritize in my budget?', a: "Start with fixed costs (rent, utilities, insurance) — these don't change much. Then look at subscriptions and dining, which tend to have the most room for quick cuts. Finally, work toward building an emergency fund." },
          { q: 'Is a monthly or weekly budget better?', a: 'Monthly budgets work best for most people since bills and income are monthly. Weekly tracking helps with variable spending like dining and groceries. Upload monthly statements for the big picture and track weekly for spending habits.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/budget-calculator" className="text-primary hover:underline">Budget Calculator</Link>
          <Link href="/how-to-budget" className="text-primary hover:underline">How to Budget</Link>
          <Link href="/50-30-20-rule" className="text-primary hover:underline">50/30/20 Rule</Link>
          <Link href="/personal-finance-tracker" className="text-primary hover:underline">Personal Finance Tracker</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/budget-planner' />
    </main>
  )
}
