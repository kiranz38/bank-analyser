import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer USA – Free Tool for Chase, Bank of America, Wells Fargo',
  description: 'Free US bank statement analyzer. Upload your CSV or PDF from Chase, Bank of America, Wells Fargo, Citi, Capital One, or any US bank to find hidden subscriptions, fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/bank-statement-analyzer-usa' },
  openGraph: {
    title: 'Bank Statement Analyzer USA – Chase, Bank of America, Wells Fargo & More',
    description: 'Free tool for US bank customers. Upload CSV or PDF from any American bank and find hidden subscriptions, fees, and spending leaks instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/bank-statement-analyzer-usa', siteName: 'Leaky Wallet',
  },
}

const usBanks = [
  { name: 'Chase', href: '/chase-bank-statement-analyzer', note: 'Export from chase.com → Accounts → Download → CSV' },
  { name: 'Bank of America', href: '/bank-of-america-statement-analyzer', note: 'Export from bankofamerica.com → Transactions → Download → CSV' },
  { name: 'Wells Fargo', href: '/wells-fargo-statement-analyzer', note: 'Export from wellsfargo.com → Accounts → Download Account Activity → CSV' },
  { name: 'Citi', href: '/bank-statement-analyzer', note: 'Export from citi.com → Account Activity → Download Transactions → CSV' },
  { name: 'Capital One', href: '/bank-statement-analyzer', note: 'Export from capitalone.com → Account → Download Transactions → CSV' },
  { name: 'US Bank', href: '/bank-statement-analyzer', note: 'Export from usbank.com → Account Activity → Download → CSV' },
  { name: 'TD Bank', href: '/td-bank-statement-analyzer', note: 'Export from tdbank.com → Account Activity → Download Transactions → CSV' },
  { name: 'American Express', href: '/bank-statement-analyzer', note: 'Export from americanexpress.com → Statements → View All Activity → Export' },
  { name: 'Ally Bank', href: '/bank-statement-analyzer', note: 'Export from ally.com → Transaction History → Export to CSV' },
  { name: 'Marcus by Goldman Sachs', href: '/bank-statement-analyzer', note: 'Export from marcus.com → Transactions → Download CSV' },
]

const usSpecificLeaks = [
  { leak: 'Subscription stacking', detail: 'The average American pays for 4.5 streaming services simultaneously — Netflix, Hulu, Disney+, Max, Peacock, Paramount+ — often with multiple overlapping' },
  { leak: 'Bank maintenance fees', detail: 'Monthly account maintenance fees ($12–$25/month) that can be waived if you ask — most people never ask' },
  { leak: 'Annual credit card fees', detail: 'Premium credit card annual fees that are no longer worth it if your spending habits have changed' },
  { leak: 'Gym and fitness apps', detail: 'Multiple fitness subscriptions (gym + Peloton + training app) that overlap in function' },
  { leak: 'Amazon Prime and add-ons', detail: 'Amazon Prime channels, audible credits, and additional Amazon services stacking on the base subscription' },
]

const faqs = [
  { q: 'Which US banks does Leaky Wallet support?', a: 'Leaky Wallet works with CSV and PDF exports from any US bank including Chase, Bank of America, Wells Fargo, Citi, Capital One, US Bank, TD Bank, American Express, Ally, Marcus, and more.' },
  { q: 'How do I export my bank statement from a US bank?', a: 'Most US banks let you export transaction history as CSV from the online banking portal. Log in to your bank\'s website (desktop), go to your account activity, look for a Download or Export button, and select CSV format.' },
  { q: 'Does it work with credit card statements?', a: 'Yes. Export your credit card transaction history as CSV or PDF and upload it to Leaky Wallet. The analyzer works identically for checking accounts, savings accounts, and credit cards.' },
  { q: 'How much do Americans typically lose to hidden subscriptions?', a: 'Research suggests the average American underestimates their monthly subscription spend by about $133. Common culprits: forgotten free trials, price increases on existing subscriptions, and duplicated services.' },
  { q: 'Is Leaky Wallet free in the US?', a: 'Yes, the core analysis is completely free. A Pro report with a personalized savings plan is available for a one-time $1.99 charge.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function UsaAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇺🇸 United States</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bank Statement Analyzer USA — Chase, Bank of America, Wells Fargo & More
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">
          Free bank statement analysis for US customers. Export your transactions from any American
          bank as CSV or PDF and instantly find hidden subscriptions, unnecessary fees, and spending
          leaks — no signup required.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your US Bank Statement</h2>
          <p className="text-sm text-muted-foreground">Works with Chase, Bank of America, Wells Fargo, Citi, Capital One, and all US banks</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Statement Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Data never stored</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Supported US Banks</h2>
          <div className="space-y-3">
            {usBanks.map(({ name, href, note }) => (
              <div key={name} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <Link href={href} className="font-medium text-primary hover:underline">{name}</Link>
                  <p className="text-muted-foreground text-xs mt-0.5">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">US-Specific Spending Leaks</h2>
          <div className="space-y-4">
            {usSpecificLeaks.map(({ leak, detail }) => (
              <div key={leak} className="space-y-0.5">
                <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{leak}</p>
                <p className="text-xs text-muted-foreground pl-6">{detail}</p>
              </div>
            ))}
          </div>
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
          <Link href="/chase-bank-statement-analyzer" className="text-primary hover:underline">Chase</Link>
          <Link href="/bank-of-america-statement-analyzer" className="text-primary hover:underline">Bank of America</Link>
          <Link href="/wells-fargo-statement-analyzer" className="text-primary hover:underline">Wells Fargo</Link>
          <Link href="/td-bank-statement-analyzer" className="text-primary hover:underline">TD Bank</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>
    </main>
  )
}
