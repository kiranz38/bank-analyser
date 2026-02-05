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
]

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      return
    }

    // Progress through steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 800)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loading-spinner" />
        <h3 className="loading-title">Analyzing Your Spending</h3>
        <p className="loading-subtitle">
          This usually takes a few seconds...
        </p>
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
