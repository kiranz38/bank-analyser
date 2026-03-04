import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions',
  description: 'Free bank statement analyzer. Upload CSV or PDF to find hidden subscriptions, unexpected fees, and spending leaks. See estimated yearly savings instantly.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/bank-statement-analyzer',
  },
  openGraph: {
    title: 'Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions',
    description: 'Free bank statement analyzer. Upload CSV or PDF to find hidden subscriptions, unexpected fees, and spending leaks. See estimated yearly savings instantly.',
    type: 'website',
    url: 'https://whereismymoneygo.com/bank-statement-analyzer',
    siteName: 'Where Is My Money Go',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bank Statement Analyzer – Find Hidden Subscriptions',
    description: 'Free tool to analyze your bank statement and find hidden subscriptions & fees.',
  },
}

const discoveries = [
  'Hidden subscriptions you forgot about',
  'Monthly spending leaks draining your account',
  'Unexpected bank fees and charges',
  'Estimated yearly savings potential',
  'Simple recovery steps to save money',
]

const faqs = [
  { q: 'Is this bank statement analyzer free?', a: 'Yes — it\'s completely free to use with no signup.' },
  { q: 'Do you store my bank data?', a: 'No. Your statement is processed in memory and never saved.' },
  { q: 'What file formats are supported?', a: 'CSV and PDF bank statements.' },
  { q: 'Is this financial advice?', a: 'No. This tool provides informational insights only.' },
]

export default function BankStatementAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions
        </h1>

        <p className="text-muted-foreground">
          A bank statement analyzer is a tool that scans your transaction history to uncover
          where your money is actually going. Instead of manually scrolling through hundreds
          of transactions, our analyzer automatically identifies patterns, recurring charges,
          and spending habits you may have overlooked.
        </p>

        <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          Most people discover hundreds of dollars per year in forgotten subscriptions and small recurring charges.
        </p>

        <p className="text-muted-foreground">
          Many people unknowingly pay for subscriptions they forgot about, get hit with
          unexpected bank fees, or have small recurring charges that add up over time.
          These &ldquo;spending leaks&rdquo; can cost you hundreds or even thousands of dollars per year
          without you realizing it.
        </p>

        <p className="text-muted-foreground">
          Our bank statement analyzer is completely free and privacy-first. Your data is
          processed in memory and never stored on our servers. Simply upload your CSV or PDF
          bank statement and get instant insights into your spending.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What You&apos;ll Discover</h2>
          <ul className="space-y-2">
            {discoveries.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col items-center gap-3 text-center">
          <Button asChild size="lg">
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              Analyze My Bank Statement
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Or <Link href="/" className="text-primary hover:underline">return to the main analyzer</Link>
          </p>
        </div>

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

        <p className="text-center text-xs text-muted-foreground">
          Privacy-first: your data is processed in memory and never stored.
          This tool is for informational purposes only.
        </p>
      </article>

      <footer className="mt-8 border-t pt-4">
        <Link href="/" className="text-sm text-primary hover:underline">&larr; Back to Home</Link>
      </footer>
    </main>
  )
}
