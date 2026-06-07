import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Money Saving Tips – Data-Driven Ways to Cut Spending and Save More',
  description: 'Money saving tips based on real spending data. Upload your bank statement to identify your biggest spending leaks, then apply targeted tips to cut costs in the categories where you actually overspend.',
  alternates: { canonical: 'https://whereismymoneygo.com/money-saving-tips' },
  openGraph: {
    title: "Money Saving Tips – Find What's Already Draining Your Account First",
    description: 'The best money saving tips start with knowing where your money goes. Upload your bank statement and get personalized savings recommendations instantly.',
    type: 'website',
    url: 'https://whereismymoneygo.com/money-saving-tips',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What are the best ways to save money fast?', acceptedAnswer: { '@type': 'Answer', text: 'The fastest savings are from things already leaving your account: cancelled subscriptions ($150–$400/year), waived bank fees ($50–$200/year), and cancelled unused memberships. These require no behaviour change — just action.' } },
                { '@type': 'Question', name: 'How can I save money with a tight budget?', acceptedAnswer: { '@type': 'Answer', text: "Focus on eliminating unnecessary recurring charges first. Subscriptions you don't use are the easiest cuts because they require no lifestyle adjustment — you simply stop paying for things you're not using." } },
                { '@type': 'Question', name: 'How do I save money on subscriptions?', acceptedAnswer: { '@type': 'Answer', text: "Run a subscription audit by uploading your bank statement to Leaky Wallet. See every recurring charge, identify what you don't use, and cancel it. Then review remaining subscriptions for annual plan options (usually 20–40% cheaper)." } },
                { '@type': 'Question', name: 'What are small ways to save money every day?', acceptedAnswer: { '@type': 'Answer', text: "The highest-impact small actions: bring lunch to work 2–3 times a week ($150–$300/month saved), cancel one unused streaming service ($120–$240/year), use your bank's ATMs to avoid fees ($50–$100/year). The key is identifying which specific actions matter for your spending patterns." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Money Saving Tips — Personalized to Your Actual Spending
        </h1>

        <p className="text-lg text-muted-foreground">
          Generic money saving tips are useless if they don't match where you actually overspend. If your biggest leak is forgotten subscriptions, tips about cutting coffee won't help. Real savings come from identifying your actual spending patterns first.
        </p>

        <p className="text-muted-foreground">
          Upload your bank statement to get spending-pattern-specific tips — based on your real subscriptions, dining frequency, fee patterns, and month-over-month trends.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Get Your Personalized Savings Plan</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and get savings tips based on your actual spending — not generic advice.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Get My Savings Plan
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The Most Effective Money Saving Actions</h2>
          <ul className="space-y-3">
            <li key='Run a subscription audit first' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Run a subscription audit first</p>
              <p className="text-xs text-muted-foreground pl-6">The highest ROI savings action: cancel forgotten charges with zero behaviour change</p>
            </li>
            <li key='Switch delivery apps to weekly limits' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Switch delivery apps to weekly limits</p>
              <p className="text-xs text-muted-foreground pl-6">Capping delivery to 1–2x/week saves $100–$200/month for regular users</p>
            </li>
            <li key='Pay annual instead of monthly' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Pay annual instead of monthly</p>
              <p className="text-xs text-muted-foreground pl-6">Annual subscriptions typically cost 20–40% less than monthly billing</p>
            </li>
            <li key='Batch grocery shopping' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Batch grocery shopping</p>
              <p className="text-xs text-muted-foreground pl-6">More frequent small shops cost 30% more than weekly planned shops</p>
            </li>
            <li key='Use a comparison tool for recurring bills' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Use a comparison tool for recurring bills</p>
              <p className="text-xs text-muted-foreground pl-6">Electricity, internet, and insurance are often negotiable or switchable</p>
            </li>
            <li key='Automate savings on payday' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Automate savings on payday</p>
              <p className="text-xs text-muted-foreground pl-6">Transfer to savings before you can spend it — you adjust to the lower amount</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Apply Money Saving Tips Effectively</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Start with data, not estimates.</strong> Upload your bank statement to see exactly where your money goes. You'll find the real leaks — not the ones you expected.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Fix the invisible leaks first.</strong> Cancel subscriptions and fees before changing any spending habits. These are free savings.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Tackle the biggest discretionary category.</strong> Whether it's dining, shopping, or entertainment, pick one category and set a monthly limit.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Automate the savings you find.</strong> Redirect cancelled subscription amounts to savings automatically — 'pay yourself first' locks in the gains.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What are the best ways to save money fast?', a: 'The fastest savings are from things already leaving your account: cancelled subscriptions ($150–$400/year), waived bank fees ($50–$200/year), and cancelled unused memberships. These require no behaviour change — just action.' },
          { q: 'How can I save money with a tight budget?', a: "Focus on eliminating unnecessary recurring charges first. Subscriptions you don't use are the easiest cuts because they require no lifestyle adjustment — you simply stop paying for things you're not using." },
          { q: 'How do I save money on subscriptions?', a: "Run a subscription audit by uploading your bank statement to Leaky Wallet. See every recurring charge, identify what you don't use, and cancel it. Then review remaining subscriptions for annual plan options (usually 20–40% cheaper)." },
          { q: 'What are small ways to save money every day?', a: "The highest-impact small actions: bring lunch to work 2–3 times a week ($150–$300/month saved), cancel one unused streaming service ($120–$240/year), use your bank's ATMs to avoid fees ($50–$100/year). The key is identifying which specific actions matter for your spending patterns." },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/how-to-save-money" className="text-primary hover:underline">How to Save Money</Link>
          <Link href="/cancel-subscriptions" className="text-primary hover:underline">Cancel Subscriptions</Link>
          <Link href="/subscription-audit" className="text-primary hover:underline">Subscription Audit</Link>
          <Link href="/budget-planner" className="text-primary hover:underline">Budget Planner</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/money-saving-tips' />
    </main>
  )
}
