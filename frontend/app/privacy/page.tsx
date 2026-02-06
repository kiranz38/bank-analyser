import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Where Is My Money Going?',
  description: 'Privacy policy for whereismymoneygo.com. We never store your financial data. Analysis runs in memory only.',
}

export default function PrivacyPage() {
  return (
    <main className="container legal-page">
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: February 2026</p>

        <section>
          <h2>Our Commitment to Privacy</h2>
          <p>
            At Where Is My Money Going?, your privacy is our top priority. We built this tool with a
            privacy-first architecture, meaning <strong>we never store, log, or share your financial data</strong>.
          </p>
        </section>

        <section>
          <h2>How We Process Your Data</h2>
          <ul>
            <li><strong>In-Memory Processing Only:</strong> Your bank statement is processed entirely in server memory during your session. No data is written to disk or databases.</li>
            <li><strong>Immediate Disposal:</strong> Once your analysis is complete and delivered to your browser, all transaction data is immediately discarded from memory.</li>
            <li><strong>No Account Required:</strong> We don't require login or registration, so there's no user account storing your information.</li>
            <li><strong>No Tracking of Financial Data:</strong> We do not log, store, or transmit your actual transaction details to any third party.</li>
          </ul>
        </section>

        <section>
          <h2>What We Do Collect</h2>
          <p>We may collect minimal, non-financial analytics data to improve our service:</p>
          <ul>
            <li>Basic usage metrics (page views, feature usage)</li>
            <li>Error logs (without transaction data)</li>
            <li>Browser type and general location (country level)</li>
          </ul>
          <p>This data cannot be used to identify you or reconstruct your financial information.</p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>
            We may use third-party services for hosting (Vercel, Render) and optional AI-enhanced analysis (Anthropic Claude API).
            When AI analysis is used, only aggregated, anonymized summaries are processed—never raw transaction data with identifiable information.
          </p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>
            Since we don't store your personal financial data, there's nothing to delete or export.
            If you have questions about our privacy practices, contact us at{' '}
            <a href="mailto:raleobob@gmail.com">raleobob@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page
            with an updated revision date.
          </p>
        </section>

        <div className="legal-back">
          <Link href="/">← Back to Analyzer</Link>
        </div>
      </div>
    </main>
  )
}
