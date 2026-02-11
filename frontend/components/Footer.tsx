import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Left Column - Brand */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span>Leaky Wallet</span>
            </div>
            <p className="footer-tagline">Free privacy-first bank statement analyzer.</p>
            <p className="footer-disclaimer-text">
              For informational purposes only. Not financial advice.
            </p>
          </div>

          {/* Middle Column - Links */}
          <div className="footer-links-col">
            <h4>Product</h4>
            <nav className="footer-links">
              <Link href="/how-it-works">How it works</Link>
              <Link href="/example">Example Report</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/banks">Bank Connect</Link>
            </nav>
          </div>

          {/* Right Column - Legal */}
          <div className="footer-links-col">
            <h4>Legal</h4>
            <nav className="footer-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
            </nav>
            <p className="footer-contact">
              <a href="mailto:support@whereismymoneygo.com">support@whereismymoneygo.com</a>
            </p>
            <p className="footer-copyright">&copy; {currentYear} whereismymoneygo.com</p>
          </div>
        </div>

        {/* Bottom Trust Line */}
        <div className="footer-trust">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>We never store your financial data. Analysis runs in memory only.</span>
        </div>
      </div>
    </footer>
  )
}
