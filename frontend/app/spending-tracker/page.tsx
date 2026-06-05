import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Free Spending Tracker – Analyze Your Bank Statement to Track Monthly Spending',
  description: 'Free spending tracker. Upload your bank statement CSV or PDF to instantly see a complete breakdown of your monthly spending by category, merchant, and trend. No app required.',
  alternates: { canonical: 'https://whereismymoneygo.com/spending-tracker' },
  openGraph: {
    title: 'Free Spending Tracker – See Where Every Dollar Goes',
    description: 'Upload your bank statement to automatically track and categorize your spending. See totals by category, spot trends, and find where you can save. Free, no app required.',
    type: 'website', url: 'https://whereismymoneygo.com/spending-tracker', siteName: 'Leaky Wallet',
  },
}

const trackingFeatures = [
  { title: 'Category breakdown', detail: 'Every transaction automatically sorted: groceries, dining, transport, entertainment, subscriptions, fees, and more' },
  { title: 'Month-over-month trends', detail: 'See which categories grew or shrank compared to last month, and by exactly how much' },
  { title: 'Merchant-level detail', detail: 'See your top 10 merchants by spend — not just categories but the actual companies getting your money' },
  { title: 'Recurring charge detection', detail: 'Every subscription and recurring payment identified, with monthly and annual cost totals' },
  { title: 'Spending leak summary', detail: 'Your estimated monthly "leak" — money going to forgotten or underused services' },
  { title: 'Easy wins list', detail: 'Specific actions ranked by savings impact: cancel this, negotiate that, switch this service' },
]

const faqs = [
  { q: 'Do I need to install an app to use this spending tracker?', a: 'No. Leaky Wallet is entirely web-based. Upload your bank statement CSV or PDF from your browser and get your full spending breakdown instantly — nothing to install or sign up for.' },
  { q: 'How does it categorize my spending?', a: 'The analyzer automatically categorizes transactions based on merchant name and transaction patterns. Categories include groceries, dining, transport, entertainment, subscriptions, health, utilities, shopping, fees, and more.' },
  { q: 'How is this different from my bank\'s spending tracker?', a: 'Bank-built spending trackers use broad categories and often misclassify transactions. Leaky Wallet specifically focuses on finding leaks — recurring charges, price increases, and forgotten subscriptions — not just category totals.' },
  { q: 'Can I track spending across multiple bank accounts?', a: 'Yes. Export CSV files from each account and upload them separately. The analyzer handles each independently so you can compare and identify which account has the most leak.' },
  { q: 'How often should I track my spending?', a: 'Monthly tracking is most effective. Export the previous month\'s transactions, analyze them, and compare with your prior month. Patterns and changes become visible quickly when you do this consistently.' },
  { q: 'Does the spending tracker show year-over-year data?', a: 'The analysis covers the date range of your exported statement. For year-over-year comparison, export 12 months of transactions. The analyzer will show monthly trends and highlight months with unusually high spending.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function SpendingTrackerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Spending Tracker — See Where Every Dollar Goes Without an App
        </h1>

        <p className="text-lg text-muted-foreground">
          Most spending trackers require connecting your bank account, installing an app, or entering
          transactions manually. Leaky Wallet skips all of that — just upload your bank statement
          CSV or PDF and get a complete spending breakdown in under 30 seconds.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Track Your Spending Now</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — instant category breakdown, no app required</p>
          <Button asChild size="lg">
            <Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Spending Free</Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Works with any bank</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">What You Track Automatically</h2>
          <div className="space-y-4">
            {trackingFeatures.map(({ title, detail }) => (
              <div key={title} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">{title}: </span>
                  <span className="text-muted-foreground">{detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Track Your Spending</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span>Log in to your bank and export last month&apos;s transactions as CSV or PDF</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span>Upload the file to Leaky Wallet — no account required, completely private</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span>Review your spending by category, see your top merchants, and spot unusual charges</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span>Act on the easy wins — cancel, negotiate, or switch services to start saving immediately</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/spending-tracker" />

    </main>
  )
}
