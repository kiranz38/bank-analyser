import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Why Am I Always Broke? – Find Out Where Your Money Actually Goes',
  description: "Find out why you're always broke despite earning good money. Upload your bank statement to see every subscription, fee, and spending category — the real answer is in your transactions.",
  alternates: { canonical: 'https://whereismymoneygo.com/why-am-i-always-broke' },
  openGraph: {
    title: 'Why Am I Always Broke? – See the Real Answer in Your Bank Statement',
    description: "The answer to 'why am I always broke?' is in your bank statement. Upload it and see exactly where your money goes each month. Free, instant.",
    type: 'website',
    url: 'https://whereismymoneygo.com/why-am-i-always-broke',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Why do I have no money even though I have a job?', acceptedAnswer: { '@type': 'Answer', text: "The most common reason is invisible recurring spending: subscriptions you've forgotten, price increases on existing services, dining and delivery spending that's crept up, and bank fees. Upload your bank statement to see the exact breakdown of where your money is going." } },
                { '@type': 'Question', name: 'How do I stop being broke?', acceptedAnswer: { '@type': 'Answer', text: 'Start by finding where the money goes. Upload your last 90 days of bank statements to see every transaction by category. Then cancel forgotten subscriptions (immediate savings), reduce the highest discretionary categories, and set up automatic savings from each paycheck.' } },
                { '@type': 'Question', name: 'Is it normal to run out of money before payday?', acceptedAnswer: { '@type': 'Answer', text: "It's common but not inevitable. The most frequent cause is that spending has crept up — especially subscriptions and dining — faster than income. An analysis of your real spending patterns is the fastest way to identify which specific categories are the problem." } },
                { '@type': 'Question', name: 'What should I do if I have no savings?', acceptedAnswer: { '@type': 'Answer', text: 'Start small: cancel one forgotten subscription and redirect that exact amount to savings via automatic transfer. Even $20–$50/month builds momentum. Most people find $100–$200/month in unnecessary charges when they analyze their bank statement properly.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Why Am I Always Broke? — The Answer Is in Your Bank Statement
        </h1>

        <p className="text-lg text-muted-foreground">
          If you earn a reasonable income but still run out of money before payday, you're not alone. The gap between income and financial comfort is almost never what you think it is — it's usually invisible recurring charges, lifestyle creep, and spending patterns you haven't looked at in months.
        </p>

        <p className="text-muted-foreground">
          The most honest answer to 'where did my money go?' comes from your actual transactions, not your memory. Upload your bank statement and see the complete picture in under 30 seconds.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find Out Why You're Always Broke</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — see the real answer in under 30 seconds.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Find Out Where My Money Goes
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The Real Reasons You Run Out of Money</h2>
          <ul className="space-y-3">
            <li key='Subscription creep' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscription creep</p>
              <p className="text-xs text-muted-foreground pl-6">Each new service seems small — $9.99 here, $14.99 there — but together they're $200–$400/month</p>
            </li>
            <li key='Lifestyle inflation' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Lifestyle inflation</p>
              <p className="text-xs text-muted-foreground pl-6">Spending rises to match or exceed income increases, leaving nothing to save</p>
            </li>
            <li key='Food delivery and dining' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Food delivery and dining</p>
              <p className="text-xs text-muted-foreground pl-6">One of the fastest-growing budget categories — often 2–3x what people estimate</p>
            </li>
            <li key='Invisible fee charges' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Invisible fee charges</p>
              <p className="text-xs text-muted-foreground pl-6">Monthly account fees, ATM fees, foreign transaction fees that add up quietly</p>
            </li>
            <li key='Impulse spending' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Impulse spending</p>
              <p className="text-xs text-muted-foreground pl-6">Small unplanned purchases that aren't budgeted for but appear regularly</p>
            </li>
            <li key='No emergency buffer' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />No emergency buffer</p>
              <p className="text-xs text-muted-foreground pl-6">Without savings, any unexpected expense creates a shortfall that takes months to recover from</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Find Out Exactly Why You're Broke</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Get the real data.</strong> Upload your bank statement to Leaky Wallet — every transaction is categorized and every recurring charge is surfaced. No guessing.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Find the biggest leaks first.</strong> Subscriptions and fees often account for $200–$400/month in spending people didn't realize they had.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Look at the habit categories.</strong> Dining, delivery, and entertainment show the clearest spending patterns — and the easiest adjustments.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Cancel and redirect.</strong> Cancel subscriptions you don't use and redirect that money to savings automatically — before you can spend it.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Why do I have no money even though I have a job?', a: "The most common reason is invisible recurring spending: subscriptions you've forgotten, price increases on existing services, dining and delivery spending that's crept up, and bank fees. Upload your bank statement to see the exact breakdown of where your money is going." },
          { q: 'How do I stop being broke?', a: 'Start by finding where the money goes. Upload your last 90 days of bank statements to see every transaction by category. Then cancel forgotten subscriptions (immediate savings), reduce the highest discretionary categories, and set up automatic savings from each paycheck.' },
          { q: 'Is it normal to run out of money before payday?', a: "It's common but not inevitable. The most frequent cause is that spending has crept up — especially subscriptions and dining — faster than income. An analysis of your real spending patterns is the fastest way to identify which specific categories are the problem." },
          { q: 'What should I do if I have no savings?', a: 'Start small: cancel one forgotten subscription and redirect that exact amount to savings via automatic transfer. Even $20–$50/month builds momentum. Most people find $100–$200/month in unnecessary charges when they analyze their bank statement properly.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/where-did-my-money-go" className="text-primary hover:underline">Where Did My Money Go?</Link>
          <Link href="/stop-wasting-money" className="text-primary hover:underline">Stop Wasting Money</Link>
          <Link href="/how-to-save-money" className="text-primary hover:underline">How to Save Money</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/why-am-i-always-broke' />
    </main>
  )
}
