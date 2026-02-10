'use client'

import { useCallback, useEffect, useState } from 'react'
import Script from 'next/script'
import { createLinkToken, exchangeTokenAndAnalyze, PlaidLinkResult } from '@/lib/plaid'
import {
  trackPlaidLinkOpened,
  trackPlaidLinkSuccess,
  trackPlaidLinkExit
} from '@/lib/analytics'

// Plaid Link types
declare global {
  interface Window {
    Plaid?: {
      create: (config: PlaidConfig) => PlaidHandler
    }
  }
}

interface PlaidConfig {
  token: string
  onSuccess: (publicToken: string, metadata: PlaidMetadata) => void
  onExit: (err: PlaidError | null, metadata: PlaidMetadata) => void
  onEvent?: (eventName: string, metadata: PlaidMetadata) => void
}

interface PlaidHandler {
  open: () => void
  exit: (options?: { force: boolean }) => void
  destroy: () => void
}

interface PlaidMetadata {
  institution?: {
    name: string
    institution_id: string
  }
  accounts?: Array<{
    id: string
    name: string
    mask: string
    type: string
    subtype: string
  }>
  link_session_id?: string
  status?: string
}

interface PlaidError {
  error_type: string
  error_code: string
  error_message: string
  display_message: string
}

interface PlaidLinkProps {
  onSuccess: (result: PlaidLinkResult) => void
  onExit: () => void
  onError: (error: string) => void
}

export default function PlaidLink({ onSuccess, onExit, onError }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [plaidLoaded, setPlaidLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize link token on mount
  useEffect(() => {
    async function initLinkToken() {
      setLoading(true)
      setError(null)

      const result = await createLinkToken()

      if (result) {
        setLinkToken(result.link_token)
      } else {
        setError('Failed to initialize bank connection. Please try again.')
        onError('Failed to initialize bank connection')
      }

      setLoading(false)
    }

    initLinkToken()
  }, [onError])

  // Handle Plaid Link open
  const handleOpenPlaid = useCallback(() => {
    if (!linkToken || !window.Plaid) {
      setError('Bank connection is not ready. Please refresh and try again.')
      return
    }

    trackPlaidLinkOpened()

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (publicToken: string, metadata: PlaidMetadata) => {
        setProcessing(true)
        setError(null)

        console.log('[Plaid] Success - Institution:', metadata.institution?.name)

        const result = await exchangeTokenAndAnalyze(publicToken)

        if (result.success) {
          trackPlaidLinkSuccess()
          onSuccess(result)
        } else {
          setError(result.error || 'Failed to analyze transactions')
          onError(result.error || 'Failed to analyze transactions')
        }

        setProcessing(false)
      },
      onExit: (err: PlaidError | null, metadata: PlaidMetadata) => {
        if (err) {
          console.error('[Plaid] Exit with error:', err)
          trackPlaidLinkExit(err.error_code)

          if (err.error_code !== 'USER_ABORT') {
            setError(err.display_message || 'Connection was interrupted')
          }
        } else {
          trackPlaidLinkExit('user_cancelled')
        }

        onExit()
      },
      onEvent: (eventName: string) => {
        console.log('[Plaid] Event:', eventName)
      },
    })

    handler.open()
  }, [linkToken, onSuccess, onExit, onError])

  return (
    <div className="plaid-link-container">
      {/* Load Plaid Link script */}
      <Script
        src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
        onLoad={() => setPlaidLoaded(true)}
        onError={() => {
          setError('Failed to load bank connection. Please try again.')
          setPlaidLoaded(false)
        }}
      />

      <div className="plaid-link-card">
        <div className="plaid-link-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>

        <h3>Connect Your Bank</h3>

        <p className="plaid-link-description">
          Securely connect your bank account to automatically import your transactions.
          We use Plaid, trusted by millions.
        </p>

        {error && (
          <div className="plaid-link-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-block"
          onClick={handleOpenPlaid}
          disabled={loading || processing || !plaidLoaded || !linkToken}
        >
          {loading && 'Initializing...'}
          {processing && (
            <>
              <span className="spinner"></span>
              Analyzing transactions...
            </>
          )}
          {!loading && !processing && (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Connect Bank Account
            </>
          )}
        </button>

        <div className="plaid-link-security">
          <div className="security-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Read-only access</span>
          </div>
          <div className="security-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>256-bit encryption</span>
          </div>
          <div className="security-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Credentials never stored</span>
          </div>
        </div>

        <p className="plaid-link-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Powered by Plaid. Your bank login is never shared with us.
        </p>
      </div>
    </div>
  )
}
