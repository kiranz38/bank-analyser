import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions',
  description: 'Free bank statement analyzer. Upload CSV or PDF to find hidden subscriptions, unexpected fees, and spending leaks. See estimated yearly savings instantly.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/bank-statement-analyzer',
  },
  openGraph: {
    title: 'Bank Statement Analyzer – Upload CSV or PDF to Find Hidden Subscriptions',
    description: 'Free bank statement analyzer. Upload CSV or PDF to find hidden subscriptions, unexpected fees, and spending leaks. See estimated yearly savings instantly.',
    type: 'website',
    url: 'https://whereismymoneygo.com/bank-statement-analyzer',
    siteName: 'Where Is My Money Go',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bank Statement Analyzer – Find Hidden Subscriptions',
    description: 'Free tool to analyze your bank statement and find hidden subscriptions & fees.',
  },
}

export default function BankStatementAnalyzerPage() {
  return (
    <main className="container seo-page">
      <article className="seo-content">
        <h1>Bank Statement Analyzer – Upload Your CSV to Find Hidden Subscriptions</h1>

        <p>
          A bank statement analyzer is a tool that scans your transaction history to uncover
          where your money is actually going. Instead of manually scrolling through hundreds
          of transactions, our analyzer automatically identifies patterns, recurring charges,
          and spending habits you may have overlooked.
        </p>

        <p>
          Many people unknowingly pay for subscriptions they forgot about, get hit with
          unexpected bank fees, or have small recurring charges that add up over time.
          These "spending leaks" can cost you hundreds or even thousands of dollars per year
          without you realizing it.
        </p>

        <p>
          Our bank statement analyzer is completely free and privacy-first. Your data is
          processed in memory and never stored on our servers. Simply upload your CSV or PDF
          bank statement and get instant insights into your spending.
        </p>

        <div className="seo-outcomes">
          <h2>What You'll Discover</h2>
          <ul>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Hidden subscriptions you forgot about
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Monthly spending leaks draining your account
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Unexpected bank fees and charges
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Estimated yearly savings potential
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Simple recovery steps to save money
            </li>
          </ul>
        </div>

        <div className="seo-cta-section">
          <Link href="/" className="btn btn-primary btn-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Analyze My Bank Statement
          </Link>
        </div>

        <p className="seo-disclaimer">
          Privacy-first: your data is processed in memory and never stored.
          This tool is for informational purposes only.
        </p>
      </article>

      <footer className="seo-footer">
        <Link href="/">← Back to Home</Link>
      </footer>
    </main>
  )
}
