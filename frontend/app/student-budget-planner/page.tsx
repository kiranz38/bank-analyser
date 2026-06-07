import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Student Budget Planner – Free Spending Analysis for Students',
  description: 'Free student budget planner. Upload your bank statement to see exactly where your student budget is going — subscriptions, dining, transport, and fees — with a personalized plan to make your money last longer.',
  alternates: { canonical: 'https://whereismymoneygo.com/student-budget-planner' },
  openGraph: {
    title: 'Free Student Budget Planner – See Where Your Student Budget Goes',
    description: 'Upload your bank statement and see where your student budget goes — subscriptions, dining, fees — and get a plan to make it last longer. Free.',
    type: 'website',
    url: 'https://whereismymoneygo.com/student-budget-planner',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How should a student budget their money?', acceptedAnswer: { '@type': 'Answer', text: 'Start by seeing what you actually spend. Upload your bank statement to get a real breakdown. Then prioritize essentials (rent, groceries, transport) and find subscriptions and dining you can reduce. Aim to keep wants under 30% of income.' } },
                { '@type': 'Question', name: 'How much should a student spend on subscriptions?', acceptedAnswer: { '@type': 'Answer', text: "Ideally under $30–$50/month for all streaming and digital services. Most students have significantly more than this — often 2–3 streaming apps, a gaming subscription, and multiple app subscriptions they've forgotten. A statement audit typically finds $50–$100/month in unnecessary student subscriptions." } },
                { '@type': 'Question', name: 'What are the biggest money wasters for students?', acceptedAnswer: { '@type': 'Answer', text: 'Food delivery apps (fees add up fast), forgotten subscriptions from free trials, multiple streaming services, and buying coffee daily. A $5 coffee 5 days a week is $1,300/year — the impact becomes visible when you see it in your statement.' } },
                { '@type': 'Question', name: 'Is Leaky Wallet free for students?', acceptedAnswer: { '@type': 'Answer', text: "Yes — completely free with no account required. Upload your bank statement and get your full spending breakdown. No student discount needed — it's always free." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Student Budget Planner — Make Your Money Last Longer
        </h1>

        <p className="text-lg text-muted-foreground">
          Student finances are tight — every dollar counts. But student budgets are also where subscriptions and unnecessary charges accumulate fastest: free trial apps from orientation week, streaming services shared or not, dining apps used a few times, and forgotten monthly fees.
        </p>

        <p className="text-muted-foreground">
          Upload your bank statement and see exactly where your student budget is going. Most students find $50–$150/month in unnecessary charges — money that could cover groceries, textbooks, or rent.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Make Your Student Budget Work</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — see exactly where your student money goes.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Analyze My Student Budget
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Common Student Budget Drains</h2>
          <ul className="space-y-3">
            <li key='Streaming subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Streaming subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">Netflix, Stan, Disney+, Binge — multiple streaming apps costing $50–$80/month combined</p>
            </li>
            <li key='Food delivery apps' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Food delivery apps</p>
              <p className="text-xs text-muted-foreground pl-6">Uber Eats and DoorDash add $5–$10 in fees per order — 2x/week is $1,000+/year</p>
            </li>
            <li key='Gaming subscriptions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Gaming subscriptions</p>
              <p className="text-xs text-muted-foreground pl-6">PlayStation Plus, Xbox Game Pass, in-game purchases that recur monthly</p>
            </li>
            <li key='Cloud storage' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Cloud storage</p>
              <p className="text-xs text-muted-foreground pl-6">Multiple plans across Apple iCloud, Google Drive, and Dropbox</p>
            </li>
            <li key='Bank fees' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Bank fees</p>
              <p className="text-xs text-muted-foreground pl-6">Student accounts should have zero fees — check if you're on the right account</p>
            </li>
            <li key='Free trial auto-renewals' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Free trial auto-renewals</p>
              <p className="text-xs text-muted-foreground pl-6">Apps downloaded for assignments that converted to paid and kept charging</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Build a Student Budget That Works</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>See your real spending first.</strong> Upload your bank statement — even just 30 days — to see exactly where your money goes.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Cancel what you don't use.</strong> Any subscription you haven't used this month is a candidate for cancellation.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Set realistic limits by category.</strong> Dining, entertainment, and transport are the most controllable categories.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Check your bank account type.</strong> Make sure you're on a student account with zero monthly fees — most banks offer these.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How should a student budget their money?', a: 'Start by seeing what you actually spend. Upload your bank statement to get a real breakdown. Then prioritize essentials (rent, groceries, transport) and find subscriptions and dining you can reduce. Aim to keep wants under 30% of income.' },
          { q: 'How much should a student spend on subscriptions?', a: "Ideally under $30–$50/month for all streaming and digital services. Most students have significantly more than this — often 2–3 streaming apps, a gaming subscription, and multiple app subscriptions they've forgotten. A statement audit typically finds $50–$100/month in unnecessary student subscriptions." },
          { q: 'What are the biggest money wasters for students?', a: 'Food delivery apps (fees add up fast), forgotten subscriptions from free trials, multiple streaming services, and buying coffee daily. A $5 coffee 5 days a week is $1,300/year — the impact becomes visible when you see it in your statement.' },
          { q: 'Is Leaky Wallet free for students?', a: "Yes — completely free with no account required. Upload your bank statement and get your full spending breakdown. No student discount needed — it's always free." },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/budget-planner" className="text-primary hover:underline">Budget Planner</Link>
          <Link href="/cancel-subscriptions" className="text-primary hover:underline">Cancel Subscriptions</Link>
          <Link href="/how-to-save-money" className="text-primary hover:underline">How to Save Money</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/student-budget-planner' />
    </main>
  )
}
