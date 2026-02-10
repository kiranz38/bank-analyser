'use client'

interface ErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  onDismiss?: () => void
  onRetry?: () => void
  suggestion?: string
}

// Map common error messages to user-friendly versions
const ERROR_MAP: Record<string, { message: string; suggestion?: string }> = {
  'Failed to fetch': {
    message: 'Unable to connect to the server',
    suggestion: 'Please check your internet connection and try again.',
  },
  'Network Error': {
    message: 'Network connection problem',
    suggestion: 'Please check your internet connection and try again.',
  },
  'Could not parse CSV content': {
    message: 'Unable to read your file',
    suggestion: 'Make sure your file is a valid CSV or PDF bank statement.',
  },
  'No valid transactions found': {
    message: 'No transactions found in your file',
    suggestion: 'Try uploading a different statement or check that the file contains transaction data.',
  },
  'Analysis failed': {
    message: 'Unable to analyze your transactions',
    suggestion: 'Please try again. If the problem persists, try a different file format.',
  },
  'File too large': {
    message: 'Your file is too large',
    suggestion: 'Maximum file size is 10MB. Try splitting your statement into smaller files.',
  },
  'Invalid file type': {
    message: 'Unsupported file format',
    suggestion: 'Please upload a CSV or PDF file.',
  },
  'Rate limit exceeded': {
    message: 'Too many requests',
    suggestion: 'Please wait a moment before trying again.',
  },
}

function getFriendlyError(message: string): { message: string; suggestion?: string } {
  // Check for exact matches
  if (ERROR_MAP[message]) {
    return ERROR_MAP[message]
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  // Return original with generic suggestion
  return {
    message,
    suggestion: 'If this problem persists, please try again or use a different file.',
  }
}

export default function ErrorMessage({
  message,
  type = 'error',
  onDismiss,
  onRetry,
  suggestion: customSuggestion,
}: ErrorMessageProps) {
  const friendly = getFriendlyError(message)
  const displaySuggestion = customSuggestion || friendly.suggestion

  const iconMap = {
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  }

  return (
    <div className={`error-message error-message-${type}`}>
      <div className="error-message-icon">{iconMap[type]}</div>
      <div className="error-message-content">
        <p className="error-message-text">{friendly.message}</p>
        {displaySuggestion && (
          <p className="error-message-suggestion">{displaySuggestion}</p>
        )}
      </div>
      <div className="error-message-actions">
        {onRetry && (
          <button className="error-message-retry" onClick={onRetry}>
            Try Again
          </button>
        )}
        {onDismiss && (
          <button className="error-message-dismiss" onClick={onDismiss} aria-label="Dismiss">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Export the friendly error function for use elsewhere
export { getFriendlyError }
