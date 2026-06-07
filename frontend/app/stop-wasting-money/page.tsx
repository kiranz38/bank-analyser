import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Stop Wasting Money – Find Where Your Money Goes and Stop the Leaks',
  description: 'Stop wasting money on forgotten subscriptions, avoidable fees, and unused services. Upload your bank statement to find every unnecessary charge and get a personalized action plan to stop the leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/stop-wasting-money' },
  openGraph: {
    title: 'Stop Wasting Money – See Every Unnecessary Charge in 30 Seconds',
    description: "Upload your bank statement to find exactly where you're wasting money — subscriptions, fees, and charges you forgot about. Free, instant, private.",
    type: 'website',
    url: 'https://whereismymoneygo.com/stop-wasting-money',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "How do I find out what I'm wasting money on?", acceptedAnswer: { '@type': 'Answer', text: "Upload your bank statement (CSV or PDF) to Leaky Wallet. The analyzer categorizes every transaction and flags all recurring charges — showing exactly where your money is going and which charges you're paying for but not using." } },
                { '@type': 'Question', name: 'What do people waste the most money on?', acceptedAnswer: { '@type': 'Answer', text: 'The top money wasters are: forgotten subscriptions ($150–$400/year average), food delivery and dining out ($200–$600/month for frequent users), avoidable bank fees ($50–$200/year), and duplicate services ($100–$300/year).' } },
                { '@type': 'Question', name: 'How do I stop unnecessary spending?', acceptedAnswer: { '@type': 'Answer', text: 'Start by making it visible. Upload your bank statement to see every transaction by category. The act of seeing your spending patterns is often enough to change behavior — before you even need to set a budget.' } },
                { '@type': 'Question', name: 'Can I stop wasting money without giving up things I enjoy?', acceptedAnswer: { '@type': 'Answer', text: "Yes. The biggest savings usually come from things you're already not enjoying — forgotten subscriptions, unused memberships, services you've been meaning to cancel. These are cuts with no lifestyle impact." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Stop Wasting Money — Find the Leaks First
        </h1>

        <p className="text-lg text-muted-foreground">
          Most money is wasted not on big purchases but on small, invisible recurring charges that accumulate quietly every month. Forgotten subscriptions, auto-renewed trials, price-crept services, and avoidable bank fees — each individually small, together they add up to hundreds per year.
        </p>

        <p className="text-muted-foreground">
          The first step to stopping the waste is seeing it. Upload your bank statement and get a complete picture of every unnecessary charge — with the exact amount and how long it's been running.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find What You're Wasting Money On</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and see every unnecessary charge — free, instant, private.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Stop My Money Leaks
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The Most Common Money Wasters</h2>
          <ul className="space-y-3">
            <li key='Subscriptions you forgot about' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscriptions you forgot about</p>
              <p className="text-xs text-muted-foreground pl-6">Services you signed up for once and never think about — still charging monthly</p>
            </li>
            <li key='Free trials that became paid' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Free trials that became paid</p>
              <p className="text-xs text-muted-foreground pl-6">14-day trials that converted and are now 14 months of charges</p>
            </li>
            <li key='Duplicated services' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Duplicated services</p>
              <p className="text-xs text-muted-foreground pl-6">Two cloud storage plans, two music streaming apps, two antivirus subscriptions</p>
            </li>
            <li key='Dormant gym memberships' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Dormant gym memberships</p>
              <p className="text-xs text-muted-foreground pl-6">The gym you joined in January, went to for 3 weeks, and are still paying for</p>
            </li>
            <li key='Food delivery creep' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Food delivery creep</p>
              <p className="text-xs text-muted-foreground pl-6">What started as once/week is now 4–5 times/week at $30 average — $600/month</p>
            </li>
            <li key='Avoidable bank fees' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Avoidable bank fees</p>
              <p className="text-xs text-muted-foreground pl-6">ATM fees, account fees, and foreign transaction fees that can often be eliminated</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Stop Wasting Money in 4 Steps</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>See all your charges at once.</strong> Upload your bank statement — every transaction is categorized and every recurring charge is surfaced automatically.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Cancel the things you don't use.</strong> Start with subscriptions you haven't used in the last 30 days. Cancel them this week.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Question the habits.</strong> Delivery 4x/week? Dining out daily? One change in a single category can save $100–$300/month.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Set category limits going forward.</strong> Use your real spending data to set monthly limits for each category — and check once a month.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How do I find out what I'm wasting money on?", a: "Upload your bank statement (CSV or PDF) to Leaky Wallet. The analyzer categorizes every transaction and flags all recurring charges — showing exactly where your money is going and which charges you're paying for but not using." },
          { q: 'What do people waste the most money on?', a: 'The top money wasters are: forgotten subscriptions ($150–$400/year average), food delivery and dining out ($200–$600/month for frequent users), avoidable bank fees ($50–$200/year), and duplicate services ($100–$300/year).' },
          { q: 'How do I stop unnecessary spending?', a: 'Start by making it visible. Upload your bank statement to see every transaction by category. The act of seeing your spending patterns is often enough to change behavior — before you even need to set a budget.' },
          { q: 'Can I stop wasting money without giving up things I enjoy?', a: "Yes. The biggest savings usually come from things you're already not enjoying — forgotten subscriptions, unused memberships, services you've been meaning to cancel. These are cuts with no lifestyle impact." },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/how-to-save-money" className="text-primary hover:underline">How to Save Money</Link>
          <Link href="/subscription-audit" className="text-primary hover:underline">Subscription Audit</Link>
          <Link href="/money-saving-tips" className="text-primary hover:underline">Money Saving Tips</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/stop-wasting-money' />
    </main>
  )
}
