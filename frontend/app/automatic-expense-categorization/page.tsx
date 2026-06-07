import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Automatic Expense Categorization – AI Categorizes Every Transaction Instantly',
  description: 'Automatic expense categorization from your bank statement. Upload your CSV or PDF and every transaction is instantly sorted into categories — groceries, dining, transport, subscriptions, fees, and more. No manual entry.',
  alternates: { canonical: 'https://whereismymoneygo.com/automatic-expense-categorization' },
  openGraph: {
    title: 'Free Automatic Expense Categorization – Upload Your Bank Statement',
    description: 'Upload your bank statement and every transaction is automatically categorized — groceries, dining, subscriptions, transport, fees — in seconds. Free.',
    type: 'website',
    url: 'https://whereismymoneygo.com/automatic-expense-categorization',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How accurate is automatic expense categorization?', acceptedAnswer: { '@type': 'Answer', text: 'Leaky Wallet achieves over 90% accuracy on common merchants. Payment processor prefixes (Square, Stripe, PayPal) and abbreviated names are normalized automatically. Unusual local merchants may occasionally be miscategorized, but major spending categories are consistently accurate.' } },
                { '@type': 'Question', name: 'Do I need to manually correct any categories?', acceptedAnswer: { '@type': 'Answer', text: 'For most users, no manual correction is needed. The most common edge cases are local restaurants or unusual merchant names — for major chains and subscription services, categorization is highly accurate.' } },
                { '@type': 'Question', name: 'What bank statement formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'CSV exports from any bank worldwide and PDF statements from ANZ, CommBank, Westpac, NAB, Chase, Bank of America, Wells Fargo, Barclays, HSBC, TD Bank, and more. The analyzer works with any standard transaction export.' } },
                { '@type': 'Question', name: 'Can I categorize multiple months at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — upload up to 12 files at once (up to 30MB total) and the analyzer merges them into a single categorized report. This is ideal for 6-month or annual spending reviews.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Automatic Expense Categorization — No Manual Entry
        </h1>

        <p className="text-lg text-muted-foreground">
          Manually categorizing bank transactions takes hours and is prone to error. Leaky Wallet automatically categorizes every transaction in your statement — using AI trained on thousands of merchant patterns across 15+ spending categories.
        </p>

        <p className="text-muted-foreground">
          Upload your CSV or PDF once and get a complete categorized breakdown of every expense. Groceries, dining out, transport, entertainment, subscriptions, bank fees, utilities — all sorted automatically in under 30 seconds.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Categorize Your Expenses Automatically</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — every transaction categorized in under 30 seconds.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Categorize My Expenses
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Expense Categories Detected Automatically</h2>
          <ul className="space-y-3">
            <li key='Groceries & Supermarkets' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Groceries & Supermarkets</p>
              <p className="text-xs text-muted-foreground pl-6">Woolworths, Coles, Tesco, Walmart, Whole Foods, and local supermarkets</p>
            </li>
            <li key='Dining & Takeaway' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Dining & Takeaway</p>
              <p className="text-xs text-muted-foreground pl-6">Restaurants, cafes, fast food, and delivery apps (Uber Eats, DoorDash)</p>
            </li>
            <li key='Subscriptions & Streaming' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscriptions & Streaming</p>
              <p className="text-xs text-muted-foreground pl-6">Netflix, Spotify, Amazon Prime, Adobe, and all recurring services</p>
            </li>
            <li key='Transport' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Transport</p>
              <p className="text-xs text-muted-foreground pl-6">Fuel, public transit, Uber, Lyft, parking, and tolls</p>
            </li>
            <li key='Utilities & Bills' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Utilities & Bills</p>
              <p className="text-xs text-muted-foreground pl-6">Electricity, gas, water, internet, phone plans</p>
            </li>
            <li key='Health & Fitness' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Health & Fitness</p>
              <p className="text-xs text-muted-foreground pl-6">Gym memberships, pharmacies, medical, and wellness apps</p>
            </li>
            <li key='Bank Fees' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Bank Fees</p>
              <p className="text-xs text-muted-foreground pl-6">Monthly account fees, ATM charges, foreign transaction fees</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How Automatic Categorization Works</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Upload your bank statement.</strong> Drop your CSV or PDF — any bank, any country, any format.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>AI identifies every merchant.</strong> Each transaction description is matched against merchant patterns and normalized (e.g., 'AMZN*PRIME' → Amazon Prime Subscription).</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Transactions are sorted into categories.</strong> Every expense is placed in the correct category — including mixed merchants like pharmacies that sell both groceries and healthcare.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Review your category breakdown.</strong> See monthly totals by category, trends over time, and which categories are over or under your targets.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How accurate is automatic expense categorization?', a: 'Leaky Wallet achieves over 90% accuracy on common merchants. Payment processor prefixes (Square, Stripe, PayPal) and abbreviated names are normalized automatically. Unusual local merchants may occasionally be miscategorized, but major spending categories are consistently accurate.' },
          { q: 'Do I need to manually correct any categories?', a: 'For most users, no manual correction is needed. The most common edge cases are local restaurants or unusual merchant names — for major chains and subscription services, categorization is highly accurate.' },
          { q: 'What bank statement formats are supported?', a: 'CSV exports from any bank worldwide and PDF statements from ANZ, CommBank, Westpac, NAB, Chase, Bank of America, Wells Fargo, Barclays, HSBC, TD Bank, and more. The analyzer works with any standard transaction export.' },
          { q: 'Can I categorize multiple months at once?', a: 'Yes — upload up to 12 files at once (up to 30MB total) and the analyzer merges them into a single categorized report. This is ideal for 6-month or annual spending reviews.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
          <Link href="/monthly-expense-tracker" className="text-primary hover:underline">Monthly Expense Tracker</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/automatic-expense-categorization' />
    </main>
  )
}
