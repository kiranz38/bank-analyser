import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Zero-Based Budgeting – Build a Zero-Based Budget From Your Real Spending',
  description: 'Apply zero-based budgeting using your actual bank statement. Upload your CSV or PDF to see real spending by category, then build a zero-based budget where every dollar is assigned a purpose.',
  alternates: { canonical: 'https://whereismymoneygo.com/zero-based-budgeting' },
  openGraph: {
    title: 'Zero-Based Budgeting – Start With Your Real Bank Statement Data',
    description: 'Build a zero-based budget from your actual bank statement data — see real category spending and assign every dollar a job. Free, instant.',
    type: 'website',
    url: 'https://whereismymoneygo.com/zero-based-budgeting',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is zero-based budgeting?', acceptedAnswer: { '@type': 'Answer', text: "Zero-based budgeting is a budgeting method where your total income minus all your spending categories equals zero — every dollar is assigned a specific purpose. It's more thorough than percentage-based methods because nothing is left unallocated." } },
                { '@type': 'Question', name: 'Is zero-based budgeting good for beginners?', acceptedAnswer: { '@type': 'Answer', text: "It's more detailed than the 50/30/20 rule, but very effective. The key is starting with real spending data — upload your bank statement to see actual category spending — rather than guessing what you spend on groceries, dining, and entertainment." } },
                { '@type': 'Question', name: 'What are the categories for zero-based budgeting?', acceptedAnswer: { '@type': 'Answer', text: 'Common categories: housing, utilities, groceries, transport, healthcare, subscriptions (each one listed), dining out, entertainment, clothing, personal care, savings, emergency fund, and a misc buffer. The specific categories depend on your life — use your bank statement analysis to see which categories apply to you.' } },
                { '@type': 'Question', name: 'How do I track zero-based budgeting?', acceptedAnswer: { '@type': 'Answer', text: 'Upload your bank statement monthly to compare actual spending against your zero-based budget allocation by category. The analyzer shows the gap between your target and actual for each category, making it easy to see where you overspent.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Zero-Based Budgeting — Assign Every Dollar a Job
        </h1>

        <p className="text-lg text-muted-foreground">
          Zero-based budgeting means every dollar of your income is assigned a specific purpose until you reach zero. Income minus all assigned categories = zero. It's the most thorough budgeting method and the most effective — because nothing gets spent without a plan.
        </p>

        <p className="text-muted-foreground">
          The key to making zero-based budgeting work is starting with accurate data. Upload your bank statement to see your real spending by category — then use those numbers as the foundation for your zero-based budget instead of guesses.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Start Your Zero-Based Budget</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement to see your real spending — the starting point for any zero-based budget.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Build My Zero-Based Budget
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Set Up Zero-Based Budgeting Categories</h2>
          <ul className="space-y-3">
            <li key='Fixed needs (rent, utilities, loan payments)' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Fixed needs (rent, utilities, loan payments)</p>
              <p className="text-xs text-muted-foreground pl-6">Start with your non-negotiable fixed costs — these don't change month to month</p>
            </li>
            <li key='Variable needs (groceries, transport, healthcare)' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Variable needs (groceries, transport, healthcare)</p>
              <p className="text-xs text-muted-foreground pl-6">Necessary but variable — use your real spending averages as the starting point</p>
            </li>
            <li key='Subscriptions (assigned explicitly)' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscriptions (assigned explicitly)</p>
              <p className="text-xs text-muted-foreground pl-6">Every subscription assigned a budget line — only keep what you explicitly choose to fund</p>
            </li>
            <li key='Discretionary (dining, entertainment, shopping)' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Discretionary (dining, entertainment, shopping)</p>
              <p className="text-xs text-muted-foreground pl-6">Fun money with a hard limit — helps prevent lifestyle creep</p>
            </li>
            <li key='Savings (emergency fund, investments)' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Savings (emergency fund, investments)</p>
              <p className="text-xs text-muted-foreground pl-6">Treated as a mandatory expense — paid to yourself before discretionary spending</p>
            </li>
            <li key='Buffer (unexpected expenses)' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Buffer (unexpected expenses)</p>
              <p className="text-xs text-muted-foreground pl-6">A small buffer (1–3% of income) for genuine surprises</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Build a Zero-Based Budget</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Find your real spending by category.</strong> Upload your bank statement to see what you actually spend — not estimates. This is the data foundation for your budget.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>List your income.</strong> Total after-tax income from all sources — salary, freelance, rental, etc.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Assign every dollar.</strong> Allocate income to each category until the total equals your income (income - all categories = zero).</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Track and adjust monthly.</strong> Upload each month's statement to see how your actual spending compares to your zero-based allocation.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What is zero-based budgeting?', a: "Zero-based budgeting is a budgeting method where your total income minus all your spending categories equals zero — every dollar is assigned a specific purpose. It's more thorough than percentage-based methods because nothing is left unallocated." },
          { q: 'Is zero-based budgeting good for beginners?', a: "It's more detailed than the 50/30/20 rule, but very effective. The key is starting with real spending data — upload your bank statement to see actual category spending — rather than guessing what you spend on groceries, dining, and entertainment." },
          { q: 'What are the categories for zero-based budgeting?', a: 'Common categories: housing, utilities, groceries, transport, healthcare, subscriptions (each one listed), dining out, entertainment, clothing, personal care, savings, emergency fund, and a misc buffer. The specific categories depend on your life — use your bank statement analysis to see which categories apply to you.' },
          { q: 'How do I track zero-based budgeting?', a: 'Upload your bank statement monthly to compare actual spending against your zero-based budget allocation by category. The analyzer shows the gap between your target and actual for each category, making it easy to see where you overspent.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/budget-planner" className="text-primary hover:underline">Budget Planner</Link>
          <Link href="/how-to-budget" className="text-primary hover:underline">How to Budget</Link>
          <Link href="/50-30-20-rule" className="text-primary hover:underline">50/30/20 Rule</Link>
          <Link href="/personal-finance-tracker" className="text-primary hover:underline">Personal Finance Tracker</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/zero-based-budgeting' />
    </main>
  )
}
