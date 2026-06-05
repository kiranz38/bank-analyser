export async function GET() {
  const robotsTxt = `# Robots.txt for whereismymoneygo.com
User-agent: *
Allow: /

# Private / no SEO value
Disallow: /api/
Disallow: /dashboard
Disallow: /account
Disallow: /admin

# Sitemap
Sitemap: https://whereismymoneygo.com/sitemap.xml
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
