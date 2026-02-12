import type { Metadata } from 'next'
import Link from 'next/link'
import ExampleResults from '@/components/ExampleResults'

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
    <main className="container example-page">
      <div className="example-content">
        <h1>Example Analysis Report</h1>
        <p className="example-intro">
          Here&apos;s what a typical Leaky Wallet report looks like. This is based on anonymized
          data to show you what insights you can expect from your own analysis.
        </p>

        <div className="demo-banner" style={{ marginBottom: '1.5rem' }}>
          <span>Example report &mdash; these results are from a fictional dataset, not real transactions.</span>
        </div>

        <ExampleResults />

        <p className="results-disclaimer">
          For informational purposes only. Not financial advice.
        </p>

        {/* CTA */}
        <section className="example-cta-section">
          <h2>Get Your Own Report</h2>
          <p>Upload your bank statement and see your personalized insights in seconds.</p>
          <Link href="/" className="btn btn-primary btn-lg">
            Analyze My Statement
          </Link>
          <p className="example-cta-note">Free, private, no signup required</p>
        </section>
      </div>
    </main>
  )
}
