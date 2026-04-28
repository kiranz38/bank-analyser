import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import GeoMismatchBanner from '@/components/GeoMismatchBanner'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer New Zealand – Free Tool for ANZ NZ, Westpac NZ, BNZ, ASB',
  description: 'Free New Zealand bank statement analyzer. Upload your CSV or PDF from ANZ NZ, Westpac NZ, BNZ, ASB, Kiwibank, or any NZ bank to find hidden subscriptions, fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/bank-statement-analyzer-new-zealand' },
  openGraph: {
    title: 'Bank Statement Analyzer New Zealand – ANZ NZ, BNZ, ASB, Westpac NZ & More',
    description: 'Free tool for New Zealand bank customers. Find hidden subscriptions, fees, and spending leaks from any NZ bank statement.',
    type: 'website', url: 'https://whereismymoneygo.com/bank-statement-analyzer-new-zealand', siteName: 'Leaky Wallet',
  },
}

const nzBanks = [
  { name: 'ANZ New Zealand', href: '/anz-nz-statement-analyzer', note: 'Export from anz.co.nz → Internet Banking → Account → Export Transactions → CSV' },
  { name: 'BNZ (Bank of New Zealand)', href: '/bank-statement-analyzer', note: 'Export from bnz.co.nz → Internet Banking → Accounts → Export Statement → CSV' },
  { name: 'ASB Bank', href: '/bank-statement-analyzer', note: 'Export from asb.co.nz → FastNet Classic → Accounts → Export Transactions → CSV' },
  { name: 'Westpac New Zealand', href: '/bank-statement-analyzer', note: 'Export from westpac.co.nz → Online Banking → Transaction History → Export' },
  { name: 'Kiwibank', href: '/bank-statement-analyzer', note: 'Export from kiwibank.co.nz → Internet Banking → Accounts → Export → CSV' },
  { name: 'TSB Bank', href: '/bank-statement-analyzer', note: 'Export from tsb.co.nz → Online Banking → Accounts → Export Transactions' },
  { name: 'Co-operative Bank', href: '/bank-statement-analyzer', note: 'Export from co-operativebank.co.nz → Online Banking → Transactions → Export' },
]

const nzSpecificLeaks = [
  { leak: 'NZD vs AUD/USD subscription pricing', detail: 'Many subscriptions price in USD or AUD, costing ~10–20% more in NZD than advertised. Foreign transaction fees add another 2–3%.' },
  { leak: 'Afterpay and Laybuy repayments', detail: 'BNPL (Buy Now Pay Later) repayments can become habitual drains if multiple purchases are in repayment simultaneously' },
  { leak: 'Sky TV and streaming overlaps', detail: 'Sky TV subscribers often also pay for Netflix, Prime Video, and Disney+ — significant overlap in content' },
  { leak: 'Account fees on dormant accounts', detail: 'Many Kiwis have old bank accounts still incurring monthly fees for accounts they stopped using' },
  { leak: 'ACC levy and insurance duplicates', detail: 'Some NZ residents hold personal accident insurance that duplicates what ACC already covers' },
]

const faqs = [
  { q: 'Which New Zealand banks does Leaky Wallet support?', a: 'Leaky Wallet supports CSV and PDF exports from any NZ bank including ANZ NZ, BNZ, ASB, Westpac NZ, Kiwibank, TSB, The Co-operative Bank, and more.' },
  { q: 'How do I export my NZ bank statement as CSV?', a: 'Log in to your bank\'s internet banking portal on desktop, go to your account transactions, look for Export or Download Statement, and select CSV format. Most NZ banks support this under Account or Transaction History.' },
  { q: 'Does the analyzer handle NZD and multi-currency transactions?', a: 'Yes. The analyzer handles NZD as the base currency and flags foreign currency transactions (USD, AUD, GBP) separately so you can see the true NZD cost including conversion fees.' },
  { q: 'Is Leaky Wallet free in New Zealand?', a: 'Yes, the core analysis is completely free. A Pro report with a personalized savings plan is available for a one-time $1.99 USD (approx $3.30 NZD) payment.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function NzAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <GeoMismatchBanner pageRegionSlug="new-zealand" />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇳🇿 New Zealand</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bank Statement Analyzer New Zealand — ANZ NZ, BNZ, ASB, Westpac & More
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">
          Free bank statement analysis for New Zealanders. Export your transactions from any NZ bank
          as CSV or PDF and instantly find hidden subscriptions, unnecessary fees, and spending leaks.
          No signup, completely private.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your NZ Bank Statement</h2>
          <p className="text-sm text-muted-foreground">Works with ANZ NZ, BNZ, ASB, Westpac NZ, Kiwibank, and all NZ banks</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Statement Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Data never stored</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Supported New Zealand Banks</h2>
          <div className="space-y-3">
            {nzBanks.map(({ name, href, note }) => (
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
          <h2 className="text-xl font-semibold">NZ-Specific Spending Leaks</h2>
          <div className="space-y-4">
            {nzSpecificLeaks.map(({ leak, detail }) => (
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
          <Link href="/anz-nz-statement-analyzer" className="text-primary hover:underline">ANZ NZ</Link>
          <Link href="/bank-statement-analyzer-australia" className="text-primary hover:underline">Australia Guide</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
        </nav>
      </article>
    </main>
  )
}
