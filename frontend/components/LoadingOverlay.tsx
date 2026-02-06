'use client'

import { useEffect, useState } from 'react'

interface LoadingOverlayProps {
  isLoading: boolean
}

const steps = [
  { id: 1, text: 'Parsing your bank statement' },
  { id: 2, text: 'Detecting transaction patterns' },
  { id: 3, text: 'Identifying subscriptions & fees' },
  { id: 4, text: 'Calculating potential savings' },
  { id: 5, text: 'Generating your recovery plan' },
  { id: 6, text: 'Finalizing analysis...' },
]

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [extraProgress, setExtraProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      setExtraProgress(0)
      return
    }

    // Progress through steps (slower pace - 1.5 seconds per step)
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1500)

    // Extra slow progress for the final step (adds 1% every 500ms up to 95%)
    const extraInterval = setInterval(() => {
      setExtraProgress((prev) => {
        if (prev < 10) return prev + 1
        return prev
      })
    }, 800)

    return () => {
      clearInterval(interval)
      clearInterval(extraInterval)
    }
  }, [isLoading])

  if (!isLoading) return null

  // Progress: steps contribute up to 85%, extra progress adds up to 10% more (max 95%)
  const basePercent = Math.round((currentStep / (steps.length - 1)) * 85)
  const progressPercent = Math.min(95, basePercent + extraProgress)

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loading-spinner" />
        <h3 className="loading-title">Analyzing Your Spending</h3>
        <p className="loading-subtitle">
          This usually takes a few seconds...
        </p>
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
