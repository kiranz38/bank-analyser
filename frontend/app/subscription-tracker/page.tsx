import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search, TrendingDown } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Free Subscription Tracker – See All Your Recurring Charges in One Place',
  description: 'Track all your subscriptions automatically. Upload your bank statement and get a complete list of every recurring charge — Netflix, Spotify, gym, insurance, apps — with yearly cost totals.',
  alternates: { canonical: 'https://whereismymoneygo.com/subscription-tracker' },
  openGraph: {
    title: 'Free Subscription Tracker – See All Your Recurring Charges in One Place',
    description: 'Upload your bank statement to automatically track every subscription and recurring charge. Free, instant, private.',
    type: 'website',
    url: 'https://whereismymoneygo.com/subscription-tracker',
    siteName: 'Leaky Wallet',
  },
}

const subscriptionCategories = [
  { category: 'Streaming', examples: 'Netflix, Stan, Binge, Disney+, Apple TV+, Prime Video, YouTube Premium' },
  { category: 'Music', examples: 'Spotify, Apple Music, Tidal, YouTube Music' },
  { category: 'Fitness', examples: 'Gym memberships, Peloton, Whoop, Nike Training Club' },
  { category: 'Software & Apps', examples: 'Adobe, Microsoft 365, Dropbox, iCloud, Google One' },
  { category: 'News & Media', examples: 'The Age, AFR, NYT, Bloomberg, The Athletic' },
  { category: 'Insurance & Finance', examples: 'Life insurance, income protection, credit monitoring' },
  { category: 'Food & Delivery', examples: 'HelloFresh, Marley Spoon, DoorDash DashPass' },
  { category: 'Gaming', examples: 'Xbox Game Pass, PlayStation Plus, Nintendo Switch Online' },
]

const faqs = [
  { q: 'How does the subscription tracker work?', a: 'You upload a CSV or PDF bank statement. The analyzer scans every transaction, identifies recurring charges by pattern (same merchant, regular interval, similar amount), and presents them grouped by category with monthly and annual cost totals.' },
  { q: 'Is there a subscription tracker app I need to install?', a: 'No — Leaky Wallet is entirely web-based. Upload your bank statement in your browser and get results immediately. Nothing to install.' },
  { q: 'Does it track subscriptions I pay via PayPal or credit card?', a: 'Yes. As long as the charges appear on a bank or credit card statement, the tracker will detect them. Export your credit card CSV or PDF from your card issuer and upload it the same way.' },
  { q: 'Can it catch annual subscriptions?', a: 'Yes. The analyzer flags both monthly and annual recurring charges. Annual subscriptions often go unnoticed because they only appear once a year — the tracker specifically looks for these.' },
  { q: 'What if a subscription uses a different amount each month?', a: 'The analyzer accounts for small variations in amount (e.g. different tax rates, currency fluctuations) and still groups them correctly as the same subscription.' },
  { q: 'How is this different from manually going through my bank statement?', a: 'Manual review misses charges listed under system codes ("AMZN*PRIME", "RECURR-ADOBE"). It also misses quarterly and annual charges, and can\'t calculate yearly totals or spot price increases. The analyzer does all of this automatically in seconds.' },
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

export default function SubscriptionTrackerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Subscription Tracker — Find Every Recurring Charge on Your Account
        </h1>

        <p className="text-lg text-muted-foreground">
          Tracking subscriptions manually is nearly impossible. Charges appear under obscure merchant names,
          prices increase without notice, and new services add up faster than you realise. Leaky Wallet
          automatically identifies every recurring charge from your bank statement — no spreadsheet required.
        </p>

        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary flex items-center gap-2">
          <TrendingDown className="h-4 w-4 shrink-0" />
          The average Australian household pays for 7.4 subscriptions. Many are forgotten or duplicated.
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Every Category of Subscription, Tracked Automatically</h2>
          <div className="space-y-2">
            {subscriptionCategories.map(({ category, examples }) => (
              <div key={category} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span><strong className="text-foreground">{category}:</strong> <span className="text-muted-foreground">{examples}</span></span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Track Your Subscriptions Now</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — get a full subscription list in 30 seconds.</p>
          <Button asChild size="lg">
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              Track My Subscriptions Free
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Your data is never stored</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What You Get From the Subscription Tracker</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Complete list of all recurring charges with merchant names and amounts</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Monthly and annual cost total for each subscription</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Confidence score for each detected subscription (how certain the detection is)</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Category grouping: streaming, fitness, software, food, insurance</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Detection of price increases on existing subscriptions</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>Estimated annual cost of your full subscription stack</span></li>
          </ul>
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
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
          <Link href="/how-it-works" className="text-primary hover:underline">How It Works</Link>
        </nav>
      </article>
    </main>
  )
}
