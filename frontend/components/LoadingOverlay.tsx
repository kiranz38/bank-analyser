'use client'

import { useEffect, useState } from 'react'

interface LoadingOverlayProps {
  isLoading: boolean
  isDemo?: boolean
}

const steps = [
  { id: 1, text: 'Parsing your bank statement' },
  { id: 2, text: 'Detecting transaction patterns' },
  { id: 3, text: 'Identifying subscriptions & fees' },
  { id: 4, text: 'Calculating potential savings' },
  { id: 5, text: 'Generating your recovery plan' },
  { id: 6, text: 'Finalizing analysis...' },
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

    // Progress through steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, stepDelay)

    // Extra progress for the final stretch
    const extraInterval = setInterval(() => {
      setExtraProgress((prev) => {
        if (prev < (isDemo ? 15 : 10)) return prev + 1
        return prev
      })
    }, extraDelay)

    return () => {
      clearInterval(interval)
      clearInterval(extraInterval)
    }
  }, [isLoading, isDemo])

  if (!isLoading) return null

  // Progress: steps contribute up to 85%, extra progress fills the rest
  const basePercent = Math.round((currentStep / (steps.length - 1)) * 85)
  const maxPercent = isDemo ? 100 : 95
  const progressPercent = Math.min(maxPercent, basePercent + extraProgress)

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loading-spinner" />
        <h3 className="loading-title">{isDemo ? 'Loading Demo' : 'Analyzing Your Spending'}</h3>
        <p className="loading-subtitle">
          {isDemo ? 'Preparing your demo analysis...' : 'Grab a coffee while we crunch the numbers for you...'}
        </p>
        {!isDemo && (
          <p className="loading-time-hint">
            This typically takes 30 seconds to a minute.
          </p>
        )}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="progress-text">{progressPercent}%</span>
        </div>
        <div className="loading-steps">
          {steps.map((step, index) => (
            <div key={step.id} className="loading-step">
              <div
                className={`step-icon ${
                  index < currentStep
                    ? 'completed'
                    : index === currentStep
                    ? 'active'
                    : 'pending'
                }`}
              >
                {index < currentStep ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : index === currentStep ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="3" fill="currentColor" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`step-text ${index > currentStep ? 'pending' : ''}`}
              >
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
