import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing – Leaky Wallet is Free Forever',
  description: 'Leaky Wallet is completely free to use. No hidden fees, no premium tier. Optional donations help keep the service running.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/pricing',
  },
  openGraph: {
    title: 'Pricing – Leaky Wallet is Free',
    description: 'Free bank statement analyzer with no hidden fees. Support the project with an optional donation.',
    type: 'website',
    url: 'https://whereismymoneygo.com/pricing',
  },
}

export default function PricingPage() {
  return (
    <main className="container pricing-page">
      <div className="pricing-content">
        <h1>Simple Pricing: Free</h1>
        <p className="pricing-intro">
          Leaky Wallet is free to use, forever. No trials, no premium tiers, no hidden fees.
        </p>

        {/* Pricing cards */}
        <div className="pricing-cards">
          <div className="pricing-card pricing-card-main">
            <div className="pricing-badge">Most Popular</div>
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
                Personalized savings plan
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
            This tool should be accessible to everyone, regardless of their financial situation.
            That's why it's free - no premium tier, no data selling, no catches.
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
            <h3>Will there ever be a paid version?</h3>
            <p>
              The core features will always be free. If we add advanced features in the future
              (like automatic bank sync), those might have a small fee to cover costs, but
              statement analysis will remain free.
            </p>
          </div>

          <div className="faq-item">
            <h3>How do you make money?</h3>
            <p>
              Currently, this is a passion project supported by optional donations. We don't
              sell your data or show ads.
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
            <h3>What about the Bank Connect feature?</h3>
            <p>
              Bank Connect (automatic Plaid integration) is coming soon for US and UK users.
              This feature will also be free during the beta period.
              <Link href="/banks">Learn more about Bank Connect</Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
