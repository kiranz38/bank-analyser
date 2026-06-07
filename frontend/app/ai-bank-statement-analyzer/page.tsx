import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'AI Bank Statement Analyzer – Automatic Transaction Analysis & Insights',
  description: 'Free AI bank statement analyzer. Upload your CSV or PDF and AI automatically categorizes every transaction, detects subscriptions, identifies fees, and generates a personalized savings plan — in under 30 seconds.',
  alternates: { canonical: 'https://whereismymoneygo.com/ai-bank-statement-analyzer' },
  openGraph: {
    title: 'Free AI Bank Statement Analyzer – Instant Spending Insights',
    description: 'Upload your bank statement and AI analyzes every transaction — subscriptions, fees, spending patterns, and savings opportunities — instantly and privately.',
    type: 'website',
    url: 'https://whereismymoneygo.com/ai-bank-statement-analyzer',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How does AI analyze a bank statement?', acceptedAnswer: { '@type': 'Answer', text: "Leaky Wallet's AI reads each transaction description and amount, matches them against known merchant patterns, groups recurring charges by subscription pattern, and categorizes spending across 15+ categories. It then generates insights based on your specific patterns — not generic averages." } },
                { '@type': 'Question', name: 'Is an AI bank statement analyzer accurate?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — AI is significantly more accurate than manual review because it normalizes merchant names (handling abbreviations and payment processor prefixes), detects patterns across 90+ days of data, and identifies annual and quarterly charges that are easy to miss.' } },
                { '@type': 'Question', name: 'Is my data safe when using AI analysis?', acceptedAnswer: { '@type': 'Answer', text: 'Your bank statement is processed in server memory and immediately deleted after analysis. The AI model never stores your financial data or uses it for training. No account numbers, names, or balances are retained.' } },
                { '@type': 'Question', name: 'What AI model powers the analysis?', acceptedAnswer: { '@type': 'Answer', text: 'The analyzer uses Claude (by Anthropic) for transaction enrichment and savings strategy generation, with multiple AI providers for redundancy. All AI calls use only anonymized, aggregated spending data — never raw transaction details.' } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          AI Bank Statement Analyzer — Automatic Insights in 30 Seconds
        </h1>

        <p className="text-lg text-muted-foreground">
          Leaky Wallet uses AI to analyze every transaction in your bank statement — automatically categorizing spending, detecting subscription patterns, identifying unusual charges, and generating a personalized savings plan. No manual sorting, no category entry, no spreadsheets.
        </p>

        <p className="text-muted-foreground">
          Unlike tools that require you to link your bank account permanently, this analyzer works from a one-time file upload. Upload your statement, get your insights, then your data is deleted. No ongoing access to your account required.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Try the AI Bank Statement Analyzer</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and see what AI finds in your spending — instant, private, free.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Analyze With AI
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What AI Analysis Finds That You'd Miss Manually</h2>
          <ul className="space-y-3">
            <li key='Normalized merchant names' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Normalized merchant names</p>
              <p className="text-xs text-muted-foreground pl-6">'AMZN*PRIME' and 'AMAZON PRIME VIDEO' grouped as the same subscription</p>
            </li>
            <li key='Subscription recurrence patterns' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Subscription recurrence patterns</p>
              <p className="text-xs text-muted-foreground pl-6">AI detects monthly, quarterly, and annual charges across 90+ days of data</p>
            </li>
            <li key='Price change detection' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Price change detection</p>
              <p className="text-xs text-muted-foreground pl-6">Identifies when a subscription amount changed — often without any notification</p>
            </li>
            <li key='Spending category insights' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Spending category insights</p>
              <p className="text-xs text-muted-foreground pl-6">Every transaction automatically sorted into 15+ spending categories</p>
            </li>
            <li key='Cheaper alternative suggestions' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Cheaper alternative suggestions</p>
              <p className="text-xs text-muted-foreground pl-6">AI recommends lower-cost alternatives for subscriptions and services</p>
            </li>
            <li key='Financial health scoring' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Financial health scoring</p>
              <p className="text-xs text-muted-foreground pl-6">How your spending compares to recommended ratios for your income level</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How the AI Analysis Works</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Upload your statement.</strong> Drop your bank statement CSV or PDF — the AI processes it in server memory.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>AI reads every transaction.</strong> Each charge is identified, categorized, and checked against subscription patterns across 90+ days.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Subscriptions are detected and grouped.</strong> Recurring charges are grouped by merchant, with frequency, amount, and total yearly cost.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Your personalized plan is generated.</strong> The AI creates a specific action plan: subscriptions to cancel, fees to avoid, and projected yearly savings.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How does AI analyze a bank statement?', a: "Leaky Wallet's AI reads each transaction description and amount, matches them against known merchant patterns, groups recurring charges by subscription pattern, and categorizes spending across 15+ categories. It then generates insights based on your specific patterns — not generic averages." },
          { q: 'Is an AI bank statement analyzer accurate?', a: 'Yes — AI is significantly more accurate than manual review because it normalizes merchant names (handling abbreviations and payment processor prefixes), detects patterns across 90+ days of data, and identifies annual and quarterly charges that are easy to miss.' },
          { q: 'Is my data safe when using AI analysis?', a: 'Your bank statement is processed in server memory and immediately deleted after analysis. The AI model never stores your financial data or uses it for training. No account numbers, names, or balances are retained.' },
          { q: 'What AI model powers the analysis?', a: 'The analyzer uses Claude (by Anthropic) for transaction enrichment and savings strategy generation, with multiple AI providers for redundancy. All AI calls use only anonymized, aggregated spending data — never raw transaction details.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-t pt-4">
          <Link href="/bank-statement-analyzer" className="text-primary hover:underline">Bank Statement Analyzer</Link>
          <Link href="/find-hidden-subscriptions" className="text-primary hover:underline">Find Hidden Subscriptions</Link>
          <Link href="/automatic-expense-categorization" className="text-primary hover:underline">Automatic Expense Categorization</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/ai-bank-statement-analyzer' />
    </main>
  )
}
