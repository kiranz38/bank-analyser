import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bank Connect – Automatic Statement Analysis (Coming Soon)',
  description: 'Connect your bank directly for automatic statement analysis. Powered by Plaid, available in the US and UK. Join the waitlist for early access.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/banks',
  },
  openGraph: {
    title: 'Bank Connect – Leaky Wallet',
    description: 'Automatic bank statement analysis with secure read-only access. Coming soon to US and UK.',
    type: 'website',
    url: 'https://whereismymoneygo.com/banks',
  },
}

export default function BanksPage() {
  return (
    <main className="container banks-page">
      <div className="banks-content">
        <div className="banks-header">
          <span className="banks-badge">Coming Soon</span>
          <h1>Bank Connect</h1>
          <p className="banks-intro">
            Skip the manual upload. Connect your bank directly and get automatic
            spending analysis with read-only access.
          </p>
        </div>

        {/* How it works */}
        <section className="banks-section">
          <h2>How Bank Connect Works</h2>
          <div className="banks-steps">
            <div className="banks-step">
              <div className="banks-step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3>1. Select Your Bank</h3>
              <p>Choose from thousands of supported banks in the US and UK.</p>
            </div>
            <div className="banks-step">
              <div className="banks-step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>2. Secure Login</h3>
              <p>Log in through Plaid's secure interface. We never see your credentials.</p>
            </div>
            <div className="banks-step">
              <div className="banks-step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>3. Instant Analysis</h3>
              <p>Your transactions are analyzed automatically. Get results in seconds.</p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="banks-section">
          <h2>Bank-Level Security</h2>
          <div className="banks-security-grid">
            <div className="banks-security-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <h4>Read-Only Access</h4>
                <p>We can only view transactions. No ability to move money or make changes.</p>
              </div>
            </div>
            <div className="banks-security-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <h4>Powered by Plaid</h4>
                <p>The same infrastructure used by Venmo, Coinbase, and thousands of financial apps.</p>
              </div>
            </div>
            <div className="banks-security-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <h4>No Credential Storage</h4>
                <p>We never see or store your bank login. Authentication happens directly with Plaid.</p>
              </div>
            </div>
            <div className="banks-security-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <h4>Disconnect Anytime</h4>
                <p>Revoke access instantly from your bank's website or our dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Availability */}
        <section className="banks-section">
          <h2>Availability</h2>
          <div className="banks-availability">
            <div className="banks-region available">
              <div className="banks-region-header">
                <span className="banks-region-flag">🇺🇸</span>
                <span className="banks-region-name">United States</span>
                <span className="banks-region-status">Beta</span>
              </div>
              <p>5,000+ banks supported including Chase, Bank of America, Wells Fargo, and more.</p>
            </div>
            <div className="banks-region available">
              <div className="banks-region-header">
                <span className="banks-region-flag">🇬🇧</span>
                <span className="banks-region-name">United Kingdom</span>
                <span className="banks-region-status">Beta</span>
              </div>
              <p>Major UK banks including Barclays, HSBC, Lloyds, NatWest, and more.</p>
            </div>
            <div className="banks-region coming-soon">
              <div className="banks-region-header">
                <span className="banks-region-flag">🇦🇺</span>
                <span className="banks-region-name">Australia</span>
                <span className="banks-region-status soon">Coming Soon</span>
              </div>
              <p>Join the waitlist to be notified when we add Australian banks.</p>
            </div>
            <div className="banks-region coming-soon">
              <div className="banks-region-header">
                <span className="banks-region-flag">🇨🇦</span>
                <span className="banks-region-name">Canada</span>
                <span className="banks-region-status soon">Coming Soon</span>
              </div>
              <p>Canadian bank support is planned for later this year.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="banks-cta-section">
          <h2>Join the Waitlist</h2>
          <p>
            Bank Connect is currently in beta. Join the waitlist to get early access
            when it's available in your region.
          </p>
          <Link href="/" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <p className="banks-cta-note">
            Or <Link href="/">upload a statement manually</Link> - works with any bank worldwide.
          </p>
        </section>

        {/* FAQ */}
        <section className="banks-faq">
          <h2>Frequently Asked Questions</h2>

          <div className="faq-item">
            <h3>Is Bank Connect free?</h3>
            <p>
              Yes, Bank Connect will be free during the beta period. See our <Link href="/pricing">pricing page</Link> for details.
            </p>
          </div>

          <div className="faq-item">
            <h3>What if my bank isn't supported?</h3>
            <p>
              You can always use the manual upload option. Export a CSV or PDF from your
              bank and upload it directly. This works with any bank worldwide.
            </p>
          </div>

          <div className="faq-item">
            <h3>Can I disconnect my bank later?</h3>
            <p>
              Absolutely. You can revoke Plaid access at any time through your bank's
              connected apps settings or directly through our site.
            </p>
          </div>

          <div className="faq-item">
            <h3>What data do you access?</h3>
            <p>
              Only transaction data: dates, descriptions, and amounts. We don't access
              account numbers, balances, or personal information beyond what's needed for analysis.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
