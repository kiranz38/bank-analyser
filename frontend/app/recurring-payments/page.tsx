import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Find All Recurring Payments & Charges – Free Recurring Payment Finder',
  description: 'Find every recurring payment and charge on your bank account. Upload your bank statement to see all recurring payments — monthly, quarterly, and annual — with total yearly costs.',
  alternates: { canonical: 'https://whereismymoneygo.com/recurring-payments' },
  openGraph: {
    title: 'Recurring Payment Finder – See Every Charge That Auto-Renews',
    description: 'Upload your bank statement and find every recurring payment: subscriptions, memberships, insurance, and bank fees. See the full yearly cost of each.',
    type: 'website', url: 'https://whereismymoneygo.com/recurring-payments', siteName: 'Leaky Wallet',
  },
}

const recurringTypes = [
  { type: 'Monthly subscriptions', examples: 'Netflix, Spotify, Adobe, Microsoft 365, gym memberships, meal kits' },
  { type: 'Annual subscriptions', examples: 'Amazon Prime, antivirus software, domain renewals, professional associations' },
  { type: 'Quarterly charges', examples: 'Some insurance premiums, software licenses, publication subscriptions' },
  { type: 'Insurance premiums', examples: 'Life, health, car, home, travel, income protection — often auto-renewing with price increases' },
  { type: 'Loan repayments', examples: 'Personal loans, car loans, HECS/student debt repayments' },
  { type: 'Utility direct debits', examples: 'Electricity, gas, water, internet, mobile phone' },
  { type: 'Bank fees', examples: 'Monthly account fees, overdraft facilities, credit card annual fees' },
  { type: 'Savings and investment auto-transfers', examples: 'Micro-investment apps, recurring transfers to savings accounts' },
]

const faqs = [
  { q: 'How do I see all my recurring payments?', a: 'Upload your bank statement (CSV or PDF) to Leaky Wallet. The analyzer identifies every recurring charge by pattern — detecting monthly, quarterly, and annual payments even if the amounts vary slightly between periods.' },
  { q: 'Why do I have recurring payments I don\'t recognize?', a: 'Recurring payments often appear under different merchant names than the service you know. "AMZN*PRIME" is Amazon Prime. "PAYPAL *SPOTIFY" is Spotify. "NF*NETFLIX.COM" is Netflix. The analyzer normalizes these so you can identify each charge.' },
  { q: 'Can it detect recurring payments that vary in amount?', a: 'Yes. The analyzer accounts for small amount variations (currency fluctuations, tax changes, price increases) and correctly identifies them as the same recurring charge. It also flags price increases — so you\'ll know when a service raised its price.' },
  { q: 'What\'s the best way to manage recurring payments?', a: 'Start by finding them all (upload your statement), then audit each one: is it still worth it? Are you using it? Would you re-subscribe to it today? Cancel everything that fails that test, then re-evaluate the rest quarterly.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function RecurringPaymentsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Find Every Recurring Payment on Your Bank Account
        </h1>

        <p className="text-lg text-muted-foreground">
          Recurring payments are the most common money leak. They charge automatically, often under
          obscure merchant names, and continue until you actively cancel them. Most people have
          more recurring payments than they realise — and are paying for more than they use.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find All Your Recurring Payments</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — complete recurring payment list in 30 seconds</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Find My Recurring Payments</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Works with any bank</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Types of Recurring Payments the Analyzer Finds</h2>
          <div className="space-y-3">
            {recurringTypes.map(({ type, examples }) => (
              <div key={type} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div><span className="font-medium text-foreground">{type}: </span><span className="text-muted-foreground">{examples}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why Recurring Payments Are Hard to Track Manually</h2>
          <p className="text-sm text-muted-foreground">Bank statements list recurring charges under cryptic merchant codes. Annual payments only appear once a year. Amounts vary due to currency conversion or price increases. Some services split charges across multiple line items. Manual tracking misses most of these — the analyzer catches all of them.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/cancel-subscriptions" className="text-primary hover:underline">Cancel Subscriptions Guide</Link>
          <Link href="/bank-fee-checker" className="text-primary hover:underline">Bank Fee Checker</Link>
        </nav>
      </article>
    </main>
  )
}
