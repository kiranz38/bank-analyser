'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  onDismiss?: () => void
  onRetry?: () => void
  suggestion?: string
}

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
  if (ERROR_MAP[message]) return ERROR_MAP[message]
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return value
  }
  return {
    message,
    suggestion: 'If this problem persists, please try again or use a different file.',
  }
}

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
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
  const Icon = iconMap[type]

  return (
    <Alert variant={type === 'error' ? 'destructive' : 'default'} className="relative">
      <Icon className="h-4 w-4" />
      <AlertTitle>{friendly.message}</AlertTitle>
      {displaySuggestion && (
        <AlertDescription>{displaySuggestion}</AlertDescription>
      )}
      <div className="mt-3 flex items-center gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  )
}

export { getFriendlyError }
