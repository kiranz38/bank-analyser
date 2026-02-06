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
              <span>Where Is My Money Going?</span>
            </div>
            <p className="footer-tagline">Free privacy-first bank statement analyzer.</p>
          </div>

          {/* Middle Column - Links */}
          <div className="footer-links-col">
            <h4>Resources</h4>
            <nav className="footer-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
              <Link href="/bank-statement-analyzer">How it works</Link>
              <Link href="/bank-statement-analyzer#download-guide">Bank CSV Guide</Link>
            </nav>
          </div>

          {/* Right Column - Legal */}
          <div className="footer-legal-col">
            <p className="footer-care">Built with care</p>
            <p className="footer-disclaimer">Not financial advice</p>
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
