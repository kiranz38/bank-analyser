/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },

  // Fix Windows dev server CSS/chunk 404s after repeated HMR
  experimental: {
    webpackBuildWorker: false,
  },

  webpack: (config, { dev }) => {
    if (dev) {
      // Disable aggressive chunk splitting in dev to prevent stale manifests
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false,
      }
    }
    return config
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Allows GA4, Stripe, Resend, Plaid, and Anthropic.
            // 'unsafe-inline' on script-src is required for Next.js inline scripts
            // and GA4's gtag snippet; mitigated by strict-dynamic + nonce in future.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://cdn.plaid.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://www.googletagmanager.com https://www.google-analytics.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              "font-src 'self' data:",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://api.stripe.com https://production.plaid.com https://sandbox.plaid.com https://api.anthropic.com https://api.resend.com https://api.whereismymoneygo.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com https://cdn.plaid.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
