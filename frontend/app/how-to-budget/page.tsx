import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'How to Budget – Build a Budget From Your Actual Bank Transactions',
  description: 'Learn how to budget effectively using your actual bank transactions. Upload your bank statement to see your real spending by category, then build a realistic budget based on real numbers — not guesses.',
  alternates: { canonical: 'https://whereismymoneygo.com/how-to-budget' },
  openGraph: {
    title: 'How to Budget – Start With Your Real Spending Data, Not Estimates',
    description: 'Stop guessing your budget. Upload your bank statement to see real spending by category and build a budget that actually works.',
    type: 'website',
    url: 'https://whereismymoneygo.com/how-to-budget',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the easiest budgeting method?', acceptedAnswer: { '@type': 'Answer', text: 'The 50/30/20 rule: 50% of income to needs (rent, groceries, utilities), 30% to wants (dining, entertainment, subscriptions), 20% to savings and debt repayment. But you can only apply it accurately if you know your real spending — upload your bank statement to find out.' } },
                { '@type': 'Question', name: 'How do I start budgeting with no experience?', acceptedAnswer: { '@type': 'Answer', text: "Start by finding out where your money actually goes. Upload your last 90 days of bank statements to Leaky Wallet — you'll get a complete category breakdown showing your real spending patterns. Then set limits based on what you see." } },
                { '@type': 'Question', name: 'How much should I budget for subscriptions?', acceptedAnswer: { '@type': 'Answer', text: 'Most financial advisers recommend keeping subscriptions under 5–10% of take-home pay. The average person pays $350–$600/year in subscriptions. Run a subscription audit to see your exact number.' } },
                { '@type': 'Question', name: 'Should I use a budgeting app?', acceptedAnswer: { '@type': 'Answer', text: 'Apps that require ongoing bank account access are convenient but raise privacy concerns. An alternative is to upload your bank statement periodically for a snapshot review — no persistent bank connection required.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How to Budget — Use Your Real Spending Data
        </h1>

        <p className="text-lg text-muted-foreground">
          Most budgets fail because they're built on estimates. You guess that you spend $400 on groceries — but the reality is $620. You think you spend $100 on subscriptions — but it's $310. A budget built on real numbers is the only kind that works.
        </p>

        <p className="text-muted-foreground">
          The fastest way to start budgeting is to analyze what you're actually spending right now. Upload your bank statement to see your real spending by category — then set limits based on reality, not guesses.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Start With Your Real Spending Data</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement to see where your money actually goes — the only honest starting point for a budget.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Analyze My Spending
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why Most Budgets Fail</h2>
          <ul className="space-y-3">
            <li key='Built on estimates, not reality' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Built on estimates, not reality</p>
              <p className="text-xs text-muted-foreground pl-6">People underestimate spending by 20–40% when relying on memory</p>
            </li>
            <li key='Subscriptions not counted' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscriptions not counted</p>
              <p className="text-xs text-muted-foreground pl-6">Monthly subscriptions rarely appear in mental spending estimates</p>
            </li>
            <li key='Too restrictive to sustain' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Too restrictive to sustain</p>
              <p className="text-xs text-muted-foreground pl-6">Budgets that cut too deep are abandoned within weeks</p>
            </li>
            <li key='No visibility into trends' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />No visibility into trends</p>
              <p className="text-xs text-muted-foreground pl-6">Without data, you can't see which categories are growing each month</p>
            </li>
            <li key='Missing annual expenses' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Missing annual expenses</p>
              <p className="text-xs text-muted-foreground pl-6">Insurance, memberships, and renewals blow the monthly budget</p>
            </li>
            <li key='Fixed vs variable confusion' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Fixed vs variable confusion</p>
              <p className="text-xs text-muted-foreground pl-6">Not distinguishing between unavoidable and discretionary spending</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Build a Realistic Budget in 4 Steps</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>See what you actually spend.</strong> Upload your bank statement to get a real spending breakdown by category — groceries, dining, transport, subscriptions, fees, and more.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Find the leaks first.</strong> Identify and cancel subscriptions and fees you don't need. These are immediate savings without lifestyle changes.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Set category limits based on actuals.</strong> Use your real spending as the baseline. Reduce categories by 10–20% at a time — sustainable cuts that stick.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Track monthly.</strong> Re-upload your statement every month to see how you're tracking against your budget limits.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What is the easiest budgeting method?', a: 'The 50/30/20 rule: 50% of income to needs (rent, groceries, utilities), 30% to wants (dining, entertainment, subscriptions), 20% to savings and debt repayment. But you can only apply it accurately if you know your real spending — upload your bank statement to find out.' },
          { q: 'How do I start budgeting with no experience?', a: "Start by finding out where your money actually goes. Upload your last 90 days of bank statements to Leaky Wallet — you'll get a complete category breakdown showing your real spending patterns. Then set limits based on what you see." },
          { q: 'How much should I budget for subscriptions?', a: 'Most financial advisers recommend keeping subscriptions under 5–10% of take-home pay. The average person pays $350–$600/year in subscriptions. Run a subscription audit to see your exact number.' },
          { q: 'Should I use a budgeting app?', a: 'Apps that require ongoing bank account access are convenient but raise privacy concerns. An alternative is to upload your bank statement periodically for a snapshot review — no persistent bank connection required.' },
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
          <Link href="/50-30-20-rule" className="text-primary hover:underline">50/30/20 Rule</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/monthly-expense-tracker" className="text-primary hover:underline">Monthly Expense Tracker</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/how-to-budget' />
    </main>
  )
}
