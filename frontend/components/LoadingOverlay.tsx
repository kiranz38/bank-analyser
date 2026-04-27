'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Check, Loader2 } from 'lucide-react'
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
  { id: 6, text: 'Wrapping up your report' },
]

export default function LoadingOverlay({ isLoading, isDemo }: LoadingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [extraProgress, setExtraProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      setExtraProgress(0)
      return
    }

    const stepDelay = isDemo ? 300 : 1500
    const extraDelay = isDemo ? 150 : 800

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, stepDelay)

    const extraInterval = setInterval(() => {
      setExtraProgress((prev) => (prev < (isDemo ? 15 : 10) ? prev + 1 : prev))
    }, extraDelay)

    return () => {
      clearInterval(interval)
      clearInterval(extraInterval)
    }
  }, [isLoading, isDemo])

  if (!isLoading) return null

  const basePercent = Math.round((currentStep / (steps.length - 1)) * 85)
  const maxPercent = isDemo ? 100 : 95
  const progressPercent = Math.min(maxPercent, basePercent + extraProgress)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-xl">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
        <div className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold">
            {isDemo ? 'Loading Demo Analysis' : 'Scanning Your Transactions'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isDemo
              ? 'Preparing a sample analysis for you to explore...'
              : 'Hang tight — this usually takes 30–60 seconds.'}
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-right text-xs font-medium text-muted-foreground">{progressPercent}%</p>
        </div>

        <div className="mt-5 space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
                  index < currentStep && 'bg-primary text-primary-foreground',
                  index === currentStep && 'border-2 border-primary text-primary',
                  index > currentStep && 'border border-border text-muted-foreground'
                )}
              >
                {index < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : index === currentStep ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-sm',
                  index > currentStep ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {step.text}
              </span>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}
