export async function GET() {
  const baseUrl = 'https://whereismymoneygo.com'
  const lastMod = new Date().toISOString().split('T')[0]

  const pages = [
    // Core
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
    { url: '/pricing', priority: '0.7', changefreq: 'monthly' },
    { url: '/example', priority: '0.7', changefreq: 'monthly' },

    // High-intent tool pages
    { url: '/bank-statement-analyzer', priority: '0.9', changefreq: 'monthly' },
    { url: '/find-hidden-subscriptions', priority: '0.9', changefreq: 'monthly' },
    { url: '/subscription-tracker', priority: '0.9', changefreq: 'monthly' },
    { url: '/spending-tracker', priority: '0.9', changefreq: 'monthly' },
    { url: '/where-is-my-money-going', priority: '0.8', changefreq: 'monthly' },

    // Regional landing pages
    { url: '/bank-statement-analyzer-australia', priority: '0.8', changefreq: 'monthly' },
    { url: '/bank-statement-analyzer-usa', priority: '0.8', changefreq: 'monthly' },
    { url: '/bank-statement-analyzer-uk', priority: '0.8', changefreq: 'monthly' },
    { url: '/bank-statement-analyzer-canada', priority: '0.8', changefreq: 'monthly' },
    { url: '/bank-statement-analyzer-new-zealand', priority: '0.8', changefreq: 'monthly' },

    // Australian bank pages
    { url: '/anz-bank-statement-analyzer', priority: '0.8', changefreq: 'monthly' },
    { url: '/commbank-statement-analyzer', priority: '0.8', changefreq: 'monthly' },
    { url: '/westpac-statement-analyzer', priority: '0.8', changefreq: 'monthly' },
    { url: '/nab-bank-statement-analyzer', priority: '0.8', changefreq: 'monthly' },

    // US bank pages
    { url: '/chase-bank-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/bank-of-america-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/wells-fargo-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/td-bank-statement-analyzer', priority: '0.7', changefreq: 'monthly' },

    // UK bank pages
    { url: '/barclays-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/hsbc-statement-analyzer', priority: '0.7', changefreq: 'monthly' },

    // NZ bank pages
    { url: '/anz-nz-statement-analyzer', priority: '0.7', changefreq: 'monthly' },

    // Additional intent pages
    { url: '/where-did-my-money-go', priority: '0.8', changefreq: 'monthly' },
    { url: '/expense-calculator', priority: '0.9', changefreq: 'monthly' },
    { url: '/budget-calculator', priority: '0.9', changefreq: 'monthly' },
    { url: '/monthly-expense-tracker', priority: '0.8', changefreq: 'monthly' },
    { url: '/cancel-subscriptions', priority: '0.8', changefreq: 'monthly' },
    { url: '/personal-finance-tracker', priority: '0.9', changefreq: 'monthly' },
    { url: '/money-management', priority: '0.9', changefreq: 'monthly' },
    { url: '/bank-fee-checker', priority: '0.9', changefreq: 'monthly' },
    { url: '/recurring-payments', priority: '0.9', changefreq: 'monthly' },
    { url: '/financial-health-check', priority: '0.8', changefreq: 'monthly' },

    // New Australian bank pages
    { url: '/suncorp-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/macquarie-bank-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/ing-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/bendigo-bank-statement-analyzer', priority: '0.7', changefreq: 'monthly' },

    // New US bank pages
    { url: '/capital-one-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/citibank-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/american-express-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/usaa-statement-analyzer', priority: '0.7', changefreq: 'monthly' },

    // New UK bank pages
    { url: '/lloyds-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/natwest-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/santander-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/halifax-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/nationwide-statement-analyzer', priority: '0.7', changefreq: 'monthly' },

    // New Canadian bank pages
    { url: '/rbc-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/scotiabank-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/bmo-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/cibc-statement-analyzer', priority: '0.7', changefreq: 'monthly' },

    // New NZ bank pages
    { url: '/bnz-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/kiwibank-statement-analyzer', priority: '0.7', changefreq: 'monthly' },
    { url: '/asb-statement-analyzer', priority: '0.7', changefreq: 'monthly' },

    // Subscription & charge topic pages
    { url: '/subscription-audit', priority: '0.8', changefreq: 'monthly' },
    { url: '/forgotten-subscriptions', priority: '0.8', changefreq: 'monthly' },
    { url: '/unknown-bank-charges', priority: '0.8', changefreq: 'monthly' },

    // Budgeting topic pages
    { url: '/how-to-budget', priority: '0.8', changefreq: 'monthly' },
    { url: '/50-30-20-rule', priority: '0.8', changefreq: 'monthly' },
    { url: '/budget-planner', priority: '0.8', changefreq: 'monthly' },
    { url: '/how-to-save-money', priority: '0.8', changefreq: 'monthly' },
    { url: '/money-saving-tips', priority: '0.8', changefreq: 'monthly' },
    { url: '/stop-wasting-money', priority: '0.8', changefreq: 'monthly' },
    { url: '/why-am-i-always-broke', priority: '0.8', changefreq: 'monthly' },
    { url: '/student-budget-planner', priority: '0.8', changefreq: 'monthly' },
    { url: '/household-budget', priority: '0.8', changefreq: 'monthly' },
    { url: '/weekly-spending-tracker', priority: '0.8', changefreq: 'monthly' },
    { url: '/zero-based-budgeting', priority: '0.7', changefreq: 'monthly' },

    // AI & tech tool pages
    { url: '/ai-bank-statement-analyzer', priority: '0.9', changefreq: 'monthly' },
    { url: '/automatic-expense-categorization', priority: '0.8', changefreq: 'monthly' },
    { url: '/credit-card-statement-analyzer', priority: '0.8', changefreq: 'monthly' },
    { url: '/cash-flow-analyzer', priority: '0.8', changefreq: 'monthly' },
    { url: '/bill-tracker', priority: '0.8', changefreq: 'monthly' },
    { url: '/spending-insights', priority: '0.8', changefreq: 'monthly' },
    { url: '/check-my-spending', priority: '0.8', changefreq: 'monthly' },

    // Alternative/competitor pages
    { url: '/mint-alternative', priority: '0.8', changefreq: 'monthly' },
    { url: '/ynab-alternative', priority: '0.8', changefreq: 'monthly' },

    // Other
    { url: '/banks', priority: '0.6', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
