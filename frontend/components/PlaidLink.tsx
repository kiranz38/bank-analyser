'use client'

import { useCallback, useEffect, useState } from 'react'
import Script from 'next/script'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid, Lock, AlertCircle, Check, Shield, Loader2 } from 'lucide-react'
import { createLinkToken, exchangeTokenAndAnalyze, PlaidLinkResult } from '@/lib/plaid'
import {
  trackPlaidLinkOpened,
  trackPlaidLinkSuccess,
  trackPlaidLinkExit
} from '@/lib/analytics'

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
  institution?: { name: string; institution_id: string }
  accounts?: Array<{ id: string; name: string; mask: string; type: string; subtype: string }>
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
      onExit: (err: PlaidError | null) => {
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
    <div className="mx-auto max-w-md">
      <Script
        src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
        onLoad={() => setPlaidLoaded(true)}
        onError={() => {
          setError('Failed to load bank connection. Please try again.')
          setPlaidLoaded(false)
        }}
      />

      <Card>
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <LayoutGrid className="h-8 w-8 text-primary" />
          </div>

          <h3 className="text-lg font-semibold">Connect Your Bank</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Securely connect your bank account to automatically import your transactions.
            We use Plaid, trusted by millions.
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={handleOpenPlaid}
            disabled={loading || processing || !plaidLoaded || !linkToken}
          >
            {loading && 'Initializing...'}
            {processing && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing transactions...
              </>
            )}
            {!loading && !processing && (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Connect Bank Account
              </>
            )}
          </Button>

          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" /> Read-only access
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" /> 256-bit encryption
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" /> Credentials never stored
            </span>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Powered by Plaid. Your bank login is never shared with us.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
