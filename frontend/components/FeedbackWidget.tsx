'use client'

import { useState } from 'react'
import { trackFeedbackSubmitted } from '@/lib/analytics'

type FeedbackRating = 'positive' | 'negative' | null
type FeedbackStep = 'initial' | 'followup' | 'submitted'

interface FeedbackWidgetProps {
  context?: {
    monthlyLeak?: number
    subscriptionCount?: number
  }
}

const POSITIVE_FOLLOWUPS = [
  { id: 'found_savings', label: 'Found real savings opportunities' },
  { id: 'easy_to_use', label: 'Easy to use' },
  { id: 'accurate', label: 'Accurate analysis' },
  { id: 'other', label: 'Other' },
]

const NEGATIVE_FOLLOWUPS = [
  { id: 'not_accurate', label: 'Results weren\'t accurate' },
  { id: 'missing_features', label: 'Missing features I need' },
  { id: 'confusing', label: 'Confusing to use' },
  { id: 'parsing_issues', label: 'My file didn\'t parse correctly' },
  { id: 'other', label: 'Other' },
]

export default function FeedbackWidget({ context }: FeedbackWidgetProps) {
  const [step, setStep] = useState<FeedbackStep>('initial')
  const [rating, setRating] = useState<FeedbackRating>(null)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRating = (newRating: FeedbackRating) => {
    setRating(newRating)
    setStep('followup')
    setSelectedReasons([])
    setComment('')
  }

  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(r => r !== reasonId)
        : [...prev, reasonId]
    )
  }

  const handleSubmit = async () => {
    if (!rating) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          reasons: selectedReasons,
          comment: comment.trim() || null,
          context: {
            monthlyLeak: context?.monthlyLeak,
            subscriptionCount: context?.subscriptionCount,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit feedback')
      }

      trackFeedbackSubmitted({
        rating,
        hasComment: comment.trim().length > 0
      })

      setStep('submitted')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const followups = rating === 'positive' ? POSITIVE_FOLLOWUPS : NEGATIVE_FOLLOWUPS

  if (step === 'submitted') {
    return (
      <div className="feedback-widget feedback-submitted">
        <div className="feedback-success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="feedback-thanks">Thanks for your feedback!</p>
        <p className="feedback-message">
          Your input helps us improve Leaky Wallet for everyone.
        </p>
      </div>
    )
  }

  return (
    <div className="feedback-widget">
      {step === 'initial' && (
        <>
          <p className="feedback-question">Was this analysis helpful?</p>
          <div className="feedback-buttons">
            <button
              className="feedback-btn feedback-btn-positive"
              onClick={() => handleRating('positive')}
              aria-label="Yes, helpful"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              <span>Yes</span>
            </button>
            <button
              className="feedback-btn feedback-btn-negative"
              onClick={() => handleRating('negative')}
              aria-label="No, not helpful"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
              </svg>
              <span>No</span>
            </button>
          </div>
        </>
      )}

      {step === 'followup' && (
        <div className="feedback-followup">
          <p className="feedback-question">
            {rating === 'positive'
              ? 'Great! What did you find most useful?'
              : 'Sorry to hear that. What could we improve?'}
          </p>

          <div className="feedback-reasons">
            {followups.map((reason) => (
              <button
                key={reason.id}
                className={`feedback-reason ${selectedReasons.includes(reason.id) ? 'selected' : ''}`}
                onClick={() => toggleReason(reason.id)}
              >
                {selectedReasons.includes(reason.id) ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
                {reason.label}
              </button>
            ))}
          </div>

          <div className="feedback-comment">
            <label htmlFor="feedback-comment">
              Anything else you'd like to share? (optional)
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={rating === 'positive'
                ? 'Tell us what you liked...'
                : 'Tell us how we can improve...'}
              maxLength={500}
              rows={3}
            />
            <span className="feedback-char-count">{comment.length}/500</span>
          </div>

          {error && (
            <div className="feedback-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="feedback-actions">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              className="btn btn-text"
              onClick={() => setStep('initial')}
              disabled={loading}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
