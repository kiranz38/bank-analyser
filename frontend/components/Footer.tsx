import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const tools = [
  { label: 'Bank Statement Analyzer', href: '/bank-statement-analyzer' },
  { label: 'Find Hidden Subscriptions', href: '/find-hidden-subscriptions' },
  { label: 'Subscription Tracker', href: '/subscription-tracker' },
  { label: 'Recurring Payments Finder', href: '/recurring-payments' },
  { label: 'Cancel Subscriptions Guide', href: '/cancel-subscriptions' },
  { label: 'Spending Tracker', href: '/spending-tracker' },
  { label: 'Expense Calculator', href: '/expense-calculator' },
  { label: 'Budget Calculator', href: '/budget-calculator' },
  { label: 'Monthly Expense Tracker', href: '/monthly-expense-tracker' },
  { label: 'Bank Fee Checker', href: '/bank-fee-checker' },
  { label: 'Personal Finance Tracker', href: '/personal-finance-tracker' },
  { label: 'Money Management', href: '/money-management' },
  { label: 'Financial Health Check', href: '/financial-health-check' },
  { label: 'Where Did My Money Go', href: '/where-did-my-money-go' },
  { label: 'Where Is My Money Going', href: '/where-is-my-money-going' },
]

const australiaBanks = [
  { label: 'ANZ Statement Analyzer', href: '/anz-bank-statement-analyzer' },
  { label: 'CommBank Statement Analyzer', href: '/commbank-statement-analyzer' },
  { label: 'Westpac Statement Analyzer', href: '/westpac-statement-analyzer' },
  { label: 'NAB Statement Analyzer', href: '/nab-bank-statement-analyzer' },
]

const globalBanks = [
  { label: 'Chase Statement Analyzer', href: '/chase-bank-statement-analyzer' },
  { label: 'Bank of America Analyzer', href: '/bank-of-america-statement-analyzer' },
  { label: 'Wells Fargo Analyzer', href: '/wells-fargo-statement-analyzer' },
  { label: 'Barclays Statement Analyzer', href: '/barclays-statement-analyzer' },
  { label: 'HSBC Statement Analyzer', href: '/hsbc-statement-analyzer' },
  { label: 'TD Bank Analyzer', href: '/td-bank-statement-analyzer' },
  { label: 'ANZ NZ Statement Analyzer', href: '/anz-nz-statement-analyzer' },
]

const regions = [
  { label: 'Bank Analyzer – Australia', href: '/bank-statement-analyzer-australia' },
  { label: 'Bank Analyzer – USA', href: '/bank-statement-analyzer-usa' },
  { label: 'Bank Analyzer – UK', href: '/bank-statement-analyzer-uk' },
  { label: 'Bank Analyzer – Canada', href: '/bank-statement-analyzer-canada' },
  { label: 'Bank Analyzer – New Zealand', href: '/bank-statement-analyzer-new-zealand' },
]

const product = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Example Report', href: '/example' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Bank Connect', href: '/banks' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12">

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand + product */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold">Leaky Wallet</Link>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Free bank statement analyzer. Find hidden subscriptions, spending leaks, and bank fees — privately and instantly.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">For informational purposes only. Not financial advice.</p>
            <nav className="mt-4 flex flex-col gap-1.5">
              {product.map(({ label, href }) => (
                <Link key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
              ))}
            </nav>
            <p className="mt-4 text-xs text-muted-foreground">
              <a href="mailto:support@whereismymoneygo.com" className="hover:text-foreground transition-colors">
                support@whereismymoneygo.com
              </a>
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Free Tools</h4>
            <nav className="flex flex-col gap-1.5">
              {tools.map(({ label, href }) => (
                <Link key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
              ))}
            </nav>
          </div>

          {/* Australian banks */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Australian Banks</h4>
            <nav className="flex flex-col gap-1.5">
              {australiaBanks.map(({ label, href }) => (
                <Link key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
              ))}
            </nav>
            <h4 className="mb-3 mt-6 text-sm font-semibold">Countries</h4>
            <nav className="flex flex-col gap-1.5">
              {regions.map(({ label, href }) => (
                <Link key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
              ))}
            </nav>
          </div>

          {/* Global banks */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Global Banks</h4>
            <nav className="flex flex-col gap-1.5">
              {globalBanks.map(({ label, href }) => (
                <Link key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center gap-3 text-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            <span>We never store your financial data. Analysis runs in memory only.</span>
          </div>
          <p>&copy; {currentYear} Leaky Wallet · whereismymoneygo.com</p>
        </div>
      </div>
    </footer>
  )
}
