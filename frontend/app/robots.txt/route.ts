export async function GET() {
  const robotsTxt = `# Robots.txt for whereismymoneygo.com
User-agent: *
Allow: /

# Sitemap
Sitemap: https://whereismymoneygo.com/sitemap.xml

# Disallow API routes
Disallow: /api/
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
