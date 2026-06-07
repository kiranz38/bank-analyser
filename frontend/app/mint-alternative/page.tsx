import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Search } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SeoInternalLinks } from '@/components/SeoInternalLinks'

export const metadata: Metadata = {
  title: 'Mint Alternative – No Account Linking, No Ongoing Access, Just Upload',
  description: 'A privacy-first Mint alternative. Upload your bank statement CSV or PDF instead of linking your bank account. Get instant spending analysis, subscription detection, and savings recommendations — no persistent access required.',
  alternates: { canonical: 'https://whereismymoneygo.com/mint-alternative' },
  openGraph: {
    title: 'Free Mint Alternative – Analyze Your Bank Statement Without Linking Your Account',
    description: "A free Mint alternative that doesn't require linking your bank account. Upload your statement for instant spending analysis. Private, no signup.",
    type: 'website',
    url: 'https://whereismymoneygo.com/mint-alternative',
    siteName: 'Leaky Wallet',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is Leaky Wallet a good Mint replacement?', acceptedAnswer: { '@type': 'Answer', text: 'For spending analysis, subscription detection, and savings recommendations, yes. Leaky Wallet provides the same core analysis without requiring bank account linking. The main difference: you upload your statement manually each time rather than having automatic sync.' } },
                { '@type': 'Question', name: 'Why would I use an alternative to Mint?', acceptedAnswer: { '@type': 'Answer', text: "Privacy concerns about permanent bank account access, Mint's shutdown or service changes, banks not supported by Mint, or simply preferring not to share bank credentials with third-party apps." } },
                { '@type': 'Question', name: 'How is Leaky Wallet different from Mint?', acceptedAnswer: { '@type': 'Answer', text: 'Mint requires linking your bank account for ongoing transaction access. Leaky Wallet works from a one-time file upload — you export your statement and upload it. No bank credentials shared, no ongoing account access, no data retained after analysis.' } },
                { '@type': 'Question', name: 'Does Leaky Wallet sync with my bank automatically?', acceptedAnswer: { '@type': 'Answer', text: "No — and that's by design. Instead of automatic sync, you upload your statement when you want an analysis. This means your bank account is never accessed directly and your data is not held long-term." } }
  ],
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd schema={faqSchema} />
      <article className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          A Mint Alternative That Doesn't Need Your Bank Login
        </h1>

        <p className="text-lg text-muted-foreground">
          Mint and similar apps require you to link your bank account permanently — giving them ongoing read access to your transactions. If you're uncomfortable with that, there's a better way: upload your bank statement as a file instead.
        </p>

        <p className="text-muted-foreground">
          Leaky Wallet does everything Mint does for spending analysis — subscriptions, categories, trends, savings recommendations — without requiring your bank credentials or ongoing account access. Upload once, get your insights, your data is deleted.
        </p>

        <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
          <h2 className="text-lg font-semibold">Try the Privacy-First Bank Analyzer</h2>
          <p className="text-sm text-muted-foreground">Upload your bank statement and get the same insights as Mint — without linking your bank account.</p>
          <Button asChild size="lg">
            <Link href="/?start=upload">
              <Search className="mr-2 h-4 w-4" />
              Analyze Without Linking My Bank
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free · No signup · Works with any bank</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why Choose a Mint Alternative Without Account Linking</h2>
          <ul className="space-y-3">
            <li key='No bank credentials required' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />No bank credentials required</p>
              <p className="text-xs text-muted-foreground pl-6">You never share your username or password — just a statement export file</p>
            </li>
            <li key='No ongoing access to your account' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />No ongoing access to your account</p>
              <p className="text-xs text-muted-foreground pl-6">Your bank account remains completely private after each analysis</p>
            </li>
            <li key='No third-party data sharing' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />No third-party data sharing</p>
              <p className="text-xs text-muted-foreground pl-6">Apps with bank access often share anonymized data with partners and advertisers</p>
            </li>
            <li key="Works even if your bank isn't supported" className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Works even if your bank isn't supported</p>
              <p className="text-xs text-muted-foreground pl-6">File-based analysis works with any bank worldwide, not just supported institutions</p>
            </li>
            <li key='No app to install or update' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />No app to install or update</p>
              <p className="text-xs text-muted-foreground pl-6">Works directly in your browser — no download required</p>
            </li>
            <li key='Instant, not polling' className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />Instant, not polling</p>
              <p className="text-xs text-muted-foreground pl-6">Results in 30 seconds vs waiting for transaction sync</p>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to Use Leaky Wallet as a Mint Alternative</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li key="1" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span><strong>Export your bank statement.</strong> Log in to your bank's website, go to Transaction History, and download as CSV or PDF.</span>
            </li>
            <li key="2" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span><strong>Upload to Leaky Wallet.</strong> Drop your file — no account creation, no bank account linking required.</span>
            </li>
            <li key="3" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span><strong>Get your analysis.</strong> Subscriptions, categories, trends, and savings recommendations — same as Mint, without the data sharing.</span>
            </li>
            <li key="4" className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span><strong>Upload monthly for ongoing tracking.</strong> Re-upload each month's statement for continuous spending insight — you control when and what you share.</span>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is Leaky Wallet a good Mint replacement?', a: 'For spending analysis, subscription detection, and savings recommendations, yes. Leaky Wallet provides the same core analysis without requiring bank account linking. The main difference: you upload your statement manually each time rather than having automatic sync.' },
          { q: 'Why would I use an alternative to Mint?', a: "Privacy concerns about permanent bank account access, Mint's shutdown or service changes, banks not supported by Mint, or simply preferring not to share bank credentials with third-party apps." },
          { q: 'How is Leaky Wallet different from Mint?', a: 'Mint requires linking your bank account for ongoing transaction access. Leaky Wallet works from a one-time file upload — you export your statement and upload it. No bank credentials shared, no ongoing account access, no data retained after analysis.' },
          { q: 'Does Leaky Wallet sync with my bank automatically?', a: "No — and that's by design. Instead of automatic sync, you upload your statement when you want an analysis. This means your bank account is never accessed directly and your data is not held long-term." },
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
          <Link href="/ynab-alternative" className="text-primary hover:underline">YNAB Alternative</Link>
        </nav>
      </article>
      <SeoInternalLinks currentPath='/mint-alternative' />
    </main>
  )
}
