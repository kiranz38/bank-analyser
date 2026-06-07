import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Household Budget Tracker – Analyze Your Combined Household Spending',
  description: 'Free household budget tracker. Upload bank statements from multiple accounts to see your combined household spending — shared subscriptions, household bills, and family spending by category.',
  alternates: { canonical: 'https://whereismymoneygo.com/household-budget' },
  openGraph: {
    title: 'Free Household Budget Tracker – Upload Your Household Bank Statements',
    description: 'Upload multiple bank statements to track your household budget — shared bills, subscriptions, and spending by category. Free, instant, private.',
    type: 'website',
    url: 'https://whereismymoneygo.com/household-budget',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I track household expenses?', acceptedAnswer: { '@type': 'Answer', text: 'Export bank statements from all household accounts (joint account, individual accounts, credit cards) and upload them together to Leaky Wallet — it accepts up to 12 files and merges them into a single household spending report.' } },
                { '@type': 'Question', name: 'How do I budget for a household?', acceptedAnswer: { '@type': 'Answer', text: 'Start by seeing total household spending across all accounts. Upload your combined statements to see the full picture — shared bills, subscriptions, groceries, and discretionary spending — before setting category targets.' } },
                { '@type': 'Question', name: 'How do I find duplicate subscriptions in my household?', acceptedAnswer: { '@type': 'Answer', text: 'Upload statements from multiple household members together. The analyzer groups subscriptions by merchant and will show the same service appearing in multiple accounts — indicating duplicate subscriptions you could consolidate.' } },
                { '@type': 'Question', name: 'What is a good household budget breakdown?', acceptedAnswer: { '@type': 'Answer', text: 'A common guideline: 30–35% on housing (rent/mortgage + utilities), 10–15% on food, 15–20% on transport, 10–15% on savings, and 20–25% on everything else (subscriptions, entertainment, clothing, personal). Upload your statements to see how your household compares.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Household Budget Tracker — See All Household Spending at Once
        </h1>

        <p className="text-lg text-muted-foreground">
          Household budgeting is complicated because spending is spread across multiple accounts: a joint account for bills, individual accounts for personal spending, and credit cards for different family members. Getting a complete picture requires looking at all of them together.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet accepts up to 12 files at once — upload statements from multiple accounts and get a merged household spending breakdown. See shared subscriptions that may be duplicated, household bills, and where combined spending is going.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your Household Spending</h2>
          <p className="text-sm text-muted-foreground">Upload all your household statements together — merged spending report in 30 seconds.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Track Household Budget
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What Household Budget Analysis Finds</h2>
          <ul className="space-y-3">
            <li key='Duplicate subscriptions across accounts' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Duplicate subscriptions across accounts</p>
              <p className="text-xs text-muted-foreground pl-6">Two Netflix accounts, two Spotify plans — common in households where each person pays separately</p>
            </li>
            <li key='Shared bills and utilities' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Shared bills and utilities</p>
              <p className="text-xs text-muted-foreground pl-6">Electricity, gas, internet — consolidated view of all household fixed costs</p>
            </li>
            <li key='Combined grocery and dining spending' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Combined grocery and dining spending</p>
              <p className="text-xs text-muted-foreground pl-6">Total household food spend across all accounts and payment methods</p>
            </li>
            <li key='Subscription overlap' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscription overlap</p>
              <p className="text-xs text-muted-foreground pl-6">Services one person uses that overlap with what another person is paying for</p>
            </li>
            <li key='Household spending trends' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Household spending trends</p>
              <p className="text-xs text-muted-foreground pl-6">Month-over-month changes in combined household spending</p>
            </li>
            <li key='Individual vs shared spending' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Individual vs shared spending</p>
              <p className="text-xs text-muted-foreground pl-6">Upload separately to compare each person's contribution</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Track Household Spending</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export statements from all accounts.</strong> Download the last 90 days from your joint account, individual accounts, and credit cards.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload all files together.</strong> Leaky Wallet accepts up to 12 files at once and merges them into a single household spending report.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Review the combined picture.</strong> See all household spending by category, with subscriptions and recurring charges identified across all accounts.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Find the household leaks.</strong> Duplicate subscriptions, unused memberships, and avoidable fees across all accounts.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I track household expenses?', a: 'Export bank statements from all household accounts (joint account, individual accounts, credit cards) and upload them together to Leaky Wallet — it accepts up to 12 files and merges them into a single household spending report.' },
          { q: 'How do I budget for a household?', a: 'Start by seeing total household spending across all accounts. Upload your combined statements to see the full picture — shared bills, subscriptions, groceries, and discretionary spending — before setting category targets.' },
          { q: 'How do I find duplicate subscriptions in my household?', a: 'Upload statements from multiple household members together. The analyzer groups subscriptions by merchant and will show the same service appearing in multiple accounts — indicating duplicate subscriptions you could consolidate.' },
          { q: 'What is a good household budget breakdown?', a: 'A common guideline: 30–35% on housing (rent/mortgage + utilities), 10–15% on food, 15–20% on transport, 10–15% on savings, and 20–25% on everything else (subscriptions, entertainment, clothing, personal). Upload your statements to see how your household compares.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/budget-planner" className="text-primary hover:underline">Budget Planner</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/household-budget' />
    </main>
  )
}
