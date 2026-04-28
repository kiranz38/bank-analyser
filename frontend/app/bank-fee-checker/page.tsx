import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search, AlertTriangle } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Free Bank Fee Checker – Find Hidden Bank Fees & Charges in Your Statement',
  description: 'Free bank fee checker. Upload your bank statement CSV or PDF to find every bank fee, charge, and penalty — monthly account fees, ATM fees, foreign transaction fees, overdraft fees, and more.',
  alternates: { canonical: 'https://whereismymoneygo.com/bank-fee-checker' },
  openGraph: {
    title: 'Bank Fee Checker – Find Every Hidden Fee in Your Bank Statement',
    description: 'Upload your bank statement to find every bank fee and charge. See what you\'re paying annually and find out which fees you can avoid.',
    type: 'website', url: 'https://whereismymoneygo.com/bank-fee-checker', siteName: 'Leaky Wallet',
  },
}

const feeTypes = [
  { fee: 'Monthly account maintenance fees', avoidable: true, tip: 'Most banks waive this fee if you maintain a minimum balance, have direct deposit, or hold a linked product. Call your bank and ask.' },
  { fee: 'ATM out-of-network fees', avoidable: true, tip: 'Switch to a bank that reimburses ATM fees (many online banks do) or plan withdrawals from in-network ATMs.' },
  { fee: 'Foreign transaction fees (2–3%)', avoidable: true, tip: 'Use a no-foreign-transaction-fee credit card for international purchases and online subscriptions billed in foreign currencies.' },
  { fee: 'Overdraft fees', avoidable: true, tip: 'Link a savings account as overdraft protection, opt out of overdraft coverage for debit cards, or set low-balance alerts.' },
  { fee: 'Paper statement fees', avoidable: true, tip: 'Switch to e-statements in your bank\'s online portal — usually instant and free.' },
  { fee: 'Inactive account fees', avoidable: true, tip: 'Close dormant accounts or make a small transaction every few months to keep them active.' },
  { fee: 'Wire transfer fees', avoidable: false, tip: 'Hard to avoid for large transfers, but compare bank rates — some charge $15–$45 where others charge nothing.' },
  { fee: 'Safe deposit box fees', avoidable: false, tip: 'Evaluate whether you still need the box — many people pay annually for boxes they rarely access.' },
]

const faqs = [
  { q: 'How do I find all the bank fees I\'m paying?', a: 'Upload your bank statement (CSV or PDF) to Leaky Wallet. The analyzer identifies every bank fee and charge in your transactions, groups them by type, and shows you the total annual cost.' },
  { q: 'How much do bank fees typically cost per year?', a: 'The average Australian pays $120–$300/year in bank fees. In the US, fees average $200–$450/year including account fees, ATM fees, and overdraft charges. Most of these are partially or fully avoidable.' },
  { q: 'Can I get bank fees refunded?', a: 'Many banks will refund fees as a goodwill gesture if you call and ask — particularly first-time overdraft fees and occasional foreign transaction fees. It\'s always worth asking, especially if you\'re a long-term customer.' },
  { q: 'Which bank has the lowest fees?', a: 'Online banks and challenger banks (Ally, Marcus, Starling, Monzo, Up Bank) tend to have the lowest fees. Traditional banks often waive fees if you meet balance or direct deposit requirements. Run your statement through Leaky Wallet first to see what you\'re currently paying.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function BankFeeCheckerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Bank Fee Checker — Find Every Hidden Fee in Your Statement
        </h1>

        <p className="text-lg text-muted-foreground">
          Bank fees are some of the most recoverable money leaks. Monthly account fees, ATM charges,
          foreign transaction fees, and overdraft penalties add up to hundreds of dollars a year —
          and most are avoidable if you know they&apos;re there.
        </p>

        <p className="rounded-lg border border-amber-200/60 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20 px-4 py-3 text-sm font-medium flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <span>The average person pays $150–$450 in bank fees per year. Most don&apos;t know it because fees hide in transaction lists under generic codes.</span>
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Check Your Bank Fees Now</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — see every fee you&apos;re paying in 30 seconds</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Check My Bank Fees Free</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Bank Fees to Look For — and How to Avoid Them</h2>
          <div className="space-y-5">
            {feeTypes.map(({ fee, avoidable, tip }) => (
              <div key={fee} className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-medium text-foreground">{fee}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${avoidable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                    {avoidable ? 'Often avoidable' : 'Hard to avoid'}
                  </span>
                </div>
                <p className="text-muted-foreground pl-6">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/money-management" className="text-primary hover:underline">Money Management</Link>
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
        </nav>
      </article>
    </main>
  )
}
