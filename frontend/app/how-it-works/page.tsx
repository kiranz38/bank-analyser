import type { Metadata } from 'next'
import Link from 'next/link'

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

export default function HowItWorksPage() {
  return (
    <main className="container how-it-works-page">
      <div className="how-it-works-content">
        <h1>How Leaky Wallet Works</h1>
        <p className="how-it-works-intro">
          Leaky Wallet analyzes your bank statement to find hidden subscriptions,
          unnecessary fees, and spending patterns you might have missed. Here's exactly how it works.
        </p>

        {/* Step by step */}
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h2>Upload Your Statement</h2>
            <p>
              Export a CSV or PDF bank statement from your bank's website or app.
              Most banks let you download statements from the last 30-90 days.
            </p>
            <div className="step-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Your file is processed in memory only - never stored on our servers.
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h2>Instant Analysis</h2>
            <p>
              Our analyzer scans every transaction, looking for:
            </p>
            <ul>
              <li>Recurring subscriptions (Netflix, Spotify, gym memberships)</li>
              <li>Bank fees and charges</li>
              <li>Spending categories and patterns</li>
              <li>Month-over-month changes</li>
              <li>Your biggest transactions</li>
            </ul>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h2>Get Your Report</h2>
            <p>
              Within seconds, you'll see a complete breakdown including:
            </p>
            <ul>
              <li>Monthly "leak" amount - money slipping away unnoticed</li>
              <li>Potential annual savings if you fix the leaks</li>
              <li>All detected subscriptions with confidence levels</li>
              <li>Spending by category with visual breakdowns</li>
              <li>Actionable "Easy Wins" to save money</li>
            </ul>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h2>Take Action</h2>
            <p>
              Use your personalized recovery plan to:
            </p>
            <ul>
              <li>Cancel forgotten subscriptions</li>
              <li>Negotiate or eliminate bank fees</li>
              <li>Set spending limits for problem categories</li>
              <li>Track your progress over time</li>
            </ul>
          </div>
        </div>

        {/* Supported banks */}
        <section className="supported-section">
          <h2>Supported Banks & Formats</h2>
          <p>
            Leaky Wallet works with CSV and PDF statements from most major banks worldwide, including:
          </p>
          <div className="bank-grid">
            <div className="bank-region">
              <h3>Australia</h3>
              <ul>
                <li>ANZ</li>
                <li>Commonwealth Bank</li>
                <li>Westpac</li>
                <li>NAB</li>
                <li>ING</li>
                <li>Macquarie</li>
              </ul>
            </div>
            <div className="bank-region">
              <h3>United States</h3>
              <ul>
                <li>Chase</li>
                <li>Bank of America</li>
                <li>Wells Fargo</li>
                <li>Citi</li>
                <li>Capital One</li>
                <li>US Bank</li>
              </ul>
            </div>
            <div className="bank-region">
              <h3>United Kingdom</h3>
              <ul>
                <li>Barclays</li>
                <li>HSBC</li>
                <li>Lloyds</li>
                <li>NatWest</li>
                <li>Santander UK</li>
                <li>Monzo</li>
              </ul>
            </div>
            <div className="bank-region">
              <h3>Other</h3>
              <ul>
                <li>Any CSV with date, description, amount</li>
                <li>Standard PDF statements</li>
                <li>Multi-currency support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Privacy section */}
        <section className="privacy-section">
          <h2>Your Privacy Matters</h2>
          <div className="privacy-grid">
            <div className="privacy-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h3>No Data Storage</h3>
              <p>Your bank statement is processed in memory and immediately discarded. We never save your financial data.</p>
            </div>
            <div className="privacy-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h3>No Account Required</h3>
              <p>No signup, no email, no tracking. Just upload and get your results instantly.</p>
            </div>
            <div className="privacy-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h3>Session-Only Processing</h3>
              <p>When you close your browser tab, all data from your analysis is gone forever.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="how-cta-section">
          <h2>Ready to Find Your Money Leaks?</h2>
          <p>Most people discover $200-$600/month in hidden spending.</p>
          <Link href="/" className="btn btn-primary btn-lg">
            Analyze My Statement
          </Link>
        </section>
      </div>
    </main>
  )
}
