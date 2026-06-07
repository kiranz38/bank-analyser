import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: '50/30/20 Budget Rule – Apply the Rule Using Your Real Bank Data',
  description: 'Apply the 50/30/20 budget rule using your actual bank statement. Upload your CSV or PDF to see how your real spending compares to the 50/30/20 breakdown — needs, wants, and savings.',
  alternates: { canonical: 'https://whereismymoneygo.com/50-30-20-rule' },
  openGraph: {
    title: '50/30/20 Budget Rule – See If Your Spending Follows It',
    description: 'Upload your bank statement and see how your spending compares to the 50/30/20 rule — needs, wants, and savings — based on real data.',
    type: 'website',
    url: 'https://whereismymoneygo.com/50-30-20-rule',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Does the 50/30/20 rule work for everyone?', acceptedAnswer: { '@type': 'Answer', text: "It's a guideline, not a rigid rule. In high-cost cities, needs may naturally consume 60–70% of income. The principle — spend less than you earn and save intentionally — applies universally even if the percentages need adjusting." } },
                { '@type': 'Question', name: 'How do subscriptions affect the 50/30/20 rule?', acceptedAnswer: { '@type': 'Answer', text: "Subscriptions sit in the 'wants' category. The average person spends $350–$600/year on subscriptions — that's $30–$50/month eating directly into the 30% wants budget. Upload your bank statement to see your exact subscription spend." } },
                { '@type': 'Question', name: 'What if my needs are more than 50%?', acceptedAnswer: { '@type': 'Answer', text: 'This is common, especially in expensive cities or with high rent. Focus on reducing your wants category first — especially subscriptions and dining — and build up to the 20% savings target over time.' } },
                { '@type': 'Question', name: 'How do I calculate 50/30/20 from my bank statement?', acceptedAnswer: { '@type': 'Answer', text: "Upload your bank statement to Leaky Wallet and you'll get a spending breakdown by category. The analyzer separates fixed costs (needs), discretionary spending (wants), and shows your savings rate automatically." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The 50/30/20 Rule — Check Your Real Spending Against It
        </h1>

        <p className="text-lg text-muted-foreground">
          The 50/30/20 rule divides your after-tax income into three buckets: 50% for needs (rent, food, utilities), 30% for wants (dining, entertainment, subscriptions), and 20% for savings and debt repayment. It's the most popular budgeting framework for a reason — it's simple and flexible.
        </p>

        <p className="text-muted-foreground">
          But the rule only works if you know your real spending. Most people are surprised to find their 'wants' category is 50% or more of income — driven largely by subscriptions they forgot about and dining that's crept up over time.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Check Your 50/30/20 Split</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and see how your real spending compares to the rule.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Check My 50/30/20 Split
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What Counts as Needs vs Wants</h2>
          <ul className="space-y-3">
            <li key='Needs (50%): rent/mortgage, utilities, groceries' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Needs (50%): rent/mortgage, utilities, groceries</p>
              <p className="text-xs text-muted-foreground pl-6">Non-negotiable essentials — you can't easily cut these</p>
            </li>
            <li key='Needs (50%): transport, insurance, loan repayments' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Needs (50%): transport, insurance, loan repayments</p>
              <p className="text-xs text-muted-foreground pl-6">Fixed obligations that must be paid</p>
            </li>
            <li key='Wants (30%): dining out and takeaway' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Wants (30%): dining out and takeaway</p>
              <p className="text-xs text-muted-foreground pl-6">Often the fastest-growing category — easy to underestimate</p>
            </li>
            <li key='Wants (30%): streaming and subscription services' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Wants (30%): streaming and subscription services</p>
              <p className="text-xs text-muted-foreground pl-6">The average person has 7+ subscriptions costing $300–$500/year</p>
            </li>
            <li key='Wants (30%): entertainment, hobbies, shopping' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Wants (30%): entertainment, hobbies, shopping</p>
              <p className="text-xs text-muted-foreground pl-6">Discretionary spending that can be adjusted</p>
            </li>
            <li key='Savings (20%): emergency fund, investments, extra debt payments' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Savings (20%): emergency fund, investments, extra debt payments</p>
              <p className="text-xs text-muted-foreground pl-6">The most commonly skipped category when spending creeps up</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Apply the 50/30/20 Rule</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Find your after-tax income.</strong> This is your take-home pay — the amount that hits your bank account each month, not your gross salary.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>See your real spending by category.</strong> Upload your bank statement to get an automatic breakdown of needs, wants, and savings — no manual sorting required.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Compare to the targets.</strong> Are your needs above 50%? Is your wants bucket bloated with forgotten subscriptions? The analyzer shows exactly where you're over or under.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Adjust the big leaks first.</strong> Subscriptions and dining are usually the easiest to cut. Reducing wants by even 5–10% creates significant savings.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Does the 50/30/20 rule work for everyone?', a: "It's a guideline, not a rigid rule. In high-cost cities, needs may naturally consume 60–70% of income. The principle — spend less than you earn and save intentionally — applies universally even if the percentages need adjusting." },
          { q: 'How do subscriptions affect the 50/30/20 rule?', a: "Subscriptions sit in the 'wants' category. The average person spends $350–$600/year on subscriptions — that's $30–$50/month eating directly into the 30% wants budget. Upload your bank statement to see your exact subscription spend." },
          { q: 'What if my needs are more than 50%?', a: 'This is common, especially in expensive cities or with high rent. Focus on reducing your wants category first — especially subscriptions and dining — and build up to the 20% savings target over time.' },
          { q: 'How do I calculate 50/30/20 from my bank statement?', a: "Upload your bank statement to Leaky Wallet and you'll get a spending breakdown by category. The analyzer separates fixed costs (needs), discretionary spending (wants), and shows your savings rate automatically." },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/how-to-budget" className="text-primary hover:underline">How to Budget</Link>
          <Link href="/budget-calculator" className="text-primary hover:underline">Budget Calculator</Link>
          <Link href="/spending-tracker" className="text-primary hover:underline">Spending Tracker</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/50-30-20-rule' />
    </main>
  )
}
