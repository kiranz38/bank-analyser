'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            We encountered an unexpected error. Your data is safe and hasn&apos;t been lost.
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={this.handleRetry}>Try Again</Button>
            <Button variant="outline" onClick={this.handleReload}>Reload Page</Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 w-full max-w-lg text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground">Error Details (Development Only)</summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted/30 p-3 text-xs">{this.state.error.message}</pre>
              <pre className="mt-1 overflow-auto rounded-md bg-muted/30 p-3 text-xs">{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackMessage?: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary
        fallback={
          fallbackMessage ? (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{fallbackMessage}</AlertDescription>
            </Alert>
          ) : undefined
        }
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
