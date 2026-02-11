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
          <h2>Voluntary Upload</h2>
          <p>
            All uploads are entirely voluntary. You choose what data to submit for analysis.
            You may also use our &ldquo;Try with sample data&rdquo; feature without uploading any personal information.
          </p>
        </section>

        <section>
          <h2>How We Process Your Data</h2>
          <ul>
            <li><strong>In-Memory Processing Only:</strong> Your bank statement is processed entirely in server memory during your session. No data is written to disk, databases, or cloud storage.</li>
            <li><strong>Immediate Disposal:</strong> Once your analysis is complete and delivered to your browser, all transaction data is immediately discarded from memory. Buffers are cleared.</li>
            <li><strong>No Account Required:</strong> We don&apos;t require login or registration, so there&apos;s no user account storing your information.</li>
            <li><strong>No Tracking of Financial Data:</strong> We do not log, store, or transmit your actual transaction details. Server logs contain only request metadata (timestamps, status codes), never statement text or transaction content.</li>
          </ul>
        </section>

        <section>
          <h2>What We Analyze</h2>
          <p>
            We only process three fields from your transactions: <strong>date</strong>, <strong>description</strong> (merchant name), and <strong>amount</strong>.
            We do not read or process names, account numbers, BSB/IBAN numbers, addresses, or credentials.
          </p>
        </section>

        <section>
          <h2>PII Redaction Before AI Analysis</h2>
          <p>
            Before any data is sent to our AI provider for enhanced analysis, we apply automated redaction
            to strip likely personally identifiable information (PII) including: names, addresses, account numbers,
            BSB/IBAN numbers, reference IDs, email addresses, and phone numbers. Only anonymized, aggregated
            spending categories are shared with the AI &mdash; never raw merchant names or exact amounts.
          </p>
        </section>

        <section>
          <h2>What We Do Collect</h2>
          <p>We may collect minimal, non-financial analytics data to improve our service:</p>
          <ul>
            <li>Basic usage metrics (page views, feature usage counts)</li>
            <li>Error logs (without transaction data or statement text)</li>
            <li>Browser type and general location (country level)</li>
          </ul>
          <p>
            Analytics event payloads contain only booleans and counts (e.g., number of transactions analyzed),
            never raw text from your statement. This data cannot be used to identify you or reconstruct your financial information.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Vercel</strong> &mdash; Frontend hosting. Vercel does not receive your financial data.</li>
            <li><strong>Render</strong> &mdash; Backend hosting. Processing is in-memory only; Render does not persist your data.</li>
            <li><strong>Anthropic (Claude API)</strong> &mdash; Optional AI-enhanced analysis. Only receives anonymized, redacted, aggregated category summaries. Per Anthropic&apos;s API terms, data sent through the API is <strong>not used for model training</strong>.</li>
            <li><strong>Google Analytics</strong> &mdash; Privacy-safe usage analytics only. No financial data is sent.</li>
          </ul>
        </section>

        <section>
          <h2>Data Not Sold or Shared</h2>
          <p>
            We do not sell, rent, or share your data with any third party for marketing or commercial purposes.
            Your financial data exists only in temporary server memory during analysis and is never persisted.
          </p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>
            Since we don&apos;t store your personal financial data, there&apos;s nothing to delete or export.
            If you have questions about our privacy practices, contact us at{' '}
            <a href="mailto:support@whereismymoneygo.com">support@whereismymoneygo.com</a>.
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
          <Link href="/">&#8592; Back to Analyzer</Link>
        </div>
      </div>
    </main>
  )
}
