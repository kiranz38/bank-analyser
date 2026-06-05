import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import GeoMismatchBanner from '@/components/GeoMismatchBanner'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer UK – Free Tool for Barclays, HSBC, Lloyds, NatWest, Monzo',
  description: 'Free UK bank statement analyzer. Upload your CSV or PDF from Barclays, HSBC, Lloyds, NatWest, Santander, Monzo, or any UK bank to find hidden subscriptions, fees, and spending leaks.',
  alternates: { canonical: 'https://whereismymoneygo.com/bank-statement-analyzer-uk' },
  openGraph: {
    title: 'Bank Statement Analyzer UK – Barclays, HSBC, Lloyds, NatWest & More',
    description: 'Free tool for UK bank customers. Upload CSV or PDF from any British bank and find hidden subscriptions, fees, and spending leaks instantly.',
    type: 'website', url: 'https://whereismymoneygo.com/bank-statement-analyzer-uk', siteName: 'Leaky Wallet',
  },
}

const ukBanks = [
  { name: 'Barclays', href: '/barclays-statement-analyzer', note: 'Export from barclays.co.uk → Statements → Download as CSV' },
  { name: 'HSBC', href: '/hsbc-statement-analyzer', note: 'Export from hsbc.co.uk → Statements → Download Transactions → CSV' },
  { name: 'Lloyds Bank', href: '/bank-statement-analyzer', note: 'Export from lloydsbank.com → Transactions → Export as CSV' },
  { name: 'NatWest', href: '/bank-statement-analyzer', note: 'Export from natwest.com → Transactions → Download Statement → CSV' },
  { name: 'Santander UK', href: '/bank-statement-analyzer', note: 'Export from santander.co.uk → Online Banking → Statements → Download' },
  { name: 'Monzo', href: '/bank-statement-analyzer', note: 'Export from Monzo app → Account → Export Transactions → CSV' },
  { name: 'Starling Bank', href: '/bank-statement-analyzer', note: 'Export from starlingbank.com → Spaces → Download Statement → CSV' },
  { name: 'Halifax', href: '/bank-statement-analyzer', note: 'Export from halifax.co.uk → Transactions → Export as CSV' },
  { name: 'Nationwide', href: '/bank-statement-analyzer', note: 'Export from nationwide.co.uk → My Accounts → View Statement → Download' },
  { name: 'First Direct', href: '/bank-statement-analyzer', note: 'Export from firstdirect.com → Transactions → Export → CSV' },
]

const ukSpecificLeaks = [
  { leak: 'TV licence and duplicate streaming', detail: 'BBC iPlayer requires a TV Licence (£169.50/year). Many UK households also pay for Sky, Netflix, Amazon, Disney+ simultaneously.' },
  { leak: 'Council tax direct debits', detail: 'Council tax spreading over 10 months means two "free" months — but some banks still charge account fees in those months' },
  { leak: 'Packaged bank account fees', detail: 'Barclays Premier, NatWest Platinum, and similar packaged accounts charge £12–£25/month for benefits many customers never use' },
  { leak: 'Mobile phone contract upgrades', detail: 'Old phone contracts that should have ended but kept billing at full price even after the handset is paid off' },
  { leak: 'Foreign currency fees on EU subscriptions', detail: 'Post-Brexit, some UK banks charge additional fees on EUR-denominated subscriptions' },
]

const faqs = [
  { q: 'Which UK banks does Leaky Wallet support?', a: 'Leaky Wallet works with CSV and PDF exports from any UK bank including Barclays, HSBC, Lloyds, NatWest, Santander, Monzo, Starling, Halifax, Nationwide, First Direct, and more.' },
  { q: 'How do I export my UK bank statement as CSV?', a: 'Log in to your bank\'s online banking website, navigate to your account transactions, look for Download or Export Statement, and select CSV format. Most UK high-street banks and challenger banks support this.' },
  { q: 'Does it work with Monzo and Starling exports?', a: 'Yes. Monzo and Starling both support CSV exports from their apps. Go to Account → Export Transactions and upload the file to Leaky Wallet.' },
  { q: 'Can it detect my Sky or BT subscription increases?', a: 'Yes. The analyzer detects price changes in recurring charges — so if your Sky or BT bill increased, it will flag the change and calculate the annual cost difference.' },
  { q: 'Is Leaky Wallet free in the UK?', a: 'Yes, the core analysis is completely free. A Pro report with a personalised savings plan is available for a one-time $1.99 (approx £1.60) charge.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function UkAnalyzerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <GeoMismatchBanner pageRegionSlug="uk" />
      <article className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">🇬🇧 United Kingdom</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bank Statement Analyzer UK — Barclays, HSBC, Lloyds, Monzo & More
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">
          Free bank statement analysis for UK customers. Export your transactions from any British bank
          as CSV or PDF and instantly find hidden subscriptions, unnecessary fees, and spending leaks.
          No signup, completely private.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Analyze Your UK Bank Statement</h2>
          <p className="text-sm text-muted-foreground">Works with Barclays, HSBC, Lloyds, NatWest, Monzo, Starling, and all UK banks</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Analyze My Statement Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · CSV or PDF · Data never stored</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Supported UK Banks</h2>
          <div className="space-y-3">
            {ukBanks.map(({ name, href, note }) => (
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
          <h2 className="text-xl font-semibold">UK-Specific Spending Leaks</h2>
          <div className="space-y-4">
            {ukSpecificLeaks.map(({ leak, detail }) => (
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
          <Link href="/barclays-statement-analyzer" className="text-primary hover:underline">Barclays</Link>
          <Link href="/hsbc-statement-analyzer" className="text-primary hover:underline">HSBC</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
        </nav>
      </article>        <SeoInternalLinks currentPath="/bank-statement-analyzer-uk" />

    </main>
  )
}
