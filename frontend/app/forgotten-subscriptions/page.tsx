import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: "Forgotten Subscriptions – Find Subscriptions You've Been Paying For Without Knowing",
  description: 'Find forgotten subscriptions still charging your bank account. Upload your bank statement and see every service you signed up for and forgot — with total yearly cost of each.',
  alternates: { canonical: 'https://whereismymoneygo.com/forgotten-subscriptions' },
  openGraph: {
    title: 'Find Forgotten Subscriptions – Free Tool, 30 Seconds',
    description: 'Upload your bank statement to find every forgotten subscription still draining your account. Free, instant, no signup.',
    type: 'website',
    url: 'https://whereismymoneygo.com/forgotten-subscriptions',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I find subscriptions I forgot about?', acceptedAnswer: { '@type': 'Answer', text: 'Export your bank statement as CSV or PDF and upload it to Leaky Wallet. The analyzer detects every recurring charge — including annual ones that only appear once a year — and groups them by merchant.' } },
                { '@type': 'Question', name: 'Can I find subscriptions charged to PayPal or Apple Pay?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. As long as the charge appears in your bank or credit card statement (even as a PayPal or Apple Pay transaction), the analyzer will detect and identify it.' } },
                { '@type': 'Question', name: 'What are the most common forgotten subscriptions?', acceptedAnswer: { '@type': 'Answer', text: 'The most commonly forgotten are: free trials that converted (Adobe, Canva, VPNs), annual subscriptions (domain names, cloud storage), dormant gym or fitness memberships, and app store subscriptions from apps you deleted.' } },
                { '@type': 'Question', name: 'How much does the average person have in forgotten subscriptions?', acceptedAnswer: { '@type': 'Answer', text: 'Estimates range from $150 to $400 per year. Combined with price increases on existing subscriptions, the total leak from forgotten charges often exceeds $500 per year.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Find Forgotten Subscriptions Still Charging You
        </h1>

        <p className="text-lg text-muted-foreground">
          Forgotten subscriptions are the silent killers of personal finance. A free trial here, a one-click signup there — and suddenly you're paying $200/month for services you haven't used in over a year.
        </p>

        <p className="text-muted-foreground">
          Unlike apps that require you to link your bank account permanently, Leaky Wallet works by analyzing your statement file directly. Upload once, get the full list instantly, then delete your file. No ongoing access to your bank account required.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find Your Forgotten Subscriptions</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — all recurring charges found in 30 seconds.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Find Forgotten Subscriptions
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Where Forgotten Subscriptions Hide</h2>
          <ul className="space-y-3">
            <li key='Free trials never cancelled' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Free trials never cancelled</p>
              <p className="text-xs text-muted-foreground pl-6">Services you signed up for once and never thought about again</p>
            </li>
            <li key='Annual renewals' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Annual renewals</p>
              <p className="text-xs text-muted-foreground pl-6">Only charged once a year — completely invisible in monthly reviews</p>
            </li>
            <li key='Old streaming services' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Old streaming services</p>
              <p className="text-xs text-muted-foreground pl-6">A platform you used during lockdown that's still running</p>
            </li>
            <li key='Software subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Software subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">Creative tools, VPNs, cloud storage from a project you finished</p>
            </li>
            <li key='Marketplace subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Marketplace subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">Amazon, Apple, Google Play subscriptions buried in your bill</p>
            </li>
            <li key='Foreign currency charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Foreign currency charges</p>
              <p className="text-xs text-muted-foreground pl-6">US-billed subscriptions that look different each month due to FX</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Find Forgotten Subscriptions</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Download your statement.</strong> Log in to your bank's website (not the app), go to Transaction History, and export the last 90 days as CSV or PDF.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload to the analyzer.</strong> Drop your file here — processing takes under 30 seconds. No account required.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>See every subscription.</strong> The analyzer groups all recurring charges by merchant and shows you the total yearly cost of each one.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Cancel what you don't need.</strong> Use the cancellation guide to stop each forgotten subscription.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I find subscriptions I forgot about?', a: 'Export your bank statement as CSV or PDF and upload it to Leaky Wallet. The analyzer detects every recurring charge — including annual ones that only appear once a year — and groups them by merchant.' },
          { q: 'Can I find subscriptions charged to PayPal or Apple Pay?', a: 'Yes. As long as the charge appears in your bank or credit card statement (even as a PayPal or Apple Pay transaction), the analyzer will detect and identify it.' },
          { q: 'What are the most common forgotten subscriptions?', a: 'The most commonly forgotten are: free trials that converted (Adobe, Canva, VPNs), annual subscriptions (domain names, cloud storage), dormant gym or fitness memberships, and app store subscriptions from apps you deleted.' },
          { q: 'How much does the average person have in forgotten subscriptions?', a: 'Estimates range from $150 to $400 per year. Combined with price increases on existing subscriptions, the total leak from forgotten charges often exceeds $500 per year.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/subscription-audit" className="text-primary hover:underline">Subscription Audit</Link>
          <Link href="/cancel-subscriptions" className="text-primary hover:underline">Cancel Subscriptions</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/forgotten-subscriptions' />
    </main>
  )
}
