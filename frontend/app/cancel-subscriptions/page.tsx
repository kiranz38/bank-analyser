import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search, X } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'How to Cancel Subscriptions – Find & Cancel Hidden Subscriptions From Your Bank Statement',
  description: 'Find and cancel hidden subscriptions draining your bank account. Upload your bank statement to see every recurring charge, then follow our guide to cancel the ones you no longer need.',
  alternates: { canonical: 'https://whereismymoneygo.com/cancel-subscriptions' },
  openGraph: {
    title: 'How to Cancel Hidden Subscriptions – Find Them All in 30 Seconds',
    description: 'Upload your bank statement to find every subscription and recurring charge. Then follow our cancellation guide to stop the ones you don\'t need.',
    type: 'website', url: 'https://whereismymoneygo.com/cancel-subscriptions', siteName: 'Leaky Wallet',
  },
}

const commonSubs = [
  { service: 'Netflix', cancel: 'Account → Membership → Cancel Membership' },
  { service: 'Spotify', cancel: 'Account → Subscription → Cancel Premium' },
  { service: 'Amazon Prime', cancel: 'Account & Lists → Prime Membership → End Membership' },
  { service: 'Disney+', cancel: 'Account → Billing Details → Cancel Subscription' },
  { service: 'Apple iCloud / Apple One', cancel: 'Settings → [Your Name] → Subscriptions → Cancel' },
  { service: 'Google One', cancel: 'Google One app → Settings → Cancel membership' },
  { service: 'Adobe Creative Cloud', cancel: 'Adobe Account → Manage plan → Cancel plan' },
  { service: 'Microsoft 365', cancel: 'Microsoft Account → Services → Cancel subscription' },
  { service: 'Gym membership', cancel: 'Contact gym directly — must be in writing for most providers' },
  { service: 'PayPal subscriptions', cancel: 'PayPal Settings → Payments → Manage pre-approved payments' },
]

const faqs = [
  { q: 'How do I find all my subscriptions to cancel?', a: 'The fastest way is to upload your bank statement (CSV or PDF) to Leaky Wallet. The analyzer scans your transactions and lists every recurring charge — including ones billed quarterly or annually that are easy to miss.' },
  { q: 'How do I cancel a subscription I don\'t recognize?', a: 'Search the merchant name (from your bank statement) in Google followed by "cancel subscription". Many mysterious charges come from app stores — check your Apple Subscriptions or Google Play Subscriptions list for any unrecognized services.' },
  { q: 'Can I get a refund when I cancel a subscription?', a: 'It depends on the service and timing. Most subscriptions don\'t refund the current period but stop future charges. Some services (like Amazon Prime) will prorate a refund for unused time. It\'s always worth asking.' },
  { q: 'What if a subscription keeps charging after I cancelled?', a: 'First, verify the cancellation confirmation email. If you have it and you\'re still being charged, contact your bank to raise a dispute. For persistent cases, asking your bank to block the merchant or issue a new card number stops the charges.' },
  { q: 'How do I cancel subscriptions billed through my Apple ID?', a: 'On iPhone: Settings → [Your Name] → Subscriptions. On Mac: App Store → Account → Subscriptions. You\'ll see all active Apple-billed subscriptions and can cancel each one individually.' },
  { q: 'How do I cancel subscriptions billed through Google Play?', a: 'Open Google Play Store → tap your profile → Payments & subscriptions → Subscriptions. All active Google Play subscriptions are listed with cancel options.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function CancelSubscriptionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How to Find and Cancel Hidden Subscriptions
        </h1>

        <p className="text-lg text-muted-foreground">
          Before you can cancel subscriptions, you need to find them all. Bank statements hide them
          behind obscure merchant codes. Leaky Wallet surfaces every single one — then this guide
          helps you cancel them.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Step 1: Find All Your Subscriptions</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement to see every recurring charge in 30 seconds</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Find My Subscriptions Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Cancel Common Subscriptions</h2>
          <div className="space-y-2">
            {commonSubs.map(({ service, cancel }) => (
              <div key={service} className="flex gap-2 text-sm">
                <X className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">{service}: </span>
                  <span className="text-muted-foreground">{cancel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The 3-Step Process to Cancel Everything You Don&apos;t Need</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><span><strong className="text-foreground">Find them all.</strong> Upload your bank statement to Leaky Wallet and get a complete list of every subscription and recurring charge — including ones you forgot you had.</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span><span><strong className="text-foreground">Decide what to keep.</strong> For each subscription ask: Have I used this in the last 30 days? Would I pay for it again today? If the answer to either is no — cancel it.</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span><span><strong className="text-foreground">Cancel and confirm.</strong> Cancel through the service&apos;s website or app (not just deleting the app). Always look for a confirmation email to prove cancellation before the next billing date.</span></li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Check These 4 Places for Hidden Subscriptions</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span><strong className="text-foreground">Your bank statement</strong> — the source of truth. Leaky Wallet scans it automatically.</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span><strong className="text-foreground">Apple Subscriptions</strong> — Settings → [Your Name] → Subscriptions</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span><strong className="text-foreground">Google Play Subscriptions</strong> — Play Store → Profile → Payments & subscriptions</span></li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span><strong className="text-foreground">PayPal recurring payments</strong> — Settings → Payments → Manage pre-approved payments</span></li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
        </nav>
      </article>
    </main>
  )
}
