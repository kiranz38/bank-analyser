import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid, Lock, CheckCircle, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bank Connect – Automatic Statement Analysis (Coming Soon)',
  description: 'Connect your bank directly for automatic statement analysis. Powered by Plaid, available in the US and UK. Join the waitlist for early access.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/banks',
  },
  openGraph: {
    title: 'Bank Connect – Leaky Wallet',
    description: 'Automatic bank statement analysis with secure read-only access. Coming soon to US and UK.',
    type: 'website',
    url: 'https://whereismymoneygo.com/banks',
  },
}

const steps = [
  { icon: LayoutGrid, title: '1. Select Your Bank', description: 'Choose from thousands of supported banks in the US and UK.' },
  { icon: Lock, title: '2. Secure Login', description: "Log in through Plaid's secure interface. We never see your credentials." },
  { icon: CheckCircle, title: '3. Instant Analysis', description: 'Your transactions are analyzed automatically. Get results in seconds.' },
]

const securityItems = [
  { title: 'Read-Only Access', description: 'We can only view transactions. No ability to move money or make changes.' },
  { title: 'Powered by Plaid', description: 'The same infrastructure used by Venmo, Coinbase, and thousands of financial apps.' },
  { title: 'No Credential Storage', description: 'We never see or store your bank login. Authentication happens directly with Plaid.' },
  { title: 'Disconnect Anytime', description: "Revoke access instantly from your bank's website or our dashboard." },
]

const regions = [
  { flag: '\u{1F1FA}\u{1F1F8}', name: 'United States', status: 'Beta', available: true, description: '5,000+ banks supported including Chase, Bank of America, Wells Fargo, and more.' },
  { flag: '\u{1F1EC}\u{1F1E7}', name: 'United Kingdom', status: 'Beta', available: true, description: 'Major UK banks including Barclays, HSBC, Lloyds, NatWest, and more.' },
  { flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia', status: 'Coming Soon', available: false, description: 'Join the waitlist to be notified when we add Australian banks.' },
  { flag: '\u{1F1E8}\u{1F1E6}', name: 'Canada', status: 'Coming Soon', available: false, description: 'Canadian bank support is planned for later this year.' },
]

const faqs = [
  { q: 'Is Bank Connect free?', a: 'Yes, Bank Connect will be free during the beta period.' },
  { q: "What if my bank isn't supported?", a: 'You can always use the manual upload option. Export a CSV or PDF from your bank and upload it directly. This works with any bank worldwide.' },
  { q: 'Can I disconnect my bank later?', a: "Absolutely. You can revoke Plaid access at any time through your bank's connected apps settings or directly through our site." },
  { q: 'What data do you access?', a: "Only transaction data: dates, descriptions, and amounts. We don't access account numbers, balances, or personal information beyond what's needed for analysis." },
]

export default function BanksPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-3">Coming Soon</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bank Connect</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Skip the manual upload. Connect your bank directly and get automatic
            spending analysis with read-only access.
          </p>
        </div>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How Bank Connect Works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title}>
                <CardContent className="space-y-2 pt-6 text-center">
                  <step.icon className="mx-auto h-6 w-6 text-primary" />
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Bank-Level Security</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {securityItems.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg border p-4">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Availability */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Availability</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {regions.map((region) => (
              <Card key={region.name} className={!region.available ? 'opacity-70' : ''}>
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">{region.flag}</span>
                    <span className="font-semibold">{region.name}</span>
                    <Badge variant={region.available ? 'default' : 'secondary'} className="ml-auto text-xs">
                      {region.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{region.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="space-y-3 text-center">
          <h2 className="text-xl font-semibold">Join the Waitlist</h2>
          <p className="text-muted-foreground">
            Bank Connect is currently in beta. Join the waitlist to get early access
            when it&apos;s available in your region.
          </p>
          <Button asChild size="lg">
            <Link href="/">Get Started</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Or <Link href="/" className="text-primary hover:underline">upload a statement manually</Link> - works with any bank worldwide.
          </p>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="space-y-1">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">
                  {faq.a}
                  {faq.q.includes('free') && (
                    <> See our <Link href="/pricing" className="text-primary hover:underline">pricing page</Link> for details.</>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
