import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Free Monthly Expense Tracker – No App, No Signup, Just Upload Your Statement',
  description: 'Track your monthly expenses without an app. Upload your bank statement CSV or PDF and get a complete monthly expense report instantly — by category, by merchant, by trend. Free.',
  alternates: { canonical: 'https://whereismymoneygo.com/monthly-expense-tracker' },
  openGraph: {
    title: 'Free Monthly Expense Tracker – Upload Your Bank Statement, Get Instant Report',
    description: 'No app needed. Upload your bank statement and get your full monthly expense breakdown in 30 seconds — by category, merchant, and trend. Free.',
    type: 'website', url: 'https://whereismymoneygo.com/monthly-expense-tracker', siteName: 'Leaky Wallet',
  },
}

const faqs = [
  { q: 'How do I track monthly expenses without an app?', a: 'Upload your bank statement (CSV or PDF) to Leaky Wallet. Every transaction is automatically categorized and totaled by month. No app installation, no account signup — just upload and view your results.' },
  { q: 'How is this different from my bank\'s own expense tracking?', a: 'Bank-built trackers use broad categories and often misclassify transactions. They also don\'t specifically look for spending leaks, forgotten subscriptions, or fee patterns. Leaky Wallet is built specifically to surface the charges you\'re losing money on.' },
  { q: 'Can I track multiple months at once?', a: 'Yes. Export a larger date range (e.g. 6 months) and upload it. The analyzer shows month-by-month totals so you can spot trends and seasonal patterns in your spending.' },
  { q: 'Do I need to enter my transactions manually?', a: 'No. The analyzer reads your exported bank statement file directly. Zero manual entry required.' },
  { q: 'What does the monthly expense report include?', a: 'Category totals (groceries, dining, transport, entertainment, subscriptions, fees, etc.), top merchants by spend, month-over-month changes, all recurring charges with annual cost projections, and an estimated monthly "money leak" amount.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function MonthlyExpenseTrackerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Monthly Expense Tracker — No App Required
        </h1>

        <p className="text-lg text-muted-foreground">
          Tracking monthly expenses usually means installing an app, connecting your bank account,
          or entering transactions by hand. Leaky Wallet skips all of that. Upload your bank
          statement and get a complete monthly expense report in under 30 seconds.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Track Your Monthly Expenses Now</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — instant report, no app, no signup</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Track My Monthly Expenses Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · CSV or PDF · Works with any bank · Data never stored</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Your Monthly Expense Report Includes</h2>
          <ul className="space-y-2 text-sm">
            {[
              'Total spending per category — groceries, dining, transport, subscriptions, fees, entertainment, and more',
              'Month-over-month comparison — see which categories grew or shrank vs last month',
              'Top 10 merchants by spend — not just categories, but the exact companies',
              'All subscriptions and recurring charges — with monthly and annual cost totals',
              'Estimated money leak — the amount going to forgotten or underused charges',
              'Easy wins — specific actions to reduce your expenses this week',
            ].map(item => (
              <li key={item} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span className="text-muted-foreground">{item}</span></li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Track Your Monthly Expenses</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><span>Log in to your bank and export last month&apos;s transactions as CSV or PDF</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span><span>Upload the file to Leaky Wallet — completely private, data never stored</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span><span>Review your full expense breakdown by category and merchant</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span><span>Act on the easy wins or unlock the Pro report for a personalized savings plan</span></li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/expense-calculator" className="text-primary hover:underline">Expense Calculator</Link>
          <Link href="/budget-calculator" className="text-primary hover:underline">Budget Calculator</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/monthly-expense-tracker" />

    </main>
  )
}
