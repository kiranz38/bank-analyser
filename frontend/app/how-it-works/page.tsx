import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Clock, Upload, Search, FileText, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works – Leaky Wallet Bank Statement Analyzer',
  description: 'Learn how Leaky Wallet analyzes your bank statements to find hidden subscriptions, spending leaks, and savings opportunities. Privacy-first, no data stored.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/how-it-works',
  },
  openGraph: {
    title: 'How It Works – Leaky Wallet',
    description: 'Understand how our free bank statement analyzer finds your hidden spending leaks.',
    type: 'website',
    url: 'https://whereismymoneygo.com/how-it-works',
  },
}

const steps = [
  {
    number: '1',
    icon: Upload,
    title: 'Upload Your Statement',
    description: "Export a CSV or PDF bank statement from your bank's website or app. Most banks let you download statements from the last 30-90 days.",
    note: 'Your file is processed in memory only - never stored on our servers.',
  },
  {
    number: '2',
    icon: Search,
    title: 'Instant Analysis',
    description: 'Our analyzer scans every transaction, looking for:',
    list: [
      'Recurring subscriptions (Netflix, Spotify, gym memberships)',
      'Bank fees and charges',
      'Spending categories and patterns',
      'Month-over-month changes',
      'Your biggest transactions',
    ],
  },
  {
    number: '3',
    icon: FileText,
    title: 'Get Your Report',
    description: "Within seconds, you'll see a complete breakdown including:",
    list: [
      'Monthly "leak" amount - money slipping away unnoticed',
      'Potential annual savings if you fix the leaks',
      'All detected subscriptions with confidence levels',
      'Spending by category with visual breakdowns',
      'Actionable "Easy Wins" to save money',
    ],
  },
  {
    number: '4',
    icon: Target,
    title: 'Take Action',
    description: 'Use your personalized recovery plan to:',
    list: [
      'Cancel forgotten subscriptions',
      'Negotiate or eliminate bank fees',
      'Set spending limits for problem categories',
      'Track your progress over time',
    ],
  },
]

const bankRegions = [
  { name: 'Australia', banks: ['ANZ', 'Commonwealth Bank', 'Westpac', 'NAB', 'ING', 'Macquarie'] },
  { name: 'United States', banks: ['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One', 'US Bank'] },
  { name: 'United Kingdom', banks: ['Barclays', 'HSBC', 'Lloyds', 'NatWest', 'Santander UK', 'Monzo'] },
  { name: 'Other', banks: ['Any CSV with date, description, amount', 'Standard PDF statements', 'Multi-currency support'] },
]

const privacyFeatures = [
  { icon: Shield, title: 'No Data Storage', description: 'Your bank statement is processed in memory and immediately discarded. We never save your financial data.' },
  { icon: Lock, title: 'No Account Required', description: 'No signup, no email, no tracking. Just upload and get your results instantly.' },
  { icon: Clock, title: 'Session-Only Processing', description: 'When you close your browser tab, all data from your analysis is gone forever.' },
]

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How Leaky Wallet Works</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Leaky Wallet analyzes your bank statement to find hidden subscriptions,
            unnecessary fees, and spending patterns you might have missed. Here&apos;s exactly how it works.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 sm:grid-cols-2">
          {steps.map((step) => (
            <Card key={step.number}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.number}
                  </span>
                  <h2 className="text-lg font-semibold">{step.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.list && (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {step.list.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {step.note && (
                  <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    {step.note}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Supported banks */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Supported Banks & Formats</h2>
          <p className="text-muted-foreground">
            Leaky Wallet works with CSV and PDF statements from most major banks worldwide, including:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bankRegions.map((region) => (
              <Card key={region.name}>
                <CardContent className="pt-4">
                  <h3 className="mb-2 font-semibold">{region.name}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {region.banks.map((bank) => (
                      <li key={bank}>{bank}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Your Privacy Matters</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {privacyFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="space-y-2 pt-6 text-center">
                  <feature.icon className="mx-auto h-6 w-6 text-primary" />
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="space-y-3 text-center">
          <h2 className="text-xl font-semibold">Ready to Find Your Money Leaks?</h2>
          <p className="text-muted-foreground">Most people discover $200-$600/month in hidden spending.</p>
          <Button asChild size="lg">
            <Link href="/">Analyze My Statement</Link>
          </Button>
        </section>
      </div>
    </main>
  )
}
