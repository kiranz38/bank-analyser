import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Free Money Management Tool – Analyze Your Spending & Find Where You\'re Losing Money',
  description: 'Free money management tool. Upload your bank statement to analyze your spending, find where your money leaks, track subscriptions, and get a personalized plan to save more. No app required.',
  alternates: { canonical: 'https://whereismymoneygo.com/money-management' },
  openGraph: {
    title: 'Free Money Management Tool – Find Where Your Money Leaks',
    description: 'Upload your bank statement for instant money management insights: spending by category, hidden subscriptions, bank fees, and a savings action plan.',
    type: 'website', url: 'https://whereismymoneygo.com/money-management', siteName: 'Leaky Wallet',
  },
}

const principles = [
  { title: 'Know where it goes', detail: 'You can\'t manage money you can\'t see. The first step is a complete transaction breakdown — not estimates, actual data from your bank statement.' },
  { title: 'Cut what you don\'t use', detail: 'Subscriptions and memberships you\'ve forgotten about are pure waste. The analyzer finds them all, with exact amounts and how long they\'ve been running.' },
  { title: 'Stop paying avoidable fees', detail: 'Bank fees, foreign transaction charges, and penalty fees are often avoidable or negotiable. Identifying them is the first step to eliminating them.' },
  { title: 'Understand your patterns', detail: 'Seeing month-over-month trends in your spending reveals habits you might not notice otherwise — like delivery costs quietly doubling over six months.' },
  { title: 'Act on the highest-value changes first', detail: 'The easy wins list ranks actions by savings impact. Cancelling a $60/month gym you don\'t use beats cutting one coffee. Start with the big ones.' },
]

const faqs = [
  { q: 'What is money management and why does it matter?', a: 'Money management is understanding and controlling where your money goes. Most people earn enough to be financially comfortable but lose 20-30% of their income to invisible costs — forgotten subscriptions, price increases, bank fees, and spending drift. Managing money means seeing those leaks and plugging them.' },
  { q: 'What\'s the easiest way to start managing money better?', a: 'The most effective first step is looking at your actual bank transactions. Upload your bank statement to Leaky Wallet — in 30 seconds you\'ll know exactly where every dollar went, what recurring charges are draining your account, and what to do about it.' },
  { q: 'How much can I save by managing my money better?', a: 'Most people who go through a proper spending analysis recover $150–$600 per year just from the easy wins: cancelling forgotten subscriptions, eliminating avoidable bank fees, and cutting duplicate services.' },
  { q: 'Do I need a financial advisor or budgeting app?', a: 'Not to start. Understanding your current spending is free and takes 30 seconds with a bank statement upload. A financial advisor or budgeting app adds value later — but only after you understand your baseline.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function MoneyManagementPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Money Management Tool — Find Where Your Money Leaks
        </h1>

        <p className="text-lg text-muted-foreground">
          Good money management starts with knowing where your money actually goes — not where you
          think it goes. Upload your bank statement and get a complete picture in 30 seconds.
          No app, no subscription, no bank login required.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Start Managing Your Money Better</h2>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Spending Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No app · No bank login · Works with any bank worldwide</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">The 5 Principles of Effective Money Management</h2>
          <div className="space-y-4">
            {principles.map(({ title, detail }) => (
              <div key={title} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div><p className="font-medium text-foreground">{title}</p><p className="text-muted-foreground mt-0.5">{detail}</p></div>
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
          <Link href="/personal-finance-tracker" className="text-primary hover:underline">Personal Finance Tracker</Link>
          <Link href="/budget-calculator" className="text-primary hover:underline">Budget Calculator</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/bank-fee-checker" className="text-primary hover:underline">Bank Fee Checker</Link>
        </nav>
      </article>
    </main>
  )
}
