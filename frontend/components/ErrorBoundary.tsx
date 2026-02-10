'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

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
    // Log error to console in development
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you could send to error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Something went wrong</h3>
          <p className="error-boundary-message">
            We encountered an unexpected error. Your data is safe and hasn't been lost.
          </p>
          <div className="error-boundary-actions">
            <button className="btn btn-primary" onClick={this.handleRetry}>
              Try Again
            </button>
            <button className="btn btn-outline" onClick={this.handleReload}>
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="error-boundary-details">
              <summary>Error Details (Development Only)</summary>
              <pre>{this.state.error.message}</pre>
              <pre>{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use with hooks
interface ErrorBoundaryWrapperProps {
  children: ReactNode
  fallbackMessage?: string
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
            <div className="error-boundary-inline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{fallbackMessage}</span>
            </div>
          ) : undefined
        }
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
