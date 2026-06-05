// Server component — renders FAQ schema + visible FAQ accordion for PAA (People Also Ask) targeting
import { JsonLd } from '@/components/JsonLd'

const faqs = [
  {
    q: 'Is Leaky Wallet really free?',
    a: 'Yes. The full bank statement analysis — subscription detection, spending breakdown, category charts, savings plan — is completely free with no account required. An optional Pro Report (PDF download) is available for a one-time $1.99.',
  },
  {
    q: 'Which banks does it work with?',
    a: 'Leaky Wallet works with CSV or PDF exports from any bank worldwide, including ANZ, CommBank, Westpac, NAB, Chase, Bank of America, Wells Fargo, Barclays, HSBC, TD Bank, and hundreds more.',
  },
  {
    q: 'Is my bank statement data safe?',
    a: 'Your file is processed in server memory and immediately discarded — never stored in a database. We cannot see, access, or sell your financial data. No account is required, so there is nothing to breach.',
  },
  {
    q: 'How do I export my bank statement?',
    a: 'Log in to your bank\'s internet banking website (not the mobile app — desktop gives more export options), go to Transaction History, select 90 days of data, and export as CSV or PDF. Most major banks support this.',
  },
  {
    q: 'What counts as a "spending leak"?',
    a: 'A spending leak is money leaving your account that you did not consciously choose to spend: forgotten subscriptions, auto-renewed trials, bank fees, duplicate services, delivery fees, and price increases on existing subscriptions.',
  },
  {
    q: 'How long does the analysis take?',
    a: 'Results appear in under 10 seconds. The analyzer reads every transaction, groups recurring charges, detects subscription patterns, and generates your spending breakdown instantly.',
  },
  {
    q: 'Does it work with credit card statements?',
    a: 'Yes. Export your credit card transaction history as CSV or PDF and upload it the same way. The analyzer detects subscriptions and spending patterns regardless of whether transactions came from a debit or credit card.',
  },
  {
    q: 'What is the average amount people find in leaks?',
    a: 'Based on 47,000+ scans, the average user finds $412 per month in spending leaks — most of it from forgotten subscriptions, price-increased services, and bank fees they were unaware of.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

export default function HomepageFaq() {
  return (
    <>
      <JsonLd schema={faqSchema} />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Frequently Asked Questions</h2>
        <div className="divide-y">
          {faqs.map(faq => (
            <details key={faq.q} className="group py-4">
              <summary className="cursor-pointer list-none flex items-center justify-between font-medium text-sm leading-snug select-none">
                {faq.q}
                <span className="ml-4 shrink-0 text-muted-foreground group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
