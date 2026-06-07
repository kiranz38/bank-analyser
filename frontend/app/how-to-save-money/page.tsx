import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'How to Save Money – Find Your Hidden Savings in Your Bank Statement',
  description: "Learn how to save money by finding what's quietly draining your bank account. Upload your bank statement to find hidden subscriptions, unnecessary fees, and spending leaks — your easiest savings are already there.",
  alternates: { canonical: 'https://whereismymoneygo.com/how-to-save-money' },
  openGraph: {
    title: "How to Save Money – Start With What's Already Leaving Your Account",
    description: "The fastest way to save money is to find what's already leaking from your account. Upload your bank statement and see your savings opportunities in 30 seconds.",
    type: 'website',
    url: 'https://whereismymoneygo.com/how-to-save-money',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the fastest way to save money?', acceptedAnswer: { '@type': 'Answer', text: "Cancel subscriptions you don't use. It's the only money-saving action that requires zero behaviour change — you just stop paying for things you're not using. The average person recovers $150–$400/year this way." } },
                { '@type': 'Question', name: 'How much money can I save by cancelling subscriptions?', acceptedAnswer: { '@type': 'Answer', text: "Studies suggest the average person has 5–8 forgotten subscriptions. At an average of $14.99/month each, that's $75–$120/month or $900–$1,400/year in potential savings from subscriptions alone." } },
                { '@type': 'Question', name: 'How do I find out where my money is going?', acceptedAnswer: { '@type': 'Answer', text: "Upload your bank statement (CSV or PDF) to Leaky Wallet. In under 30 seconds you'll see every transaction categorized — subscriptions, dining, groceries, transport, fees — with monthly and annual totals." } },
                { '@type': 'Question', name: 'What percentage of income should I save?', acceptedAnswer: { '@type': 'Answer', text: 'The 50/30/20 rule recommends 20% of take-home pay for savings. Most people can reach this by eliminating subscription leaks and one or two spending categories. Start with whatever you can and build up.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How to Save Money — Start With What's Already Draining Your Account
        </h1>

        <p className="text-lg text-muted-foreground">
          The fastest path to saving more money isn't cutting back on things you enjoy — it's finding the money that's leaving your account without you noticing. The average person loses $400–$600 per year to forgotten subscriptions, avoidable bank fees, and services they no longer use.
        </p>

        <p className="text-muted-foreground">
          Before you budget, before you cut back, find out what's already leaking. Upload your bank statement and get a complete picture of where your money goes — subscriptions, fees, dining, groceries, transport — in under 30 seconds.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find Your Hidden Savings</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement to see exactly what's draining your account — and how much you could save.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Find My Savings
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The Fastest Ways to Save Money</h2>
          <ul className="space-y-3">
            <li key='Cancel forgotten subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Cancel forgotten subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">Average saving: $150–$400/year — zero lifestyle change required</p>
            </li>
            <li key='Eliminate bank fees' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Eliminate bank fees</p>
              <p className="text-xs text-muted-foreground pl-6">Many account and ATM fees are waivable — check your eligibility</p>
            </li>
            <li key='Cut duplicate services' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Cut duplicate services</p>
              <p className="text-xs text-muted-foreground pl-6">Paying for two streaming or cloud storage plans you could consolidate</p>
            </li>
            <li key='Review price-increased subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Review price-increased subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">Many services raise prices 20–50% without notifying you</p>
            </li>
            <li key='Reduce dining and delivery spending' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Reduce dining and delivery spending</p>
              <p className="text-xs text-muted-foreground pl-6">Often the fastest-growing category — reducing 25% saves hundreds/year</p>
            </li>
            <li key='Switch to annual plans' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Switch to annual plans</p>
              <p className="text-xs text-muted-foreground pl-6">Many subscription services offer 20–40% off for annual payment</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Save Money Starting This Week</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Find your leaks.</strong> Upload your bank statement to see every subscription, fee, and spending category — sorted by how much each is costing you.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Cancel the obvious ones first.</strong> Any subscription you haven't used in 30 days or more is a candidate. Cancel it and see the savings immediately.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Negotiate the rest.</strong> Call your bank about avoidable fees. Contact subscription services about retention offers or annual plan discounts.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Redirect the savings.</strong> Set up an automatic transfer of the cancelled subscription amounts into savings — you won't miss money you never see.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What is the fastest way to save money?', a: "Cancel subscriptions you don't use. It's the only money-saving action that requires zero behaviour change — you just stop paying for things you're not using. The average person recovers $150–$400/year this way." },
          { q: 'How much money can I save by cancelling subscriptions?', a: "Studies suggest the average person has 5–8 forgotten subscriptions. At an average of $14.99/month each, that's $75–$120/month or $900–$1,400/year in potential savings from subscriptions alone." },
          { q: 'How do I find out where my money is going?', a: "Upload your bank statement (CSV or PDF) to Leaky Wallet. In under 30 seconds you'll see every transaction categorized — subscriptions, dining, groceries, transport, fees — with monthly and annual totals." },
          { q: 'What percentage of income should I save?', a: 'The 50/30/20 rule recommends 20% of take-home pay for savings. Most people can reach this by eliminating subscription leaks and one or two spending categories. Start with whatever you can and build up.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/cancel-subscriptions" className="text-primary hover:underline">Cancel Subscriptions</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/budget-planner" className="text-primary hover:underline">Budget Planner</Link>
          <Link href="/money-saving-tips" className="text-primary hover:underline">Money Saving Tips</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/how-to-save-money' />
    </main>
  )
}
