import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer Australia – Free Tool for ANZ, CommBank, Westpac, NAB',
  description: 'Free Australian bank statement analyzer. Upload your CSV or PDF from ANZ, CommBank, Westpac, NAB, ING, Macquarie, or any Australian bank to find hidden subscriptions, fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/bank-statement-analyzer-australia' },
  openGraph: {
    title: 'Bank Statement Analyzer Australia – ANZ, CommBank, Westpac, NAB',
    description: 'Free tool for Australian bank customers. Upload CSV or PDF from any Aussie bank and find hidden subscriptions, fees, and spending leaks instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/bank-statement-analyzer-australia', siteName: 'Leaky Wallet',
  },
}

const auBanks = [
  { name: 'ANZ', href: '/anz-bank-statement-analyzer', note: 'Export from anz.com.au → Transaction History → Export CSV' },
  { name: 'Commonwealth Bank (CBA)', href: '/commbank-statement-analyzer', note: 'Export from netbank.com.au → View Transactions → Export CSV' },
  { name: 'Westpac', href: '/westpac-statement-analyzer', note: 'Export from westpac.com.au → Transaction History → Export Transactions' },
  { name: 'NAB', href: '/nab-bank-statement-analyzer', note: 'Export from nab.com.au → Transaction History → Download CSV' },
  { name: 'ING Australia', href: '/bank-statement-analyzer', note: 'Export from ingdirect.com.au → Statements → Download CSV' },
  { name: 'Macquarie Bank', href: '/bank-statement-analyzer', note: 'Export from macquarie.com.au → Online Banking → Transactions → Export' },
  { name: 'Bendigo Bank', href: '/bank-statement-analyzer', note: 'Export from bendigobank.com.au → e-banking → Transactions → Download' },
  { name: 'Bank of Queensland (BOQ)', href: '/bank-statement-analyzer', note: 'Export from boq.com.au → Transaction History → Export' },
  { name: 'Suncorp', href: '/bank-statement-analyzer', note: 'Export from suncorp.com.au → Online Banking → Transaction History' },
  { name: 'Up Bank', href: '/bank-statement-analyzer', note: 'Export from up.com.au → Transactions → Export CSV' },
]

const auSpecificLeaks = [
  { leak: 'Subscription price increases in AUD', detail: 'Netflix, Spotify, and Apple have all raised Australian prices — often without notification' },
  { leak: 'Foreign currency conversion fees', detail: 'Most Australian bank accounts charge 2–3% on USD/GBP transactions. Every US subscription you pay costs extra.' },
  { leak: 'Afterpay and BNPL late fees', detail: 'Buy-now-pay-later fees can be recurring if purchases are on regular autopay' },
  { leak: 'Redundant streaming services', detail: 'Australia now has Netflix, Stan, Binge, Foxtel Now, Disney+, Apple TV+, Paramount+ — most households pay for 3+ simultaneously' },
  { leak: 'Health insurance extras with unused benefits', detail: 'Many Australians pay for extras cover but never claim physio, dental, or optical benefits' },
]

const faqs = [
  { q: 'Which Australian banks does Leaky Wallet support?', a: 'Leaky Wallet works with CSV and PDF exports from any Australian bank including ANZ, Commonwealth Bank, Westpac, NAB, ING, Macquarie, Bendigo Bank, BOQ, Suncorp, Up Bank, and more.' },
  { q: 'How do I export my Australian bank statement?', a: 'Log in to your bank\'s internet banking website (not the app — desktop gives more export options), go to Transaction History, select a date range of 90 days, and export as CSV or PDF.' },
  { q: 'Does it work with Afterpay or Zip transactions?', a: 'Yes. If Afterpay or Zip charges appear as transactions on your bank statement, the analyzer will detect them including any late fees or recurring repayments.' },
  { q: 'Do Australian subscriptions cost more than in the US?', a: 'Often yes. Most streaming and software subscriptions are priced higher in Australia, and you also pay foreign transaction fees (2–3%) on services billed in USD. The analyzer highlights these costs.' },
  { q: 'Is this tool free for Australians?', a: 'The statement analysis is completely free with no signup required. A Pro report with a personalised 12-week savings plan is available for a one-time AUD $1.99 fee.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function AustraliaAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇦🇺 Australia</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bank Statement Analyzer Australia — ANZ, CommBank, Westpac, NAB & More
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">
          Free bank statement analysis for Australian customers. Export your transactions from any
          Australian bank as CSV or PDF and find every hidden subscription, fee, and spending leak —
          no signup, completely private.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your Australian Bank Statement</h2>
          <p className="text-sm text-muted-foreground">Works with ANZ, CommBank, Westpac, NAB, and all other Australian banks</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Statement Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Data never stored</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Supported Australian Banks</h2>
          <div className="space-y-3">
            {auBanks.map(({ name, href, note }) => (
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
          <h2 className="text-xl font-semibold">Australian-Specific Spending Leaks</h2>
          <div className="space-y-4">
            {auSpecificLeaks.map(({ leak, detail }) => (
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
          <Link href="/anz-bank-statement-analyzer" className="text-primary hover:underline">ANZ</Link>
          <Link href="/commbank-statement-analyzer" className="text-primary hover:underline">CommBank</Link>
          <Link href="/westpac-statement-analyzer" className="text-primary hover:underline">Westpac</Link>
          <Link href="/nab-bank-statement-analyzer" className="text-primary hover:underline">NAB</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
        </nav>
      </article>
    </main>
  )
}
