import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Where Did My Money Go? – Find Out in 30 Seconds',
  description: "Find out where your money went. Upload your bank statement and instantly see every place your money went this month — subscriptions, fees, dining, shopping, and every hidden charge.",
  alternates: { canonical: 'https://whereismymoneygo.com/where-did-my-money-go' },
  openGraph: {
    title: "Where Did My Money Go? – Find Out in 30 Seconds",
    description: "Upload your bank statement to see exactly where your money went — subscriptions, fees, dining, shopping, and every hidden charge. Free, instant, private.",
    type: 'website', url: 'https://whereismymoneygo.com/where-did-my-money-go', siteName: 'Leaky Wallet',
  },
}

const culprits = [
  { name: 'Subscriptions you forgot about', example: 'The free trial that became a $14.99/month charge six months ago' },
  { name: 'Price increases you never noticed', example: 'Netflix went from $13.99 to $22.99 and you\'re still paying the new rate without realising the jump' },
  { name: 'Small recurring charges', example: '$4.99 here, $7.99 there — each invisible alone, together $40–$80/month' },
  { name: 'Foreign currency transaction fees', example: 'Every USD-priced subscription costs your bank\'s FX fee on top — typically 2–3%' },
  { name: 'Dining and delivery creep', example: 'Uber Eats and DoorDash adding $15–$30 per order, 3–4 times a week' },
  { name: 'Duplicate services', example: 'Two music apps, three cloud storage plans, two antivirus subscriptions' },
  { name: 'Unused memberships', example: 'Gym still charging $60/month since January even though you stopped going' },
  { name: 'Bank fees you could avoid', example: 'Monthly account fees that can be waived with a minimum balance you might qualify for' },
]

const faqs = [
  { q: 'Why doesn\'t my salary stretch as far as it should?', a: 'The gap between what you earn and what you save is usually made up of small, recurring charges that add up invisibly. Subscriptions, fees, and habitual spending (dining, delivery, impulse buys) are the most common culprits. An actual bank statement analysis — not estimates — reveals the exact breakdown.' },
  { q: 'How do I find out where my money is going?', a: 'The most accurate way is to look at your actual transactions. Export your bank statement as CSV or PDF and upload it to Leaky Wallet. In 30 seconds you get a complete spending breakdown by category, merchant, and pattern.' },
  { q: 'How much money do people typically recover after an analysis?', a: 'Most people who act on the results save $150–$600 per year. The typical breakdown: $80–$200 in forgotten subscriptions, $50–$150 in bank fees (some avoidable, some negotiable), and $100–$300 in spending optimizations.' },
  { q: 'What if I don\'t know where to start?', a: 'Start with subscriptions — they\'re the easiest wins. The analyzer lists every recurring charge with the merchant name, amount, and how long it\'s been running. Cancel the ones you don\'t recognize or no longer use and you\'ll see immediate results.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

export default function WhereDidMyMoneyGoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Where Did My Money Go? Find Out in 30 Seconds.
        </h1>

        <p className="text-lg text-muted-foreground">
          It&apos;s the end of the month, your account balance is lower than expected, and you can&apos;t
          account for all of it. You&apos;re not alone — most people can&apos;t account for 20–30% of their
          monthly spending. Here&apos;s how to find exactly where it went.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Find Out Where Your Money Went</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement — complete breakdown in 30 seconds</p>
          <Button asChild size="lg"><Link href="/"><Search className="mr-2 h-4 w-4" />Show Me Where My Money Went</Link></Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank worldwide</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">The Most Common Places Your Money Disappears</h2>
          <div className="space-y-4">
            {culprits.map(({ name, example }) => (
              <div key={name} className="space-y-0.5">
                <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{name}</p>
                <p className="text-xs text-muted-foreground pl-6 italic">&quot;{example}&quot;</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Get a Full Picture</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><span>Log in to your bank and download the last 90 days of transactions as CSV or PDF</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span><span>Upload to Leaky Wallet — no account, no connection, no data stored</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span><span>See every category, every merchant, every recurring charge — nothing hidden</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span><span>Act on the easy wins: cancel the forgotten ones, call about the fees, cut the duplicates</span></li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => (
            <div key={faq.q} className="space-y-1"><h3 className="font-medium">{faq.q}</h3><p className="text-sm text-muted-foreground">{faq.a}</p></div>
          ))}</div>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/where-is-my-money-going" className="text-primary hover:underline">Where Is My Money Going?</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/expense-calculator" className="text-primary hover:underline">Expense Calculator</Link>
          <Link href="/subscription-tracker" className="text-primary hover:underline">Subscription Tracker</Link>
        </nav>
      </article>
    </main>
  )
}
