'use client'

import { useEffect, useState, useRef } from 'react'
import { Progress } from '@/components/ui/progress'
import { Check, Loader2, Brain, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isLoading: boolean
  isDemo?: boolean
}

const steps = [
  { id: 1, text: 'Reading your transactions' },
  { id: 2, text: 'Scanning for recurring payments' },
  { id: 3, text: 'Spotting hidden subscriptions & fees' },
  { id: 4, text: 'Calculating what you could save' },
  { id: 5, text: 'Building your personalised savings plan' },
  { id: 6, text: 'AI is writing your report', isSlowStep: true },
]

const AI_TIPS = [
  'This is the most thorough part — the AI reads every spending pattern to find insights heuristics miss.',
  'Claude is reviewing your category trends and crafting personalised recommendations.',
  'Generating a savings action plan tailored to your spending habits.',
  'Almost there — the AI report usually adds $50–$200 in extra savings discoveries.',
]

export default function LoadingOverlay({ isLoading, isDemo }: LoadingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [extraProgress, setExtraProgress] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      setExtraProgress(0)
      setElapsedSeconds(0)
      setTipIndex(0)
      startTimeRef.current = null
      return
    }

    startTimeRef.current = Date.now()

    const stepDelay = isDemo ? 300 : 1500
    const extraDelay = isDemo ? 150 : 800

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, stepDelay)

    const extraInterval = setInterval(() => {
      setExtraProgress((prev) => (prev < (isDemo ? 15 : 10) ? prev + 1 : prev))
    }, extraDelay)

    // Elapsed timer — only meaningful for real runs
    const clockInterval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }, 1000)

    // Rotate tips every 8s
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % AI_TIPS.length)
    }, 8000)

    return () => {
      clearInterval(stepInterval)
      clearInterval(extraInterval)
      clearInterval(clockInterval)
      clearInterval(tipInterval)
    }
  }, [isLoading, isDemo])

  if (!isLoading) return null

  const basePercent = Math.round((currentStep / (steps.length - 1)) * 85)
  const maxPercent = isDemo ? 100 : 95
  const progressPercent = Math.min(maxPercent, basePercent + extraProgress)

  const isAiStep = !isDemo && currentStep >= steps.length - 1
  const estimatedTotal = 45 // seconds typical for Claude API
  const remaining = Math.max(0, estimatedTotal - elapsedSeconds)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-xl">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              'mb-4 flex h-14 w-14 items-center justify-center rounded-full',
              isAiStep
                ? 'bg-violet-100 dark:bg-violet-900/40'
                : 'bg-emerald-100 dark:bg-emerald-900/40'
            )}>
              {isAiStep
                ? <Brain className="h-7 w-7 text-violet-600 dark:text-violet-400 animate-pulse" />
                : <Loader2 className="h-7 w-7 animate-spin text-emerald-600 dark:text-emerald-400" />
              }
            </div>
            <h3 className="text-lg font-bold">
              {isDemo
                ? 'Loading Demo Analysis'
                : isAiStep
                  ? 'AI is writing your report'
                  : 'Scanning Your Transactions'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isDemo
                ? 'Preparing a sample analysis for you to explore...'
                : isAiStep
                  ? AI_TIPS[tipIndex]
                  : 'Hang tight — this usually takes 30–60 seconds.'}
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <Progress
              value={progressPercent}
              className={cn('h-2', isAiStep && '[&>div]:bg-violet-500')}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progressPercent}%</span>
              {isAiStep && !isDemo && (
                <span className="flex items-center gap-1 font-medium text-violet-600 dark:text-violet-400">
                  <Clock className="h-3 w-3" />
                  {remaining > 0
                    ? `~${remaining}s remaining`
                    : `${elapsedSeconds}s elapsed — almost done`}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
                  index < currentStep && 'bg-primary text-primary-foreground',
                  index === currentStep && !step.isSlowStep && 'border-2 border-primary text-primary',
                  index === currentStep && step.isSlowStep && 'border-2 border-violet-500 text-violet-500',
                  index > currentStep && 'border border-border text-muted-foreground'
                )}>
                  {index < currentStep ? (
                    <Check className="h-3 w-3" />
                  ) : index === currentStep ? (
                    <div className={cn(
                      'h-1.5 w-1.5 rounded-full animate-pulse',
                      step.isSlowStep ? 'bg-violet-500' : 'bg-primary'
                    )} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={cn(
                  'text-sm',
                  index > currentStep ? 'text-muted-foreground' : 'text-foreground',
                  index === currentStep && step.isSlowStep && 'text-violet-600 dark:text-violet-400 font-medium'
                )}>
                  {step.text}
                </span>
                {index === currentStep && step.isSlowStep && !isDemo && (
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {elapsedSeconds}s
                  </span>
                )}
              </div>
            ))}
          </div>

          {isAiStep && !isDemo && (
            <p className="mt-4 text-center text-xs text-muted-foreground border-t pt-4">
              You can leave this tab open — we&apos;ll show results as soon as it&apos;s ready.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
