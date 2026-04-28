import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Free Personal Finance Tracker – Analyze Your Bank Statement Instantly',
  description: 'Free personal finance tracker. Upload your bank statement CSV or PDF to see your full financial picture: spending by category, hidden subscriptions, savings opportunities, and a personalised action plan.',
  alternates: { canonical: 'https://whereismymoneygo.com/personal-finance-tracker' },
  openGraph: {
    title: 'Free Personal Finance Tracker – No App, No Signup',
    description: 'Upload your bank statement to get a complete personal finance breakdown — spending, subscriptions, fees, and savings opportunities — in 30 seconds.',
    type: 'website', url: 'https://whereismymoneygo.com/personal-finance-tracker', siteName: 'Leaky Wallet',
  },
}

const features = [
  { title: 'Spending breakdown by category', detail: 'Every dollar categorized — groceries, dining, transport, subscriptions, fees, entertainment, and more' },
  { title: 'Hidden subscription audit', detail: 'Every recurring charge surfaced: monthly, quarterly, and annual. With total yearly cost.' },
  { title: 'Month-over-month trends', detail: 'See which categories grew or fell vs your previous month — spot problems early' },
  { title: 'Bank fee analysis', detail: 'Every bank fee identified and totaled — many are avoidable or negotiable' },
  { title: 'Top merchant breakdown', detail: 'See exactly which companies are getting the most of your money' },
  { title: 'Money leak estimate', detail: 'Your estimated monthly leak — the recoverable amount you\'re losing to forgotten or unused charges' },
  { title: 'Easy wins list', detail: 'Ranked list of specific actions to improve your finances this week' },
  { title: 'Pro savings plan', detail: 'Unlock a personalized 12-week financial recovery roadmap for $1.99' },
]

const faqs = [
  { q: 'What is a personal finance tracker?', a: 'A personal finance tracker gives you a clear picture of your income, spending, and savings. Leaky Wallet focuses on the spending side — analyzing your bank statement to show exactly where your money goes and where you\'re losing it unnecessarily.' },
  { q: 'Do I need to connect my bank account?', a: 'No. Leaky Wallet works from an exported bank statement (CSV or PDF). You download the file from your bank\'s website and upload it here. No account connection, no login credentials shared.' },
  { q: 'How is this different from apps like Mint, YNAB, or Emma?', a: 'Those apps require ongoing bank connections and charge subscription fees. Leaky Wallet is one-time: upload your statement, get your analysis. It specifically focuses on finding and eliminating spending leaks rather than ongoing budget management.' },
  { q: 'Does it track investments or net worth?', a: 'Not currently. Leaky Wallet focuses on transaction-level spending analysis — finding where your money is going and where you\'re losing it unnecessarily. Investment tracking is not included.' },
  { q: 'Is it safe to upload my bank statement?', a: 'Yes. Your statement is processed in memory on our servers and immediately discarded. We never store your financial data, never sell it, and have no persistent access to it after analysis.' },
  { q: 'Can I use this for personal budgeting?', a: 'Absolutely. The category breakdown is the foundation for any budget. See what you\'re actually spending, identify where you\'re over-budget, and use the savings plan to set targets for the next month.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function PersonalFinanceTrackerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Personal Finance Tracker — No App, No Subscription, No Bank Login
        </h1>

        <p className="text-lg text-muted-foreground">
          Most personal finance trackers ask you to connect your bank account and pay a monthly fee.
          Leaky Wallet is different: upload your bank statement once and get your complete personal
          finance picture in 30 seconds — free, private, and no ongoing commitment.
        </p>

        <p className="text-muted-foreground">
          The analysis covers everything: where your money is going by category, every hidden
          subscription, all bank fees, your biggest spending merchants, and a ranked list of actions
          to improve your finances immediately.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Track Your Personal Finances Now</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — full financial picture in 30 seconds</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Finances Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No app · No bank login · CSV or PDF from any bank</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Everything You Get</h2>
          <div className="space-y-3">
            {features.map(({ title, detail }) => (
              <div key={title} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div><span className="font-medium text-foreground">{title}: </span><span className="text-muted-foreground">{detail}</span></div>
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
          <Link href="/money-management" className="text-primary hover:underline">Money Management</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/budget-calculator" className="text-primary hover:underline">Budget Calculator</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
        </nav>
      </article>
    </main>
  )
}
