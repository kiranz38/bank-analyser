import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions',
  description: 'Free bank statement analyzer. Upload CSV or PDF to find hidden subscriptions, unexpected fees, and spending leaks. Works with ANZ, CommBank, Westpac, NAB, Chase, Barclays. See estimated yearly savings instantly.',
  alternates: { canonical: 'https://whereismymoneygo.com/bank-statement-analyzer' },
  openGraph: {
    title: 'Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions',
    description: 'Free bank statement analyzer. Upload CSV or PDF to find hidden subscriptions, unexpected fees, and spending leaks.',
    type: 'website',
    url: 'https://whereismymoneygo.com/bank-statement-analyzer',
    siteName: 'Leaky Wallet',
  },
}

const discoveries = [
  'Hidden subscriptions you forgot about',
  'Monthly spending leaks draining your account',
  'Unexpected bank fees and charges',
  'Estimated yearly savings potential',
  'Month-over-month spending changes',
  'Simple action steps to recover your money',
]

const faqs = [
  { q: 'Is this bank statement analyzer free?', a: 'Yes — completely free to use with no signup required. Upload your statement and get results instantly.' },
  { q: 'Do you store my bank statement data?', a: 'No. Your statement is processed in memory and immediately discarded. Nothing is ever saved to our servers.' },
  { q: 'What file formats are supported?', a: 'CSV and PDF bank statements from any bank worldwide, including ANZ, CommBank, Westpac, NAB, Chase, Bank of America, Barclays, HSBC, and more.' },
  { q: 'How long does the analysis take?', a: 'Usually under 30 seconds. Our analyzer scans every transaction and returns a full spending breakdown instantly.' },
  { q: 'What counts as a "spending leak"?', a: 'Spending leaks are charges that quietly drain your account: forgotten trial subscriptions that became paid, duplicate services, rising subscription prices, small recurring fees you never noticed, and unnecessary bank charges.' },
  { q: 'Is this financial advice?', a: 'No. Leaky Wallet provides informational insights to help you understand your spending. It is not financial advice.' },
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

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions',
  description: 'Free bank statement analyzer. Upload CSV or PDF to find hidden subscriptions, unexpected fees, and spending leaks.',
  url: 'https://whereismymoneygo.com/bank-statement-analyzer',
  publisher: { '@type': 'Organization', name: 'Leaky Wallet', url: 'https://whereismymoneygo.com' },
}

export default function BankStatementAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <JsonLd schema={articleSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions
        </h1>

        <p className="text-muted-foreground">
          A bank statement analyzer scans your transaction history to uncover where your money is
          actually going. Instead of manually scrolling through hundreds of transactions, Leaky Wallet
          automatically identifies patterns, recurring charges, and spending habits you may have overlooked.
        </p>

        <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          Most people discover $200–$600 per year in forgotten subscriptions and small recurring charges they had no idea they were paying.
        </p>

        <p className="text-muted-foreground">
          Hidden subscriptions are one of the most common money leaks. A free trial turns into a $14.99/month charge.
          A gym membership you stopped using. A software subscription you signed up for once. These small charges
          are easy to miss individually, but they compound — and our analyzer catches all of them.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet supports CSV and PDF statements from any bank — ANZ, CommBank, Westpac, NAB,
          Chase, Bank of America, Barclays, HSBC, Monzo, and thousands more. Your data is processed
          in-browser only and never stored on our servers.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What the Analyzer Finds</h2>
          <ul className="space-y-2">
            {discoveries.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Use It</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="font-semibold text-foreground">1.</span> Log in to your bank and export your recent transactions as CSV or PDF</li>
            <li className="flex gap-2"><span className="font-semibold text-foreground">2.</span> Upload the file to Leaky Wallet — no account required</li>
            <li className="flex gap-2"><span className="font-semibold text-foreground">3.</span> Get a full spending breakdown in under 30 seconds</li>
            <li className="flex gap-2"><span className="font-semibold text-foreground">4.</span> Unlock the Pro report for a personalized savings plan and 12-week action roadmap</li>
          </ol>
        </section>

        <div className="flex flex-col items-center gap-3 text-center">
          <Button asChild size="lg">
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              Analyze My Bank Statement Free
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Privacy-first</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Works With Any Bank</h2>
          <p className="text-sm text-muted-foreground">
            Export a CSV or PDF from your bank and upload it — Leaky Wallet handles the rest.
            Supported banks include:
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground sm:grid-cols-3">
            {['ANZ', 'Commonwealth Bank', 'Westpac', 'NAB', 'ING Australia', 'Macquarie', 'Chase', 'Bank of America', 'Wells Fargo', 'Barclays', 'HSBC', 'Monzo'].map(bank => (
              <span key={bank} className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-primary" /> {bank}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">…and any other bank that exports CSV or PDF statements.</p>
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

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Free Subscription Tracker</Link>
          <Link href="/how-it-works" className="text-primary hover:underline">How It Works</Link>
          <Link href="/anz-bank-statement-analyzer" className="text-primary hover:underline">ANZ Statement Analyzer</Link>
          <Link href="/commbank-statement-analyzer" className="text-primary hover:underline">CommBank Analyzer</Link>
        </nav>

        <p className="text-center text-xs text-muted-foreground">
          Privacy-first: your data is processed in memory and never stored. Not financial advice.
        </p>
      </article>        <SeoInternalLinks currentPath="/bank-statement-analyzer" />

    </main>
  )
}
