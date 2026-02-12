import type { Metadata } from 'next'
import Link from 'next/link'

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

export default function PricingPage() {
  return (
    <main className="container pricing-page">
      <div className="pricing-content">
        <h1>Simple, Transparent Pricing</h1>
        <p className="pricing-intro">
          Analyze your bank statements for free. Want the full picture? Get a Pro Report for just $1.99.
        </p>

        {/* Pricing cards */}
        <div className="pricing-cards">
          <div className="pricing-card">
            <div className="pricing-badge">Free Forever</div>
            <h2>Free</h2>
            <div className="pricing-amount">
              <span className="price">$0</span>
              <span className="period">/ forever</span>
            </div>
            <ul className="pricing-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Unlimited statement uploads
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Full subscription detection
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Spending category breakdown
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Month-over-month comparison
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                CSV and PDF support
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                No account required
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Privacy-first (no data stored)
              </li>
            </ul>
            <Link href="/" className="btn btn-primary btn-block">
              Start Analyzing Free
            </Link>
          </div>

          <div className="pricing-card pricing-card-pro">
            <div className="pricing-badge pricing-badge-pro">Pro Report</div>
            <h2>Pro</h2>
            <div className="pricing-amount">
              <span className="price pricing-price-pro">$1.99</span>
              <span className="period">/ one-time</span>
            </div>
            <ul className="pricing-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Everything in Free
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Financial health score (0–100)
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                12-month savings projection
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Prioritized action plan
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Category deep dives with trends
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Downloadable PDF report
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Report delivered to your email
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Secure payment via Stripe
              </li>
            </ul>
            <Link href="/" className="btn btn-pro btn-block">
              Get Pro Report — $1.99
            </Link>
          </div>
        </div>

        {/* Why free */}
        <section className="why-free-section">
          <h2>Why is Leaky Wallet Free?</h2>
          <p>
            I built Leaky Wallet because I was frustrated with how hard it is to understand
            where money goes each month. Subscription services, small recurring fees, and
            forgotten memberships add up quickly.
          </p>
          <p>
            The core analysis will always be free and accessible to everyone. The Pro Report
            is an optional upgrade for those who want a deeper, professional-grade breakdown
            — and it helps cover hosting costs to keep the free tier running.
          </p>
        </section>

        {/* Support section */}
        <section className="support-project-section">
          <div className="support-project-card">
            <div className="support-project-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2>Support the Project</h2>
            <p>
              If Leaky Wallet helped you find savings, consider buying me a coffee.
              Your support helps cover hosting costs and keeps this tool free for everyone.
            </p>
            <a
              href="https://buymeacoffee.com/joh38"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              Buy Me a Coffee
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="pricing-faq">
          <h2>Frequently Asked Questions</h2>

          <div className="faq-item">
            <h3>What do I get with the free version?</h3>
            <p>
              Full spending analysis, subscription detection, category breakdowns,
              month-over-month trends, and a personalized savings plan — all completely free,
              no account required.
            </p>
          </div>

          <div className="faq-item">
            <h3>What&apos;s included in the Pro Report?</h3>
            <p>
              A detailed PDF report with your financial health score, 12-month savings projection,
              prioritized action plan, category deep dives with spending trends, and an executive
              summary. It&apos;s delivered to your email and available for instant download.
            </p>
          </div>

          <div className="faq-item">
            <h3>Is the Pro Report a subscription?</h3>
            <p>
              No. It&apos;s a one-time payment of $1.99 per report. No recurring charges, no
              auto-renewals. You pay once and get your report.
            </p>
          </div>

          <div className="faq-item">
            <h3>Is my data really not stored?</h3>
            <p>
              Correct. Your bank statement is processed in server memory and discarded immediately
              after generating your report. We have no database of user financial data.
            </p>
          </div>

          <div className="faq-item">
            <h3>How is payment handled?</h3>
            <p>
              Payments are processed securely through Stripe. We never see or store your card
              details. If PDF generation fails after payment, you&apos;re automatically refunded.
            </p>
          </div>

          <div className="faq-item">
            <h3>What about the Bank Connect feature?</h3>
            <p>
              Bank Connect (automatic Plaid integration) is coming soon for US and UK users.
              This feature will also be free during the beta period.{' '}
              <Link href="/banks">Learn more about Bank Connect</Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
