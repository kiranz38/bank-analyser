import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Free Monthly Expense Calculator – Analyze Your Actual Spending From Bank Statement',
  description: 'Free expense calculator. Upload your bank statement CSV or PDF and get an instant breakdown of your monthly expenses by category. More accurate than guessing — uses your real transactions.',
  alternates: { canonical: 'https://whereismymoneygo.com/expense-calculator' },
  openGraph: {
    title: 'Free Monthly Expense Calculator – Real Numbers From Your Bank Statement',
    description: 'Stop guessing your expenses. Upload your bank statement and get a real monthly expense breakdown by category in under 30 seconds.',
    type: 'website', url: 'https://whereismymoneygo.com/expense-calculator', siteName: 'Leaky Wallet',
  },
}

const categories = [
  'Housing & utilities', 'Groceries & supermarket', 'Dining & takeaway',
  'Transport & fuel', 'Entertainment & streaming', 'Health & fitness',
  'Shopping & clothing', 'Subscriptions & memberships', 'Insurance', 'Bank fees & charges',
]

const faqs = [
  { q: 'How is this different from a manual expense calculator?', a: 'Manual calculators require you to remember and enter every expense. Leaky Wallet reads your actual bank transactions, so nothing gets missed — including the small recurring charges you\'ve forgotten about.' },
  { q: 'What categories does the expense calculator use?', a: 'The analyzer automatically categorizes spending into: housing, groceries, dining, transport, entertainment, subscriptions, health, shopping, insurance, fees, and more. You see both category totals and the individual transactions within each.' },
  { q: 'How accurate is the expense breakdown?', a: 'Very accurate — it uses your real transactions, not estimates. The only limitation is the date range of the statement you upload. A 90-day statement gives a reliable monthly average.' },
  { q: 'Can I use this to calculate expenses for a budget?', a: 'Yes. The category totals are the perfect starting point for a budget — they show your current actual spending in each area so you can set realistic targets. The Pro report includes suggested spending limits per category based on your income and spending patterns.' },
  { q: 'What file formats are accepted?', a: 'CSV and PDF bank statements from any bank. Export from your bank\'s website (ANZ, CommBank, Westpac, NAB, Chase, Barclays, HSBC, etc.) and upload directly.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function ExpenseCalculatorPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Monthly Expense Calculator — Real Numbers From Your Bank Statement
        </h1>

        <p className="text-lg text-muted-foreground">
          Most expense calculators ask you to guess. Leaky Wallet reads your actual bank statement
          and calculates exactly what you spent last month — by category, by merchant, and by trend.
          Upload once, get your full expense breakdown in 30 seconds.
        </p>

        <p className="text-muted-foreground">
          The average person underestimates their monthly expenses by 20–40%. Subscriptions, small
          recurring fees, and dining expenses are the most common blind spots. Real data from your
          bank statement eliminates the guesswork entirely.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Calculate Your Real Monthly Expenses</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — instant breakdown, completely free</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Calculate My Expenses Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Expense Categories Tracked Automatically</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {categories.map(cat => (
              <div key={cat} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span className="text-muted-foreground">{cat}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Calculate Your Monthly Expenses</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><span>Export last month&apos;s transactions from your bank as CSV or PDF</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span><span>Upload the file to Leaky Wallet — no account required, data never stored</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span><span>See your full expense breakdown: category totals, top merchants, recurring charges</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span><span>Use the numbers to set a realistic budget — or unlock the Pro report for a personalized savings plan</span></li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/budget-calculator" className="text-primary hover:underline">Budget Calculator</Link>
          <Link href="/monthly-expense-tracker" className="text-primary hover:underline">Monthly Expense Tracker</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/expense-calculator" />

    </main>
  )
}
