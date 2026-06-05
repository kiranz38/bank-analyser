import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Free Financial Health Check – Score Your Spending & Find Money Leaks',
  description: 'Free financial health check. Upload your bank statement to get a personal financial health score, spending analysis, hidden subscription audit, and a savings action plan. Takes 30 seconds.',
  alternates: { canonical: 'https://whereismymoneygo.com/financial-health-check' },
  openGraph: {
    title: 'Free Financial Health Check – See Your Financial Score in 30 Seconds',
    description: 'Upload your bank statement for a complete financial health check: spending score, hidden subscriptions, bank fees, and a personalised savings plan.',
    type: 'website', url: 'https://whereismymoneygo.com/financial-health-check', siteName: 'Leaky Wallet',
  },
}

const healthSignals = [
  { signal: 'Subscription-to-income ratio', healthy: 'Under 5% of take-home pay', warning: 'Most people with 5+ subscriptions exceed this' },
  { signal: 'Bank fee burden', healthy: 'Under $10/month total fees', warning: 'Average bank customer pays $12–$35/month' },
  { signal: 'Spending category balance', healthy: 'No single discretionary category over 20%', warning: 'Dining and entertainment often spike unnoticed' },
  { signal: 'Recurring charge awareness', healthy: 'Can name every subscription and its cost', warning: 'Most people undercount their subscriptions by 3–5' },
  { signal: 'Month-over-month stability', healthy: 'Spending within 10% of previous month', warning: 'Lifestyle creep pushes spending up 3–5% every quarter' },
]

const faqs = [
  { q: 'What is a financial health check?', a: 'A financial health check gives you an honest picture of your current financial habits — specifically where your money goes, whether you\'re carrying unnecessary costs, and what your realistic savings potential is. Leaky Wallet does this automatically from your bank statement.' },
  { q: 'How does Leaky Wallet score my financial health?', a: 'The Pro report includes a Financial Health Score (0–100) based on: subscription load vs income, bank fee burden, spending category balance, month-over-month stability, and percentage of income going to avoidable charges.' },
  { q: 'What\'s a good financial health score?', a: '70+ is good — it means you have manageable recurring costs and few avoidable leaks. 50–70 means there are clear improvements available. Below 50 typically means significant subscription bloat, high bank fees, or spending patterns that are limiting your savings capacity.' },
  { q: 'How often should I do a financial health check?', a: 'Quarterly is ideal. Upload your previous quarter\'s bank statement each time. The changes between quarters reveal whether your financial habits are improving or drifting.' },
  { q: 'Does a financial health check include my savings rate?', a: 'The analysis covers your spending side — where money goes and what\'s recoverable. For a complete picture including savings rate, you\'d combine this analysis with your savings account deposits. The Pro report includes a recommended savings target based on your spending patterns.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function FinancialHealthCheckPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Financial Health Check — Get Your Score in 30 Seconds
        </h1>

        <p className="text-lg text-muted-foreground">
          A financial health check isn&apos;t about your credit score — it&apos;s about understanding your
          spending habits, identifying what&apos;s draining your account unnecessarily, and knowing your
          realistic savings potential. Upload your bank statement and get an honest picture instantly.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Check Your Financial Health Now</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — instant analysis, completely free</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Check My Financial Health</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Any bank</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Signs of a Financially Healthy Spending Pattern</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-semibold">Health Signal</th>
                  <th className="text-left py-2 pr-4 font-semibold text-emerald-600 dark:text-emerald-400">Healthy</th>
                  <th className="text-left py-2 font-semibold text-muted-foreground">Common Reality</th>
                </tr>
              </thead>
              <tbody>
                {healthSignals.map(({ signal, healthy, warning }) => (
                  <tr key={signal} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{signal}</td>
                    <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400">{healthy}</td>
                    <td className="py-2.5 text-muted-foreground">{warning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What the Analysis Includes</h2>
          <ul className="space-y-2 text-sm">
            {[
              'Complete spending breakdown by category',
              'Every subscription and recurring charge — monthly and annual cost',
              'Bank fee total and which fees are avoidable',
              'Month-over-month spending trends',
              'Financial Health Score (0–100) in the Pro report',
              'Personalised 12-week savings action plan in the Pro report',
            ].map(item => (
              <li key={item} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span className="text-muted-foreground">{item}</span></li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/personal-finance-tracker" className="text-primary hover:underline">Personal Finance Tracker</Link>
          <Link href="/money-management" className="text-primary hover:underline">Money Management</Link>
          <Link href="/budget-calculator" className="text-primary hover:underline">Budget Calculator</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/bank-fee-checker" className="text-primary hover:underline">Bank Fee Checker</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/financial-health-check" />

    </main>
  )
}
