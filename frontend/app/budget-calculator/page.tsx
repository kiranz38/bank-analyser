import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Free Budget Calculator – Build Your Budget From Your Actual Bank Transactions',
  description: 'Free budget calculator. Upload your bank statement to see your real spending by category, then build a budget based on actual numbers — not guesses. Works with any bank.',
  alternates: { canonical: 'https://whereismymoneygo.com/budget-calculator' },
  openGraph: {
    title: 'Free Budget Calculator – Real Numbers From Your Bank Statement',
    description: 'Stop guessing your budget. Upload your bank statement and get real spending data per category in 30 seconds. Build an accurate budget instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/budget-calculator', siteName: 'Leaky Wallet',
  },
}

const budgetInsights = [
  { insight: 'Current spending per category', detail: 'See exactly what you\'re spending on housing, food, transport, subscriptions, and more — based on actual transactions' },
  { insight: 'Where you are overspending', detail: 'Categories with the fastest month-over-month growth are highlighted automatically' },
  { insight: 'Fixed vs variable expenses', detail: 'Recurring charges (subscriptions, insurance, loan repayments) are separated from variable spending' },
  { insight: 'Hidden costs you forgot to budget for', detail: 'Annual fees, quarterly charges, and forgotten subscriptions that distort monthly averages' },
  { insight: 'Potential savings by category', detail: 'Estimated amount recoverable per category if you act on the detected leaks' },
]

const faqs = [
  { q: 'How does this help me build a budget?', a: 'Most budgets fail because they\'re based on guesses. Leaky Wallet shows your actual spending per category, so you can set budget targets that reflect reality — then identify where to reduce.' },
  { q: 'What\'s the 50/30/20 rule and does this help with it?', a: 'The 50/30/20 rule allocates 50% of income to needs, 30% to wants, and 20% to savings/debt. Leaky Wallet categorizes your spending so you can see how your current split compares to this target.' },
  { q: 'Can this replace a budgeting app like YNAB or Mint?', a: 'For the analysis step — yes, and without requiring account connections. Upload your bank statement and get the same category breakdown. Leaky Wallet specifically focuses on finding and eliminating spending leaks, which most budgeting apps miss.' },
  { q: 'How often should I run the budget calculator?', a: 'Monthly. Export the previous month\'s statement, upload it, and compare category totals to your budget targets. The month-over-month comparison in the analyzer shows you which categories improved or worsened.' },
  { q: 'Is this a real budget calculator or just an analyzer?', a: 'It\'s both. The free analysis gives you the data to build or adjust a budget. The Pro report ($1.99) provides a specific 12-week savings plan with recommended spending limits for each category based on your actual patterns.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function BudgetCalculatorPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Budget Calculator — Build Your Budget From Real Bank Data
        </h1>

        <p className="text-lg text-muted-foreground">
          Budgets built on guesses don&apos;t work. Upload your bank statement and Leaky Wallet calculates
          your actual spending per category — the real foundation for a budget that you can actually stick to.
        </p>

        <p className="text-muted-foreground">
          Most budgeting apps require connecting your bank account and trusting them with your login.
          Leaky Wallet works differently: you export your transactions as CSV or PDF directly from your
          bank, upload the file, and get your complete budget data in 30 seconds. No connection, no login,
          no ongoing data sharing.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Build Your Budget From Real Data</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — instant spending breakdown per category</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Calculate My Budget Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Works with any bank</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">What the Budget Calculator Shows You</h2>
          <div className="space-y-4">
            {budgetInsights.map(({ insight, detail }) => (
              <div key={insight} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div><span className="font-medium text-foreground">{insight}: </span><span className="text-muted-foreground">{detail}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/expense-calculator" className="text-primary hover:underline">Expense Calculator</Link>
          <Link href="/monthly-expense-tracker" className="text-primary hover:underline">Monthly Expense Tracker</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/budget-calculator" />

    </main>
  )
}
