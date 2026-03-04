'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Check, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
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

      trackFeedbackSubmitted({ rating, hasComment: comment.trim().length > 0 })
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
      <Card>
        <CardContent className="flex flex-col items-center p-8 text-center">
          <CheckCircle className="mb-3 h-8 w-8 text-emerald-500" />
          <p className="font-semibold">Thanks for your feedback!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your input helps us improve Leaky Wallet for everyone.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Your Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'initial' && (
          <>
            <p className="text-sm text-muted-foreground">Was this analysis helpful?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleRating('positive')}
              >
                <ThumbsUp className="h-5 w-5" />
                Yes
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleRating('negative')}
              >
                <ThumbsDown className="h-5 w-5" />
                No
              </Button>
            </div>
          </>
        )}

        {step === 'followup' && (
          <div className="space-y-4">
            <p className="text-sm">
              {rating === 'positive'
                ? 'Great! What did you find most useful?'
                : 'Sorry to hear that. What could we improve?'}
            </p>

            <div className="flex flex-wrap gap-2">
              {followups.map((reason) => (
                <button
                  key={reason.id}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                    selectedReasons.includes(reason.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                  onClick={() => toggleReason(reason.id)}
                >
                  {selectedReasons.includes(reason.id) ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  {reason.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-comment" className="text-sm">
                Anything else you&apos;d like to share? (optional)
              </Label>
              <Textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={rating === 'positive'
                  ? 'Tell us what you liked...'
                  : 'Tell us how we can improve...'}
                maxLength={500}
                rows={3}
              />
              <p className="text-right text-xs text-muted-foreground">{comment.length}/500</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
              <Button variant="ghost" onClick={() => setStep('initial')} disabled={loading}>
                Back
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
