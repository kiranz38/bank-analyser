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
