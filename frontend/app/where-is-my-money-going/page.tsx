import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Where Is My Money Going? – Free Spending Analyzer',
  description: "Find out exactly where your money is going every month. Upload your bank statement to get a full spending breakdown by category, find the leaks, and get a personalised savings plan. Free.",
  alternates: { canonical: 'https://whereismymoneygo.com/where-is-my-money-going' },
  openGraph: {
    title: "Where Is My Money Going? – Free Spending Analyzer",
    description: "Upload your bank statement to see exactly where your money goes each month — subscriptions, food, entertainment, fees, and more.",
    type: 'website',
    url: 'https://whereismymoneygo.com/where-is-my-money-going',
    siteName: 'Leaky Wallet',
  },
}

const spendingCategories = [
  { category: 'Subscriptions', insight: 'The average person pays for 7+ subscriptions — many forgotten' },
  { category: 'Dining & Takeaway', insight: 'Often the fastest-growing category month over month' },
  { category: 'Groceries', insight: 'Small increases per shop compound quickly across the year' },
  { category: 'Entertainment', insight: 'Streaming, gaming, and events can easily hit $200+/month' },
  { category: 'Transport', insight: 'Ride shares, tolls, and parking add up invisibly' },
  { category: 'Bank Fees', insight: 'Monthly account fees, ATM fees, and foreign transaction charges' },
  { category: 'Health & Fitness', insight: 'Gym memberships, apps, and supplements often underused' },
  { category: 'Insurance', insight: 'Duplicate cover or lapsed price competition drives this up' },
]

const faqs = [
  { q: 'Why don\'t I know where my money is going?', a: 'Most people\'s spending is spread across dozens of merchants and categories, making patterns invisible to manual review. Subscriptions auto-renew silently, prices creep up, and small charges go unnoticed until they add up to hundreds per month.' },
  { q: 'How can I track where my money goes each month?', a: 'The most accurate method is to analyze your actual bank transactions. Upload a CSV or PDF from your bank to Leaky Wallet and get an instant category breakdown — no manual entry required.' },
  { q: 'What\'s the biggest money leak most people don\'t notice?', a: 'Forgotten subscriptions and subscription price increases are the most common. But bank fees, overlapping insurance policies, and dining/delivery spending that\'s crept up over time are also major culprits.' },
  { q: 'How often should I analyze my spending?', a: 'Monthly is ideal. Export your previous month\'s transactions, upload them, and compare category totals month-over-month. The analyzer shows you which categories increased and by how much.' },
  { q: 'Can this help me save money?', a: 'Yes. The free analysis shows your spending leaks. The Pro report ($1.99) gives you a personalized 12-week savings plan with specific actions: subscriptions to cancel, fees to negotiate, categories to set limits on, and a projected savings total.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

export default function WhereIsMyMoneyGoingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Where Is My Money Going? Find Out in 30 Seconds.
        </h1>

        <p className="text-lg text-muted-foreground">
          You earn a solid income, but somehow there&apos;s never as much left over as there should be.
          The spending is spread across dozens of merchants — food, subscriptions, transport, fees —
          and none of it is obvious until you look at the full picture.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet analyzes your bank statement and shows you exactly where every dollar went,
          broken down by category, merchant, and month. Most people are surprised at what they find.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find Out Where Your Money Is Going</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement CSV or PDF — instant results, completely free.</p>
          <Button asChild size="lg">
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              Analyze My Spending Now
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The Categories Where Money Disappears</h2>
          <div className="space-y-3">
            {spendingCategories.map(({ category, insight }) => (
              <div key={category} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span><strong className="text-foreground">{category}:</strong> <span className="text-muted-foreground">{insight}</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What the Analysis Shows You</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Total spending by category with percentage breakdown</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Your top merchants — where the largest amounts actually went</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Month-over-month comparison: which categories grew and by how much</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>All subscriptions and recurring charges detected automatically</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Estimated &quot;money leak&quot; — the recoverable amount you&apos;re losing monthly</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Easy wins: specific actions to save money this week</span></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Get Your Spending Breakdown</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span>Log in to your bank and download the last 90 days of transactions as CSV or PDF</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span>Upload the file to Leaky Wallet — no account required, completely private</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span>Get an instant breakdown showing every category, every subscription, every leak</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span>Unlock the Pro report for a personalised 12-week savings plan ($1.99 one-time)</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/how-it-works" className="text-primary hover:underline">How It Works</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/where-is-my-money-going" />

    </main>
  )
}
