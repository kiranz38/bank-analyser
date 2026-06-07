import Link from 'next/link'

interface LinkGroup {
  heading: string
  links: { href: string; label: string }[]
}

const LINK_GROUPS: LinkGroup[] = [
  {
    heading: 'Popular Tools',
    links: [
      { href: '/bank-statement-analyzer', label: 'Bank Statement Analyzer' },
      { href: '/find-hidden-subscriptions', label: 'Find Hidden Subscriptions' },
      { href: '/subscription-tracker', label: 'Subscription Tracker' },
      { href: '/spending-tracker', label: 'Spending Tracker' },
      { href: '/where-is-my-money-going', label: 'Where Is My Money Going?' },
      { href: '/where-did-my-money-go', label: 'Where Did My Money Go?' },
      { href: '/bank-fee-checker', label: 'Bank Fee Checker' },
      { href: '/recurring-payments', label: 'Recurring Payments Finder' },
      { href: '/cancel-subscriptions', label: 'Cancel Subscriptions' },
      { href: '/financial-health-check', label: 'Financial Health Check' },
    ],
  },
  {
    heading: 'Finance Trackers',
    links: [
      { href: '/personal-finance-tracker', label: 'Personal Finance Tracker' },
      { href: '/monthly-expense-tracker', label: 'Monthly Expense Tracker' },
      { href: '/expense-calculator', label: 'Expense Calculator' },
      { href: '/budget-calculator', label: 'Budget Calculator' },
      { href: '/money-management', label: 'Money Management' },
      { href: '/anz-nz-statement-analyzer', label: 'ANZ NZ Analyzer' },
    ],
  },
  {
    heading: 'By Country',
    links: [
      { href: '/bank-statement-analyzer-australia', label: 'Australia' },
      { href: '/bank-statement-analyzer-usa', label: 'United States' },
      { href: '/bank-statement-analyzer-uk', label: 'United Kingdom' },
      { href: '/bank-statement-analyzer-canada', label: 'Canada' },
      { href: '/bank-statement-analyzer-new-zealand', label: 'New Zealand' },
    ],
  },
  {
    heading: 'Budgeting Tools',
    links: [
      { href: '/how-to-budget', label: 'How to Budget' },
      { href: '/budget-planner', label: 'Budget Planner' },
      { href: '/50-30-20-rule', label: '50/30/20 Rule' },
      { href: '/zero-based-budgeting', label: 'Zero-Based Budgeting' },
      { href: '/how-to-save-money', label: 'How to Save Money' },
      { href: '/money-saving-tips', label: 'Money Saving Tips' },
      { href: '/stop-wasting-money', label: 'Stop Wasting Money' },
      { href: '/why-am-i-always-broke', label: 'Why Am I Always Broke?' },
      { href: '/student-budget-planner', label: 'Student Budget Planner' },
      { href: '/household-budget', label: 'Household Budget' },
    ],
  },
  {
    heading: 'Subscriptions & Bills',
    links: [
      { href: '/subscription-audit', label: 'Subscription Audit' },
      { href: '/forgotten-subscriptions', label: 'Forgotten Subscriptions' },
      { href: '/unknown-bank-charges', label: 'Unknown Bank Charges' },
      { href: '/bill-tracker', label: 'Bill Tracker' },
      { href: '/check-my-spending', label: 'Check My Spending' },
      { href: '/weekly-spending-tracker', label: 'Weekly Spending Tracker' },
    ],
  },
  {
    heading: 'AI Tools',
    links: [
      { href: '/ai-bank-statement-analyzer', label: 'AI Statement Analyzer' },
      { href: '/automatic-expense-categorization', label: 'Auto Expense Categorization' },
      { href: '/credit-card-statement-analyzer', label: 'Credit Card Analyzer' },
      { href: '/cash-flow-analyzer', label: 'Cash Flow Analyzer' },
      { href: '/spending-insights', label: 'Spending Insights' },
      { href: '/mint-alternative', label: 'Mint Alternative' },
      { href: '/ynab-alternative', label: 'YNAB Alternative' },
    ],
  },
  {
    heading: 'Australian Banks',
    links: [
      { href: '/anz-bank-statement-analyzer', label: 'ANZ' },
      { href: '/commbank-statement-analyzer', label: 'CommBank' },
      { href: '/westpac-statement-analyzer', label: 'Westpac' },
      { href: '/nab-bank-statement-analyzer', label: 'NAB' },
      { href: '/suncorp-statement-analyzer', label: 'Suncorp' },
      { href: '/macquarie-bank-statement-analyzer', label: 'Macquarie' },
      { href: '/ing-statement-analyzer', label: 'ING' },
      { href: '/bendigo-bank-statement-analyzer', label: 'Bendigo Bank' },
    ],
  },
  {
    heading: 'US Banks',
    links: [
      { href: '/chase-bank-statement-analyzer', label: 'Chase' },
      { href: '/bank-of-america-statement-analyzer', label: 'Bank of America' },
      { href: '/wells-fargo-statement-analyzer', label: 'Wells Fargo' },
      { href: '/td-bank-statement-analyzer', label: 'TD Bank' },
      { href: '/capital-one-statement-analyzer', label: 'Capital One' },
      { href: '/citibank-statement-analyzer', label: 'Citibank' },
      { href: '/american-express-statement-analyzer', label: 'American Express' },
      { href: '/usaa-statement-analyzer', label: 'USAA' },
    ],
  },
  {
    heading: 'UK Banks',
    links: [
      { href: '/barclays-statement-analyzer', label: 'Barclays' },
      { href: '/hsbc-statement-analyzer', label: 'HSBC' },
      { href: '/lloyds-statement-analyzer', label: 'Lloyds' },
      { href: '/natwest-statement-analyzer', label: 'NatWest' },
      { href: '/santander-statement-analyzer', label: 'Santander' },
      { href: '/halifax-statement-analyzer', label: 'Halifax' },
      { href: '/nationwide-statement-analyzer', label: 'Nationwide' },
    ],
  },
  {
    heading: 'Canada & NZ Banks',
    links: [
      { href: '/rbc-statement-analyzer', label: 'RBC' },
      { href: '/scotiabank-statement-analyzer', label: 'Scotiabank' },
      { href: '/bmo-statement-analyzer', label: 'BMO' },
      { href: '/cibc-statement-analyzer', label: 'CIBC' },
      { href: '/bnz-statement-analyzer', label: 'BNZ' },
      { href: '/kiwibank-statement-analyzer', label: 'Kiwibank' },
      { href: '/asb-statement-analyzer', label: 'ASB' },
      { href: '/anz-nz-statement-analyzer', label: 'ANZ NZ' },
    ],
  },
]

interface Props {
  /** Href of the current page — that link will be omitted to avoid self-linking */
  currentPath?: string
}

export function SeoInternalLinks({ currentPath }: Props) {
  return (
    <section className="border-t pt-10 mt-12">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
        More Free Tools
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {LINK_GROUPS.map((group) => {
          const filteredLinks = group.links.filter(l => l.href !== currentPath)
          if (!filteredLinks.length) return null
          return (
            <div key={group.heading} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.heading}
              </p>
              <ul className="space-y-1">
                {filteredLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
