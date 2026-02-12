/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
        ],
      },
    ]
  },
}

module.exports = nextConfig
