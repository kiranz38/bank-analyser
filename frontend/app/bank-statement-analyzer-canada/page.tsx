import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import GeoMismatchBanner from '@/components/GeoMismatchBanner'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer Canada – Free Tool for TD, RBC, Scotiabank, BMO, CIBC',
  description: 'Free Canadian bank statement analyzer. Upload your CSV or PDF from TD, RBC, Scotiabank, BMO, CIBC, or any Canadian bank to find hidden subscriptions, fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/bank-statement-analyzer-canada' },
  openGraph: {
    title: 'Bank Statement Analyzer Canada – TD, RBC, Scotiabank, BMO & More',
    description: 'Free tool for Canadian bank customers. Find hidden subscriptions, fees, and spending leaks from any Canadian bank statement.',
    type: 'website', url: 'https://whereismymoneygo.com/bank-statement-analyzer-canada', siteName: 'Leaky Wallet',
  },
}

const caBanks = [
  { name: 'TD Bank', href: '/td-bank-statement-analyzer', note: 'Export from td.com → My Accounts → Download Transactions → CSV' },
  { name: 'RBC Royal Bank', href: '/bank-statement-analyzer', note: 'Export from rbcroyalbank.com → Account Activity → Download → CSV' },
  { name: 'Scotiabank', href: '/bank-statement-analyzer', note: 'Export from scotiabank.com → Account Details → Download Transactions → CSV' },
  { name: 'BMO Bank of Montreal', href: '/bank-statement-analyzer', note: 'Export from bmo.com → Account Activity → Download Activity → CSV' },
  { name: 'CIBC', href: '/bank-statement-analyzer', note: 'Export from cibc.com → Account Activity → Download Activity → CSV' },
  { name: 'National Bank of Canada', href: '/bank-statement-analyzer', note: 'Export from nbc.ca → Accounts → Download Transactions → CSV' },
  { name: 'Tangerine', href: '/bank-statement-analyzer', note: 'Export from tangerine.ca → Transactions → Export as CSV' },
  { name: 'EQ Bank', href: '/bank-statement-analyzer', note: 'Export from eqbank.ca → Transactions → Download CSV' },
]

const caSpecificLeaks = [
  { leak: 'Monthly bank account fees', detail: 'TD, RBC, and Scotiabank all charge $4–$30/month for account maintenance. Many customers qualify for fee waivers they\'ve never requested.' },
  { leak: 'Canadian streaming duplicates', detail: 'Netflix, Crave, Prime Video, Disney+, Apple TV+, STACKTV — Canadian streaming options have expanded rapidly and subscriptions pile up' },
  { leak: 'Mobile plan price increases', detail: 'Canadian mobile plans are among the most expensive in the world and providers frequently increase prices mid-contract' },
  { leak: 'Interac e-Transfer fees', detail: 'Some bank accounts charge per-transfer fees that add up with frequent use' },
  { leak: 'Credit card annual fees vs rewards value', detail: 'Many Canadians hold premium credit cards ($120–$400/year annual fee) where the rewards no longer justify the cost' },
]

const faqs = [
  { q: 'Which Canadian banks does Leaky Wallet support?', a: 'Leaky Wallet supports CSV and PDF exports from any Canadian bank including TD, RBC, Scotiabank, BMO, CIBC, National Bank, Tangerine, EQ Bank, and more.' },
  { q: 'How do I export my Canadian bank statement as CSV?', a: 'Log in to your bank\'s online banking portal (desktop recommended), go to your account activity or transaction history, look for a Download or Export button, and select CSV format.' },
  { q: 'Does it work with Canadian credit card statements?', a: 'Yes. Export your credit card transaction history as CSV or PDF and upload it to Leaky Wallet. The analysis works identically for all account types.' },
  { q: 'Is Leaky Wallet available in French?', a: 'The tool currently operates in English. French language support is planned for a future update.' },
  { q: 'Is Leaky Wallet free for Canadians?', a: 'Yes, the core analysis is completely free. A Pro report with a personalized savings plan is available for $1.99 CAD (one-time payment).' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function CanadaAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <GeoMismatchBanner pageRegionSlug="canada" />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇨🇦 Canada</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bank Statement Analyzer Canada — TD, RBC, Scotiabank, BMO & More
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">
          Free bank statement analysis for Canadians. Export your transactions from any Canadian bank
          as CSV or PDF and instantly find hidden subscriptions, unnecessary fees, and spending leaks.
          No signup, completely private.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your Canadian Bank Statement</h2>
          <p className="text-sm text-muted-foreground">Works with TD, RBC, Scotiabank, BMO, CIBC, and all Canadian banks</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Statement Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Data never stored</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Supported Canadian Banks</h2>
          <div className="space-y-3">
            {caBanks.map(({ name, href, note }) => (
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
          <h2 className="text-xl font-semibold">Canadian-Specific Spending Leaks</h2>
          <div className="space-y-4">
            {caSpecificLeaks.map(({ leak, detail }) => (
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
          <Link href="/td-bank-statement-analyzer" className="text-primary hover:underline">TD Bank</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/bank-statement-analyzer-canada" />

    </main>
  )
}
