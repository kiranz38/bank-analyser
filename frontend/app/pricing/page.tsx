import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Heart, Coffee } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing – Free Analysis + $1.99 Pro Report | Leaky Wallet',
  description: 'Leaky Wallet is free to use. Upload your bank statement and get instant insights. Upgrade to a Pro Report for $1.99 — a detailed PDF with health scores, savings projections, and action plans.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/pricing',
  },
  openGraph: {
    title: 'Pricing – Free Analysis + Pro Report | Leaky Wallet',
    description: 'Free bank statement analysis with optional $1.99 Pro Report — detailed PDF with health scores, savings projections, and personalized action plans.',
    type: 'website',
    url: 'https://whereismymoneygo.com/pricing',
  },
}

const freeFeatures = [
  'Unlimited statement uploads',
  'Full subscription detection',
  'Spending category breakdown',
  'Month-over-month comparison',
  'CSV and PDF support',
  'No account required',
  'Privacy-first (no data stored)',
]

const proFeatures = [
  'Everything in Free',
  'Financial health score (0–100)',
  '12-month savings projection',
  'Prioritized action plan',
  'Category deep dives with trends',
  'Downloadable PDF report',
  'Report delivered to your email',
  'Secure payment via Stripe',
]

const faqs = [
  {
    q: 'What do I get with the free version?',
    a: 'Full spending analysis, subscription detection, category breakdowns, month-over-month trends, and a personalized savings plan — all completely free, no account required.',
  },
  {
    q: "What's included in the Pro Report?",
    a: "A detailed PDF report with your financial health score, 12-month savings projection, prioritized action plan, category deep dives with spending trends, and an executive summary. It's delivered to your email and available for instant download.",
  },
  {
    q: 'Is the Pro Report a subscription?',
    a: "No. It's a one-time payment of $1.99 per report. No recurring charges, no auto-renewals. You pay once and get your report.",
  },
  {
    q: 'Is my data really not stored?',
    a: 'Correct. Your bank statement is processed in server memory and discarded immediately after generating your report. We have no database of user financial data.',
  },
  {
    q: 'How is payment handled?',
    a: "Payments are processed securely through Stripe. We never see or store your card details. If PDF generation fails after payment, you're automatically refunded.",
  },
  {
    q: 'What about the Bank Connect feature?',
    a: 'Bank Connect (automatic Plaid integration) is coming soon for US and UK users. This feature will also be free during the beta period.',
  },
]

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Analyze your bank statements for free. Want the full picture? Get a Pro Report for just $1.99.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">Free Forever</Badge>
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/ forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link href="/">Start Analyzing Free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/50 shadow-lg">
            <CardHeader>
              <Badge className="w-fit">Pro Report</Badge>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-primary">$1.99</span>
                <span className="text-muted-foreground">/ one-time</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link href="/">Get Pro Report — $1.99</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Why free */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why is Leaky Wallet Free?</h2>
          <p className="text-muted-foreground">
            I built Leaky Wallet because I was frustrated with how hard it is to understand
            where money goes each month. Subscription services, small recurring fees, and
            forgotten memberships add up quickly.
          </p>
          <p className="text-muted-foreground">
            The core analysis will always be free and accessible to everyone. The Pro Report
            is an optional upgrade for those who want a deeper, professional-grade breakdown
            — and it helps cover hosting costs to keep the free tier running.
          </p>
        </section>

        {/* Support */}
        <Card className="text-center">
          <CardContent className="flex flex-col items-center space-y-3 pt-6">
            <Heart className="h-8 w-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Support the Project</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              If Leaky Wallet helped you find savings, consider buying me a coffee.
              Your support helps cover hosting costs and keeps this tool free for everyone.
            </p>
            <Button variant="outline" asChild>
              <a href="https://buymeacoffee.com/joh38" target="_blank" rel="noopener noreferrer">
                <Coffee className="mr-2 h-4 w-4" />
                Buy Me a Coffee
              </a>
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">
                  {faq.a}{' '}
                  {faq.q.includes('Bank Connect') && (
                    <Link href="/banks" className="text-primary hover:underline">Learn more about Bank Connect</Link>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
