import type { Metadata } from 'next'
import Link from 'next/link'
import ExampleResults from '@/components/ExampleResults'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Example Report – See What Leaky Wallet Finds',
  description: 'Preview an anonymized sample report from Leaky Wallet. See how we detect subscriptions, categorize spending, and identify money leaks.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/example',
  },
  openGraph: {
    title: 'Example Report – Leaky Wallet',
    description: 'See a sample analysis report showing detected subscriptions and spending insights.',
    type: 'website',
    url: 'https://whereismymoneygo.com/example',
  },
}

export default function ExamplePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Example Analysis Report</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Here&apos;s what a typical Leaky Wallet report looks like. This is based on anonymized
            data to show you what insights you can expect from your own analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
          <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">Example</Badge>
          <span className="text-sm text-amber-700 dark:text-amber-400">
            These results are from a fictional dataset, not real transactions.
          </span>
        </div>

        <ExampleResults />

        <p className="text-center text-xs text-muted-foreground">
          For informational purposes only. Not financial advice.
        </p>

        {/* CTA */}
        <section className="space-y-3 text-center">
          <h2 className="text-xl font-semibold">Get Your Own Report</h2>
          <p className="text-muted-foreground">Upload your bank statement and see your personalized insights in seconds.</p>
          <Button asChild size="lg">
            <Link href="/">Analyze My Statement</Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free, private, no signup required</p>
        </section>
      </div>
    </main>
  )
}
