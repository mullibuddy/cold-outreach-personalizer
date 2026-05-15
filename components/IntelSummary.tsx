'use client'

import { useState } from 'react'

interface IntelSummaryProps {
  summary: string
  citations: string[]
}

export function IntelSummary({ summary, citations }: IntelSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Parse summary into bullet points
  const bulletPoints = summary
    .split('\n')
    .filter((line) => line.trim().startsWith('•'))
    .map((line) => line.trim().substring(1).trim())

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">What we found</span>
          <span className="text-gray-500 text-sm">
            {isExpanded ? '−' : '+'} {bulletPoints.length} insights
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          {/* Bullet Points */}
          <ul className="space-y-3">
            {bulletPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-700 flex">
                <span className="text-gray-400 mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          {/* Citations */}
          {citations.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Sources:</p>
              <div className="space-y-1">
                {citations.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
