'use client'

import { useState } from 'react'
import { InputForm } from '@/components/InputForm'
import { LoadingState } from '@/components/LoadingState'
import { OpenerCard } from '@/components/OpenerCard'
import { IntelSummary } from '@/components/IntelSummary'
import { ProspectInput } from '@/types/prospect'
import { OpenerOutput } from '@/types/opener'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [output, setOutput] = useState<OpenerOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentInput, setCurrentInput] = useState<ProspectInput | null>(null)

  const handleSubmit = async (data: ProspectInput) => {
    setIsLoading(true)
    setError(null)
    setOutput(null)
    setCurrentInput(data)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to generate openers')
      }

      if (result.success && result.data) {
        setOutput(result.data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const accentColors: Array<'slate' | 'sage' | 'amber'> = ['slate', 'sage', 'amber']

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI Cold Outreach Personalizer
          </h1>
          <p className="text-lg text-gray-600">
            Generate three hyper-personalized cold outreach openers in 60 seconds
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Input Form */}
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Error State */}
          {error && (
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && currentInput && (
            <LoadingState
              prospectName={currentInput.firstName}
              company={currentInput.company}
              jobTitle={currentInput.jobTitle}
            />
          )}

          {/* Output - Three Opener Cards */}
          {output && !isLoading && (
            <>
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 text-center">
                  Your Personalized Openers
                </h2>

                <div className="space-y-6">
                  {output.openers.map((opener, index) => (
                    <OpenerCard
                      key={index}
                      opener={opener}
                      accentColor={accentColors[index % accentColors.length]}
                    />
                  ))}
                </div>
              </div>

              {/* Intel Summary */}
              <IntelSummary
                summary={output.intelSummary}
                citations={output.citations}
              />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Built with{' '}
            <a
              href="https://www.anthropic.com/claude"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Claude AI
            </a>
            {' '}+ Web Search
          </p>
        </div>
      </footer>
    </div>
  )
}
