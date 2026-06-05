import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Leaky Wallet – Free Bank Statement Analyzer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#0ea5e9',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            💧
          </div>
          <span style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '600', letterSpacing: '-0.5px' }}>
            Leaky Wallet
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            color: '#f1f5f9',
            fontSize: '56px',
            fontWeight: '800',
            lineHeight: '1.1',
            margin: '0 0 24px',
            maxWidth: '800px',
            letterSpacing: '-1.5px',
          }}
        >
          Find the money{' '}
          <span style={{ color: '#0ea5e9' }}>quietly leaving</span>
          {' '}your account
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: '#94a3b8',
            fontSize: '24px',
            margin: '0 0 48px',
            maxWidth: '700px',
            lineHeight: '1.4',
          }}
        >
          Upload your bank statement · Find hidden subscriptions, fees & leaks · 100% free, no signup
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '48px' }}>
          {[
            { value: '47,000+', label: 'Scans run' },
            { value: '$412/mo', label: 'Avg. leaks found' },
            { value: 'Free', label: 'No card required' },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#0ea5e9', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                {stat.value}
              </span>
              <span style={{ color: '#64748b', fontSize: '16px', marginTop: '4px' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bank badges */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '48px', flexWrap: 'wrap' }}>
          {['ANZ', 'CommBank', 'Westpac', 'NAB', 'Chase', 'Barclays', 'HSBC'].map((bank) => (
            <div
              key={bank}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                padding: '6px 14px',
                color: '#cbd5e1',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {bank}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
