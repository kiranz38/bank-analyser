import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Unknown Bank Charges – Identify & Understand Mysterious Bank Charges',
  description: 'Identify unknown charges on your bank statement. Upload your CSV or PDF and our AI analyzer matches every mystery charge to its merchant name, category, and recurrence pattern.',
  alternates: { canonical: 'https://whereismymoneygo.com/unknown-bank-charges' },
  openGraph: {
    title: 'Identify Unknown Bank Charges – Free Tool',
    description: 'Find out what those unknown charges on your bank statement are. Upload your statement and get every charge identified instantly.',
    type: 'website',
    url: 'https://whereismymoneygo.com/unknown-bank-charges',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Why do bank charges show up under weird names?', acceptedAnswer: { '@type': 'Answer', text: "Banks display the merchant's registered payment processor name, which is often different from the brand you know. Payment processors like Square (SQ*), Stripe, and PayPal prefix charges with their name. Truncation also cuts off names at 18–22 characters." } },
                { '@type': 'Question', name: 'How do I dispute an unknown charge?', acceptedAnswer: { '@type': 'Answer', text: "First, identify the charge using Leaky Wallet's analyzer. If you still don't recognize it, contact your bank to dispute it as potentially unauthorized. Most banks have a 30–60 day window for disputes." } },
                { '@type': 'Question', name: 'What if the charge is from a subscription I forgot?', acceptedAnswer: { '@type': 'Answer', text: 'Upload your statement to Leaky Wallet — it groups recurring charges and shows how long each has been running. If you find a forgotten subscription, the cancellation guide shows you how to stop it.' } },
                { '@type': 'Question', name: 'Can Leaky Wallet identify all unknown charges?', acceptedAnswer: { '@type': 'Answer', text: 'Leaky Wallet identifies the vast majority of charges from major merchants, payment processors, and subscription services. Some local or international merchants may still show under their payment processor name.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Identify Unknown Charges on Your Bank Statement
        </h1>

        <p className="text-lg text-muted-foreground">
          Mystery bank charges are more common than you think — merchants often appear under obscure billing names like 'SQ *COFFEESHOP' or 'PAYPAL *HULU' that are nearly impossible to identify manually.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet's AI engine is trained on thousands of merchant billing patterns. Upload your statement and every charge gets matched to its real merchant name, category, and whether it's a one-off or recurring subscription.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Identify Your Unknown Charges</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and every charge gets identified instantly.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Identify My Unknown Charges
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common Sources of Confusing Charges</h2>
          <ul className="space-y-3">
            <li key='Payment processor names' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Payment processor names</p>
              <p className="text-xs text-muted-foreground pl-6">'SQ *', 'STRIPE*', 'PAYPAL *' prefix instead of the actual merchant name</p>
            </li>
            <li key='Foreign currency descriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Foreign currency descriptions</p>
              <p className="text-xs text-muted-foreground pl-6">US-billed services showing dollar amounts with FX conversion added</p>
            </li>
            <li key='Parent company billing' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Parent company billing</p>
              <p className="text-xs text-muted-foreground pl-6">'ALPHABET INC' instead of Google, 'META *' instead of Facebook</p>
            </li>
            <li key='Abbreviated merchant names' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Abbreviated merchant names</p>
              <p className="text-xs text-muted-foreground pl-6">Bank character limits truncate names beyond recognition</p>
            </li>
            <li key='Annual renewals' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Annual renewals</p>
              <p className="text-xs text-muted-foreground pl-6">Services you signed up for a year ago billing under a new name</p>
            </li>
            <li key='Marketplace charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Marketplace charges</p>
              <p className="text-xs text-muted-foreground pl-6">'AMZN MKTP', 'APPLE.COM/BILL', 'GOOG*SERVICES'</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Identify Unknown Charges</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your bank statement.</strong> Download your last 90 days of transactions as CSV or PDF from your bank's website.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload to Leaky Wallet.</strong> The AI matches each transaction to the real merchant, category, and recurrence type.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Review flagged charges.</strong> Every unknown charge is identified with its merchant name, what kind of service it is, and whether it's recurring.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Dispute or cancel.</strong> Contact your bank to dispute unauthorized charges, or cancel subscriptions you no longer want.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Why do bank charges show up under weird names?', a: "Banks display the merchant's registered payment processor name, which is often different from the brand you know. Payment processors like Square (SQ*), Stripe, and PayPal prefix charges with their name. Truncation also cuts off names at 18–22 characters." },
          { q: 'How do I dispute an unknown charge?', a: "First, identify the charge using Leaky Wallet's analyzer. If you still don't recognize it, contact your bank to dispute it as potentially unauthorized. Most banks have a 30–60 day window for disputes." },
          { q: 'What if the charge is from a subscription I forgot?', a: 'Upload your statement to Leaky Wallet — it groups recurring charges and shows how long each has been running. If you find a forgotten subscription, the cancellation guide shows you how to stop it.' },
          { q: 'Can Leaky Wallet identify all unknown charges?', a: 'Leaky Wallet identifies the vast majority of charges from major merchants, payment processors, and subscription services. Some local or international merchants may still show under their payment processor name.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/bank-fee-checker" className="text-primary hover:underline">Bank Fee Checker</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/unknown-bank-charges' />
    </main>
  )
}
