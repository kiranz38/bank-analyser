import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'YNAB Alternative – Free Spending Analysis Without the Monthly Fee',
  description: 'A free YNAB alternative. Upload your bank statement to find spending leaks, subscriptions, and savings opportunities — no YNAB subscription required, no manual budget entry, instant results.',
  alternates: { canonical: 'https://whereismymoneygo.com/ynab-alternative' },
  openGraph: {
    title: 'Free YNAB Alternative – Instant Bank Statement Analysis, No Subscription',
    description: 'Free alternative to YNAB. Upload your bank statement for instant spending analysis and savings recommendations — no monthly fee, no manual entry.',
    type: 'website',
    url: 'https://whereismymoneygo.com/ynab-alternative',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is Leaky Wallet really free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — the full spending analysis is completely free with no account required. An optional Pro Report PDF is available for a one-time $1.99. There is no monthly subscription.' } },
                { '@type': 'Question', name: 'How is Leaky Wallet different from YNAB?', acceptedAnswer: { '@type': 'Answer', text: 'YNAB is a full budgeting system with ongoing manual entry, bank sync, and goal tracking. Leaky Wallet is a one-time upload analyzer — upload your statement and get insights instantly, without ongoing commitment or manual entry. They serve different use cases.' } },
                { '@type': 'Question', name: 'Can Leaky Wallet replace YNAB for budgeting?', acceptedAnswer: { '@type': 'Answer', text: 'For spending analysis and subscription auditing, yes. For active ongoing budget management with envelope tracking and goal setting, YNAB has more features. Many people use Leaky Wallet quarterly for spending audits and a separate tool for daily budget tracking.' } },
                { '@type': 'Question', name: 'Do I need to create an account to use Leaky Wallet?', acceptedAnswer: { '@type': 'Answer', text: 'No account required. Upload your bank statement, get your analysis, and your data is deleted. No email, no password, no subscription.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          A Free YNAB Alternative — No Monthly Fee, No Manual Entry
        </h1>

        <p className="text-lg text-muted-foreground">
          YNAB (You Need A Budget) is a powerful tool, but it costs $14.99/month and requires significant manual setup and ongoing entry. If you want spending insights without the commitment, a bank statement analyzer gives you the key outputs — category breakdown, subscription detection, savings plan — in 30 seconds with no ongoing cost.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet is not a budgeting replacement for YNAB — it's complementary: use Leaky Wallet to audit your spending and find the leaks, then apply that data to any budgeting approach you prefer.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Try the Free Alternative</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement for instant spending insights — no monthly fee, no manual entry.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Analyze My Spending Free
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What You Get Without Paying for YNAB</h2>
          <ul className="space-y-3">
            <li key='Complete spending breakdown by category' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Complete spending breakdown by category</p>
              <p className="text-xs text-muted-foreground pl-6">Every transaction categorized — groceries, dining, transport, subscriptions, and more</p>
            </li>
            <li key='Full subscription audit' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Full subscription audit</p>
              <p className="text-xs text-muted-foreground pl-6">Every recurring charge surfaced with merchant name and yearly cost</p>
            </li>
            <li key='Month-over-month trends' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Month-over-month trends</p>
              <p className="text-xs text-muted-foreground pl-6">Which categories grew or shrank between months</p>
            </li>
            <li key='Personalized savings plan' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Personalized savings plan</p>
              <p className="text-xs text-muted-foreground pl-6">Specific actions to cut spending — not generic tips</p>
            </li>
            <li key='Financial health score' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Financial health score</p>
              <p className="text-xs text-muted-foreground pl-6">How your spending ratios compare to recommended benchmarks</p>
            </li>
            <li key='No manual category entry' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />No manual category entry</p>
              <p className="text-xs text-muted-foreground pl-6">Everything is automatic — upload the file and results appear</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Use Leaky Wallet Instead of YNAB</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your bank statement.</strong> Download your last 90 days as CSV or PDF from your bank's website.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload for instant analysis.</strong> Every transaction is categorized automatically — no manual input required.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Review your spending insights.</strong> See subscriptions, category totals, trends, and savings opportunities.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Apply the insights to your preferred budget.</strong> Use the data to inform any budgeting approach — spreadsheet, envelope method, or YNAB itself.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is Leaky Wallet really free?', a: 'Yes — the full spending analysis is completely free with no account required. An optional Pro Report PDF is available for a one-time $1.99. There is no monthly subscription.' },
          { q: 'How is Leaky Wallet different from YNAB?', a: 'YNAB is a full budgeting system with ongoing manual entry, bank sync, and goal tracking. Leaky Wallet is a one-time upload analyzer — upload your statement and get insights instantly, without ongoing commitment or manual entry. They serve different use cases.' },
          { q: 'Can Leaky Wallet replace YNAB for budgeting?', a: 'For spending analysis and subscription auditing, yes. For active ongoing budget management with envelope tracking and goal setting, YNAB has more features. Many people use Leaky Wallet quarterly for spending audits and a separate tool for daily budget tracking.' },
          { q: 'Do I need to create an account to use Leaky Wallet?', a: 'No account required. Upload your bank statement, get your analysis, and your data is deleted. No email, no password, no subscription.' },
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
          <Link href="/budget-planner" className="text-primary hover:underline">Budget Planner</Link>
          <Link href="/mint-alternative" className="text-primary hover:underline">Mint Alternative</Link>
          <Link href="/how-to-budget" className="text-primary hover:underline">How to Budget</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/ynab-alternative' />
    </main>
  )
}
