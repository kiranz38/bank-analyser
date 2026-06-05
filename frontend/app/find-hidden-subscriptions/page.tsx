import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search, AlertTriangle } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Find Hidden Subscriptions – Free Subscription Finder Tool',
  description: 'Find hidden subscriptions draining your bank account. Upload your bank statement (CSV or PDF) and our free tool detects every recurring charge — even the ones you forgot about.',
  alternates: { canonical: 'https://whereismymoneygo.com/find-hidden-subscriptions' },
  openGraph: {
    title: 'Find Hidden Subscriptions – Free Subscription Finder Tool',
    description: 'Upload your bank statement to find every hidden subscription and recurring charge. Free, instant, no signup.',
    type: 'website',
    url: 'https://whereismymoneygo.com/find-hidden-subscriptions',
    siteName: 'Leaky Wallet',
  },
}

const commonHiddenSubs = [
  { name: 'Free trials that auto-converted', example: 'That "14-day free trial" from 8 months ago' },
  { name: 'Price-increased subscriptions', example: 'Netflix, Spotify, Apple iCloud all raised prices' },
  { name: 'Family plan duplicates', example: 'Paying for the same service twice under different accounts' },
  { name: 'Forgotten annual subscriptions', example: 'Annual charges that only hit once a year' },
  { name: 'Dormant gym memberships', example: 'Still paying $60/month for a gym you last visited in January' },
  { name: 'Domain and hosting renewals', example: 'Side project from 2021 still charging $15/month' },
  { name: 'App store subscriptions', example: 'Apps you downloaded once and never opened again' },
  { name: 'News and magazine paywalls', example: 'Multiple news subscriptions overlapping in coverage' },
]

const faqs = [
  { q: 'How do I find hidden subscriptions on my bank account?', a: 'The fastest way is to upload your bank statement (CSV or PDF) to Leaky Wallet. Our analyzer scans every transaction and flags all recurring charges — including ones that only appear quarterly or annually.' },
  { q: 'Why are subscriptions hard to spot manually?', a: 'Subscription charges are often listed under obscure merchant names (e.g. "AMZN*Prime" or "PAYPAL*SPOTIFY") and vary slightly in amount due to taxes or currency conversion. Our analyzer normalizes all of these and groups them correctly.' },
  { q: 'How much money do people lose to hidden subscriptions?', a: 'Studies estimate the average person has 5–8 subscriptions they\'ve forgotten about, costing $150–$400 per year. Combined with price increases on existing subscriptions, the total leak can exceed $600/year.' },
  { q: 'Can I find subscriptions from PayPal or Apple Pay?', a: 'Yes. As long as these transactions appear in your bank or credit card statement, our analyzer will detect them regardless of the payment method used.' },
  { q: 'Does this work for credit card statements too?', a: 'Absolutely. Export your credit card transactions as CSV or PDF and upload them the same way. Most banks let you download combined transaction histories.' },
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

export default function FindHiddenSubscriptionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Find Hidden Subscriptions Draining Your Bank Account
        </h1>

        <p className="text-lg text-muted-foreground">
          Hidden subscriptions are charges that quietly leave your account every month — often
          for services you forgot you signed up for, no longer use, or didn&apos;t realise had
          auto-renewed. The average person has 5–8 of them.
        </p>

        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          Most people are surprised to find $200–$600/year in subscriptions they had completely forgotten about.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The Most Common Hidden Subscriptions</h2>
          <ul className="space-y-3">
            {commonHiddenSubs.map((sub) => (
              <li key={sub.name} className="space-y-0.5">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {sub.name}
                </p>
                <p className="text-xs text-muted-foreground pl-6">{sub.example}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why Manual Checking Misses Them</h2>
          <p className="text-sm text-muted-foreground">
            Bank statements list merchants under obscure system names — &quot;AMZN*Prime&quot;, &quot;PAYPAL *NETFLIX&quot;,
            &quot;RECURRING CHG ADOBE&quot;. Annual subscriptions only appear once a year. Small amounts ($4.99, $7.99)
            don&apos;t stand out when you&apos;re scanning hundreds of transactions. Currency conversion makes
            US dollar charges look different each month.
          </p>
          <p className="text-sm text-muted-foreground">
            Leaky Wallet&apos;s analyzer normalizes all merchant names, groups by recurrence pattern,
            and surfaces everything — including quarterly and annual charges that are easy to miss.
          </p>
        </section>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find Your Hidden Subscriptions Now</h2>
          <p className="text-sm text-muted-foreground">
            Upload your bank statement (CSV or PDF) — takes 30 seconds, completely free.
          </p>
          <Button asChild size="lg">
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              Find My Hidden Subscriptions
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Your data is never stored</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Find Hidden Subscriptions</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong className="text-foreground">Export your bank statement.</strong> Log in to your bank&apos;s website or app, navigate to Statements or Transaction History, and download the last 90 days as CSV or PDF.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong className="text-foreground">Upload to Leaky Wallet.</strong> Drop your file on the analyzer. No account required. Your data is processed privately and immediately discarded.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong className="text-foreground">Review every subscription detected.</strong> See each recurring charge with the merchant name, amount, frequency, and how long it&apos;s been running.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong className="text-foreground">Cancel what you don&apos;t need.</strong> The pro report gives you exact cancellation steps for each detected subscription.</span>
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
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
          <Link href="/how-it-works" className="text-primary hover:underline">How It Works</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/find-hidden-subscriptions" />

    </main>
  )
}
