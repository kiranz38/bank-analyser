import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Subscription Audit – Find & Cut Every Subscription Draining Your Account',
  description: 'Run a free subscription audit on your bank account. Upload your bank statement to find every recurring charge — streaming, apps, memberships, and forgotten trials — with the total yearly cost.',
  alternates: { canonical: 'https://whereismymoneygo.com/subscription-audit' },
  openGraph: {
    title: 'Free Subscription Audit – See Every Recurring Charge in 30 Seconds',
    description: "Upload your bank statement to audit every subscription: find what you're paying, what you forgot, and what to cut. Free, instant, private.",
    type: 'website',
    url: 'https://whereismymoneygo.com/subscription-audit',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I do a subscription audit?', acceptedAnswer: { '@type': 'Answer', text: 'Export your bank statement as CSV or PDF and upload it to Leaky Wallet. The analyzer automatically finds every recurring charge and groups them by merchant — showing you monthly, quarterly, and annual subscriptions with total yearly costs.' } },
                { '@type': 'Question', name: 'How much can I save from a subscription audit?', acceptedAnswer: { '@type': 'Answer', text: 'The average person saves $150–$600 per year by cancelling forgotten subscriptions identified in an audit. Price-increased subscriptions add another $50–$200 in potential savings.' } },
                { '@type': 'Question', name: 'How often should I audit my subscriptions?', acceptedAnswer: { '@type': 'Answer', text: 'Every 3–6 months is ideal. New subscriptions creep in, prices increase, and services you stopped using continue to charge. A quarterly audit keeps your recurring costs under control.' } },
                { '@type': 'Question', name: 'What if I have subscriptions across multiple bank accounts?', acceptedAnswer: { '@type': 'Answer', text: 'Upload multiple statements in one go — Leaky Wallet accepts up to 12 files at once and merges them into a single combined audit.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Subscription Audit — Find Everything You're Paying For
        </h1>

        <p className="text-lg text-muted-foreground">
          A subscription audit is a complete review of every recurring charge hitting your bank account — monthly, quarterly, and annual. Most people are shocked to find 8–15 active subscriptions when they expected 4 or 5.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet reads your bank statement and surfaces every subscription automatically — even the ones buried under obscure merchant names like 'AMZN*PRIME', 'PAYPAL*ADOBE', or 'APPLE.COM/BILL'. No manual scrolling required.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Start Your Subscription Audit</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — every recurring charge found in 30 seconds.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Audit My Subscriptions
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What a Subscription Audit Reveals</h2>
          <ul className="space-y-3">
            <li key='Forgotten free trials' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Forgotten free trials</p>
              <p className="text-xs text-muted-foreground pl-6">That 7-day trial from 14 months ago that became $19.99/month</p>
            </li>
            <li key='Duplicate subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Duplicate subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">Two cloud storage plans, two music apps, two antivirus products</p>
            </li>
            <li key='Price-crept subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Price-crept subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">Services that quietly raised their price without a notification</p>
            </li>
            <li key='Dormant memberships' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Dormant memberships</p>
              <p className="text-xs text-muted-foreground pl-6">Gym, clubs, and services you stopped using months ago</p>
            </li>
            <li key='Annual charges you forgot' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Annual charges you forgot</p>
              <p className="text-xs text-muted-foreground pl-6">Once-a-year subscriptions that are easy to miss</p>
            </li>
            <li key='App store micro-subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />App store micro-subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">$2.99 and $4.99 apps that add up to $30+/month</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Run a Subscription Audit in 3 Steps</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your bank statement.</strong> Log in to your bank's website, go to Transaction History, and download the last 90 days as CSV or PDF.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload to Leaky Wallet.</strong> Drop your file in the analyzer — no account needed. Your data is processed privately and deleted immediately.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Review your subscription list.</strong> See every recurring charge with merchant name, amount, frequency, and total yearly cost. Cancel what you don't need.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I do a subscription audit?', a: 'Export your bank statement as CSV or PDF and upload it to Leaky Wallet. The analyzer automatically finds every recurring charge and groups them by merchant — showing you monthly, quarterly, and annual subscriptions with total yearly costs.' },
          { q: 'How much can I save from a subscription audit?', a: 'The average person saves $150–$600 per year by cancelling forgotten subscriptions identified in an audit. Price-increased subscriptions add another $50–$200 in potential savings.' },
          { q: 'How often should I audit my subscriptions?', a: 'Every 3–6 months is ideal. New subscriptions creep in, prices increase, and services you stopped using continue to charge. A quarterly audit keeps your recurring costs under control.' },
          { q: 'What if I have subscriptions across multiple bank accounts?', a: 'Upload multiple statements in one go — Leaky Wallet accepts up to 12 files at once and merges them into a single combined audit.' },
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
          <Link href="/cancel-subscriptions" className="text-primary hover:underline">Cancel Subscriptions</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/subscription-audit' />
    </main>
  )
}
