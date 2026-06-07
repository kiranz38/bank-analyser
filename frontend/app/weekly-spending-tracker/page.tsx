import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Weekly Spending Tracker – Track Weekly Spending From Your Bank Statement',
  description: 'Track your weekly spending from your bank statement. Upload your CSV or PDF to see spending by week, identify patterns, and find which days and weeks you overspend. Free, instant, no signup.',
  alternates: { canonical: 'https://whereismymoneygo.com/weekly-spending-tracker' },
  openGraph: {
    title: 'Free Weekly Spending Tracker – See Your Weekly Spending Patterns',
    description: 'Upload your bank statement to track weekly spending patterns — see which weeks you overspend and why. Free, instant.',
    type: 'website',
    url: 'https://whereismymoneygo.com/weekly-spending-tracker',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I track weekly spending?', acceptedAnswer: { '@type': 'Answer', text: 'Export your bank statement as CSV or PDF and upload it to Leaky Wallet. The analyzer shows your spending week by week, broken down by category, so you can see which weeks and which categories are consistently over or under budget.' } },
                { '@type': 'Question', name: 'How much should I spend per week?', acceptedAnswer: { '@type': 'Answer', text: 'Divide your monthly budget by 4.3 (average weeks per month) to get a weekly target. For variable categories like dining and entertainment, a per-week limit is more effective than a monthly limit because you can course-correct mid-month.' } },
                { '@type': 'Question', name: 'What is a normal weekly spending amount?', acceptedAnswer: { '@type': 'Answer', text: 'This varies significantly by location, lifestyle, and income. More useful is comparing your weekly spending against your own weekly average — the analyzer shows weeks that are significantly above or below your normal, which is more actionable than a generic benchmark.' } },
                { '@type': 'Question', name: 'How do I stop overspending each week?', acceptedAnswer: { '@type': 'Answer', text: "First, identify which specific category drives your overspend weeks. Upload your bank statement to see your week-by-week breakdown. The pattern is usually one category (dining, shopping, or Uber) that spikes in the same weeks — that's the one to set a weekly limit on." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Weekly Spending Tracker — See Your Week-by-Week Patterns
        </h1>

        <p className="text-lg text-muted-foreground">
          Monthly budgets hide week-to-week patterns that drive overspending. A $3,000 monthly budget might look fine until you see that week 3 alone consumed $1,800 — driven by a combination of dining out, impulse shopping, and one large annual charge.
        </p>

        <p className="text-muted-foreground">
          Upload your bank statement and see your spending week by week. The patterns that emerge — which days you spend most, which weeks are consistently over budget — are the key to understanding and changing spending behavior.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Track Your Weekly Spending</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and see your week-by-week spending patterns.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Track My Weekly Spending
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What Weekly Tracking Reveals</h2>
          <ul className="space-y-3">
            <li key='Day-of-week spending patterns' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Day-of-week spending patterns</p>
              <p className="text-xs text-muted-foreground pl-6">Friday and Saturday spending is often 3–4x the weekly average for dining and entertainment</p>
            </li>
            <li key='Weeks with unusual spikes' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Weeks with unusual spikes</p>
              <p className="text-xs text-muted-foreground pl-6">Annual renewals, events, and large purchases visible in context of normal weeks</p>
            </li>
            <li key='Recurring weekly charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Recurring weekly charges</p>
              <p className="text-xs text-muted-foreground pl-6">Weekly delivery orders, subscriptions that charge weekly, and recurring services</p>
            </li>
            <li key='Grocery vs dining balance' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Grocery vs dining balance</p>
              <p className="text-xs text-muted-foreground pl-6">Whether your food budget shifts from grocery to dining during busy weeks</p>
            </li>
            <li key='Transport patterns' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Transport patterns</p>
              <p className="text-xs text-muted-foreground pl-6">Commuting costs, Uber/Lyft usage, and weekly fuel spending</p>
            </li>
            <li key='Budget position by week' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Budget position by week</p>
              <p className="text-xs text-muted-foreground pl-6">Whether you're ahead or behind your monthly budget target week by week</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Track Your Weekly Spending</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your bank statement.</strong> Download at least 60 days to see multiple weekly patterns — available as CSV or PDF from your bank's website.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload for weekly analysis.</strong> The analyzer breaks down your spending by week, day, and category.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Identify your problem weeks.</strong> Look for the weeks that are consistently over budget and identify the specific categories driving it.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Set weekly limits for volatile categories.</strong> Dining and entertainment are the most week-to-week variable — set a per-week limit that adds up to your monthly target.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I track weekly spending?', a: 'Export your bank statement as CSV or PDF and upload it to Leaky Wallet. The analyzer shows your spending week by week, broken down by category, so you can see which weeks and which categories are consistently over or under budget.' },
          { q: 'How much should I spend per week?', a: 'Divide your monthly budget by 4.3 (average weeks per month) to get a weekly target. For variable categories like dining and entertainment, a per-week limit is more effective than a monthly limit because you can course-correct mid-month.' },
          { q: 'What is a normal weekly spending amount?', a: 'This varies significantly by location, lifestyle, and income. More useful is comparing your weekly spending against your own weekly average — the analyzer shows weeks that are significantly above or below your normal, which is more actionable than a generic benchmark.' },
          { q: 'How do I stop overspending each week?', a: "First, identify which specific category drives your overspend weeks. Upload your bank statement to see your week-by-week breakdown. The pattern is usually one category (dining, shopping, or Uber) that spikes in the same weeks — that's the one to set a weekly limit on." },
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
          <Link href="/monthly-expense-tracker" className="text-primary hover:underline">Monthly Expense Tracker</Link>
          <Link href="/budget-planner" className="text-primary hover:underline">Budget Planner</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/weekly-spending-tracker' />
    </main>
  )
}
