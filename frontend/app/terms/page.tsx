import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use | Where Is My Money Going?',
  description: 'Terms of use for whereismymoneygo.com bank statement analyzer.',
}

export default function TermsPage() {
  return (
    <main className="container legal-page">
      <div className="legal-content">
        <h1>Terms of Use</h1>
        <p className="legal-updated">Last updated: February 2026</p>

        <section>
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using Where Is My Money Going? (whereismymoneygo.com), you agree to be bound
            by these Terms of Use. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2>Service Description</h2>
          <p>
            Where Is My Money Going? is a free online tool that analyzes bank statement data to help
            users identify spending patterns, subscriptions, and potential savings opportunities.
            The service processes data in memory only and does not store user financial information.
          </p>
        </section>

        <section>
          <h2>Not Financial Advice</h2>
          <p>
            <strong>Important:</strong> This tool is for informational and educational purposes only.
            The analysis, insights, and suggestions provided do not constitute financial, investment,
            tax, or legal advice. You should consult with qualified professionals before making any
            financial decisions.
          </p>
        </section>

        <section>
          <h2>User Responsibilities</h2>
          <ul>
            <li>You are responsible for the accuracy of any data you upload or paste into the tool.</li>
            <li>You confirm that you have the right to access and analyze the financial data you submit.</li>
            <li>You agree not to use this service for any illegal or unauthorized purpose.</li>
            <li>You will not attempt to reverse engineer, hack, or disrupt the service.</li>
          </ul>
        </section>

        <section>
          <h2>Accuracy and Limitations</h2>
          <p>
            While we strive to provide accurate analysis, we cannot guarantee the completeness or
            accuracy of results. Our categorization algorithms use heuristics and may occasionally
            misclassify transactions. Always verify important findings with your actual bank records.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Where Is My Money Going? and its creators shall
            not be liable for any indirect, incidental, special, consequential, or punitive damages
            arising from your use of the service. Our total liability shall not exceed the amount
            you paid to use the service (which is $0 as this is a free tool).
          </p>
        </section>

        <section>
          <h2>Service Availability</h2>
          <p>
            We provide this service on an "as is" and "as available" basis. We do not guarantee
            uninterrupted access and may modify or discontinue the service at any time without notice.
          </p>
        </section>

        <section>
          <h2>Intellectual Property</h2>
          <p>
            The service, including its design, code, and content, is protected by intellectual
            property laws. You may not copy, modify, or distribute any part of the service without
            our written permission.
          </p>
        </section>

        <section>
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service
            after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For questions about these terms, contact us at{' '}
            <a href="mailto:raleobob@gmail.com">raleobob@gmail.com</a>.
          </p>
        </section>

        <div className="legal-back">
          <Link href="/">← Back to Analyzer</Link>
        </div>
      </div>
    </main>
  )
}
