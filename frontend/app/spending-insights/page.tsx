import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Spending Insights – Deep Analysis of Your Bank Statement Spending Patterns',
  description: 'Get deep spending insights from your bank statement. Upload your CSV or PDF to see category trends, merchant patterns, month-over-month changes, and AI-powered recommendations to improve your financial health.',
  alternates: { canonical: 'https://whereismymoneygo.com/spending-insights' },
  openGraph: {
    title: 'Free Spending Insights – Upload Your Bank Statement for Deep Analysis',
    description: 'Upload your bank statement for deep spending insights — category trends, merchant analysis, and AI recommendations to improve your finances.',
    type: 'website',
    url: 'https://whereismymoneygo.com/spending-insights',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What spending insights can I get from my bank statement?', acceptedAnswer: { '@type': 'Answer', text: 'Leaky Wallet surfaces: spending by category with month-over-month trends, top merchants by total spend, all subscription and recurring charges with price changes flagged, financial health score against benchmarks, and a personalized savings action plan.' } },
                { '@type': 'Question', name: 'How do I analyze my spending habits?', acceptedAnswer: { '@type': 'Answer', text: "Upload your bank statement (CSV or PDF) to Leaky Wallet. The AI analyzes every transaction across your date range and surfaces patterns — including habits you didn't know you had, like how often you use delivery apps or how much dining spending has grown." } },
                { '@type': 'Question', name: 'What is a financial health score?', acceptedAnswer: { '@type': 'Answer', text: 'A financial health score rates your spending patterns against recommended benchmarks: what percentage of income goes to needs vs wants vs savings, whether subscription spending is in a healthy range, and whether your month-over-month spending is stable or growing.' } },
                { '@type': 'Question', name: 'How often should I review my spending insights?', acceptedAnswer: { '@type': 'Answer', text: "Monthly is ideal — upload each month's statement to track category trends. Quarterly is the minimum for catching subscription creep and price increases. Annual reviews reveal lifestyle inflation patterns that are hard to spot month-to-month." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Spending Insights — Deep Analysis of Where Your Money Goes
        </h1>

        <p className="text-lg text-muted-foreground">
          Surface-level spending summaries tell you what you spent. Spending insights tell you why — which categories are growing, which merchants are your biggest expenses, where habits have changed, and what your spending patterns predict about your financial health.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet goes beyond basic categorization to surface patterns in your bank statement that would take hours to find manually: subscription creep, dining frequency changes, month-over-month category shifts, and specific merchants driving most of your spending.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Get Your Spending Insights</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement for a deep analysis of your spending patterns.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Get My Spending Insights
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Insights Available From Your Bank Statement</h2>
          <ul className="space-y-3">
            <li key='Category trends over time' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Category trends over time</p>
              <p className="text-xs text-muted-foreground pl-6">Which spending categories grew or shrank each month — and by how much</p>
            </li>
            <li key='Top merchants by spend' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Top merchants by spend</p>
              <p className="text-xs text-muted-foreground pl-6">The 10 merchants getting most of your money — often surprising</p>
            </li>
            <li key='Subscription creep detection' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscription creep detection</p>
              <p className="text-xs text-muted-foreground pl-6">New subscriptions that appeared since your last analysis</p>
            </li>
            <li key='Price change alerts' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Price change alerts</p>
              <p className="text-xs text-muted-foreground pl-6">Services that increased their charge without sending a notification</p>
            </li>
            <li key='Spending velocity' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Spending velocity</p>
              <p className="text-xs text-muted-foreground pl-6">How quickly different categories deplete your monthly budget</p>
            </li>
            <li key='Financial health score' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Financial health score</p>
              <p className="text-xs text-muted-foreground pl-6">How your spending ratios compare to recommended benchmarks</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Get Spending Insights</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your bank statement.</strong> For the best insights, download 90+ days of transactions from your bank's website as CSV or PDF.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload to the analyzer.</strong> The AI processes every transaction and surfaces patterns across your full date range.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Review your insights dashboard.</strong> See category trends, top merchants, subscription changes, and your financial health score.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Act on the recommendations.</strong> The AI generates specific actions: subscriptions to cancel, categories to reduce, and projected savings from each.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What spending insights can I get from my bank statement?', a: 'Leaky Wallet surfaces: spending by category with month-over-month trends, top merchants by total spend, all subscription and recurring charges with price changes flagged, financial health score against benchmarks, and a personalized savings action plan.' },
          { q: 'How do I analyze my spending habits?', a: "Upload your bank statement (CSV or PDF) to Leaky Wallet. The AI analyzes every transaction across your date range and surfaces patterns — including habits you didn't know you had, like how often you use delivery apps or how much dining spending has grown." },
          { q: 'What is a financial health score?', a: 'A financial health score rates your spending patterns against recommended benchmarks: what percentage of income goes to needs vs wants vs savings, whether subscription spending is in a healthy range, and whether your month-over-month spending is stable or growing.' },
          { q: 'How often should I review my spending insights?', a: "Monthly is ideal — upload each month's statement to track category trends. Quarterly is the minimum for catching subscription creep and price increases. Annual reviews reveal lifestyle inflation patterns that are hard to spot month-to-month." },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/financial-health-check" className="text-primary hover:underline">Financial Health Check</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/spending-insights' />
    </main>
  )
}
