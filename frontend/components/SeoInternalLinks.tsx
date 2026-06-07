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
    heading: 'Australian Banks',
    links: [
      { href: '/anz-bank-statement-analyzer', label: 'ANZ' },
      { href: '/commbank-statement-analyzer', label: 'CommBank' },
      { href: '/westpac-statement-analyzer', label: 'Westpac' },
      { href: '/nab-bank-statement-analyzer', label: 'NAB' },
    ],
  },
  {
    heading: 'US & UK Banks',
    links: [
      { href: '/chase-bank-statement-analyzer', label: 'Chase' },
      { href: '/bank-of-america-statement-analyzer', label: 'Bank of America' },
      { href: '/wells-fargo-statement-analyzer', label: 'Wells Fargo' },
      { href: '/barclays-statement-analyzer', label: 'Barclays' },
      { href: '/hsbc-statement-analyzer', label: 'HSBC' },
      { href: '/td-bank-statement-analyzer', label: 'TD Bank' },
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
