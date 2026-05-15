'use client'

import { useEffect, useState } from 'react'

interface LoadingStateProps {
  prospectName: string
  company: string
  jobTitle: string
}

export function LoadingState({ prospectName, company, jobTitle }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    `Searching for recent news on ${company}...`,
    `Researching ${prospectName}'s background...`,
    `Identifying pain points for a ${jobTitle}...`,
    'Writing your three openers...',
  ]

  useEffect(() => {
    // Stagger status messages every 8 seconds
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        {/* Animated spinner */}
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        {/* Status messages */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 transition-all duration-500 ${
                index <= currentStep ? 'opacity-100' : 'opacity-30'
              }`}
            >
              {/* Checkmark or spinner */}
              <div className="flex-shrink-0">
                {index < currentStep ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : index === currentStep ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>

              {/* Status text */}
              <p
                className={`text-sm ${
                  index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}
              >
                {step}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">This may take 20-40 seconds</p>
      </div>
    </div>
  )
}
