'use client'

import { useState } from 'react'
import { trackWaitlistSubmitted } from '@/lib/analytics'

interface WaitlistFormProps {
  onClose: () => void
  onBack: () => void
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OTHER', name: 'Other' },
]

export default function WaitlistForm({ onClose, onBack }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, country }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to join waitlist')
      }

      trackWaitlistSubmitted(country)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="waitlist-form waitlist-success">
        <div className="waitlist-success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>You're on the list!</h3>
        <p>We'll notify you when bank connect is available in your region.</p>
        <div className="waitlist-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            Try upload instead
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="waitlist-form">
      <button className="waitlist-close" onClick={onClose} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="waitlist-header">
        <div className="waitlist-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <h3>Join the Bank Connect Waitlist</h3>
        <p>
          Bank connect is currently in beta for US and UK users.
          Join the waitlist to get notified when it's available in your region.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="waitlist-form-fields">
        <div className="form-group">
          <label htmlFor="waitlist-email">Email</label>
          <input
            id="waitlist-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="waitlist-country">Country</label>
          <select
            id="waitlist-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="waitlist-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div className="waitlist-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Waitlist'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onBack}
          >
            Back to options
          </button>
        </div>
      </form>

      <p className="waitlist-note">
        We'll only email you about bank connect availability. No spam.
      </p>
    </div>
  )
}
