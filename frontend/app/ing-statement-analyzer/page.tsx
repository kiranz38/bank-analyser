import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search, Shield } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'ING Statement Analyzer – Free ING Bank Statement Reader',
  description: 'Free ING bank statement analyzer. Upload your ING CSV or PDF export to find hidden subscriptions, unnecessary fees, and spending leaks. Instant results, no signup.',
  alternates: { canonical: 'https://whereismymoneygo.com/ing-statement-analyzer' },
  openGraph: {
    title: 'Free ING Statement Analyzer – Find Hidden Subscriptions & Fees',
    description: 'Upload your ING statement to see where your money is going — subscriptions, fees, and spending breakdown. Free, private, instant.',
    type: 'website',
    url: 'https://whereismymoneygo.com/ing-statement-analyzer',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I export my ING bank statement?', acceptedAnswer: { '@type': 'Answer', text: "Log in to ING's online banking, go to My Accounts, select your account, click Transaction History, and use the Export button to download as CSV." } },
                { '@type': 'Question', name: 'Is the ING statement analyzer free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — completely free. Upload your ING CSV or PDF export and get a full spending breakdown with no account required.' } },
                { '@type': 'Question', name: 'What does the ING analyzer find?', acceptedAnswer: { '@type': 'Answer', text: 'The analyzer finds hidden subscriptions, recurring charges, bank fees, spending by category, month-over-month changes, and potential savings. It works with any ING transaction export.' } },
                { '@type': 'Question', name: 'Is my ING statement data safe?', acceptedAnswer: { '@type': 'Answer', text: 'Your file is processed in server memory and immediately deleted — never stored or shared. Leaky Wallet cannot see your account number, name, or balance.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ING Statement Analyzer — Find Hidden Charges in 30 Seconds
        </h1>

        <p className="text-lg text-muted-foreground">
          Upload your ING bank statement (CSV or PDF) and instantly see every hidden subscription,
          recurring charge, and bank fee — with a complete spending breakdown by category.
        </p>

        <p className="text-muted-foreground">
          Most ING customers find $150–$400 per year in forgotten subscriptions, duplicate services,
          and avoidable bank fees. The analyzer reads your actual transactions and shows exactly where
          your money is going, in under 30 seconds.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your ING Statement</h2>
          <p className="text-sm text-muted-foreground">Upload your ING CSV or PDF export — instant results, completely free.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Analyze My ING Statement
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Your file is deleted after analysis</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Export Your ING Statement</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span>Log in to your ING online banking on desktop (not the mobile app)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span>Navigate to <strong>Transactions</strong> or <strong>Account History</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span>Select at least 90 days of transactions for the best analysis</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span>Click <strong>Export</strong> or <strong>Download</strong> and choose CSV or PDF format</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">5</span>
              <span>Upload the file to Leaky Wallet — results appear in under 30 seconds</span>
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What the Analyzer Finds</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'All recurring subscriptions — monthly, quarterly, and annual',
              'Forgotten free trials that converted to paid',
              'Price increases on existing subscriptions',
              'Duplicate services you&apos;re paying for twice',
              'Bank fees and avoidable charges',
              'Spending breakdown by category with trends',
              'Month-over-month spending changes',
              'Personalized action plan to recover your money',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Privacy & Security</h2>
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Shield className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your ING statement is processed in server memory and immediately deleted after analysis.
              We never store, log, or share your financial data. Your account number and personal details
              are not used or retained.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: `How do I export my ING bank statement?`, a: "Log in to ING's online banking, go to My Accounts, select your account, click Transaction History, and use the Export button to download as CSV." },
              { q: `Is the ING statement analyzer free?`, a: `Yes — completely free with no account required. Upload your ING CSV or PDF export and get a full spending breakdown instantly.` },
              { q: `What does the ING analyzer find?`, a: `The analyzer finds hidden subscriptions, recurring charges, bank fees, spending by category, month-over-month changes, and savings opportunities.` },
              { q: `Is my ING statement data safe?`, a: `Your file is processed in memory and deleted immediately — never stored or shared. We cannot see your account number, name, or balance.` },
              { q: `Does it work with ING credit card statements?`, a: `Yes. Export your ING credit card transaction history as CSV or PDF and upload it the same way.` },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/ing-statement-analyzer' />
    </main>
  )
}
