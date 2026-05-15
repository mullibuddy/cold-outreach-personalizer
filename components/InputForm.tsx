'use client'

import { useState } from 'react'
import { ProspectInput } from '@/types/prospect'

interface InputFormProps {
  onSubmit: (data: ProspectInput) => void
  isLoading: boolean
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [formData, setFormData] = useState<ProspectInput>({
    firstName: '',
    jobTitle: '',
    company: '',
    productDescription: '',
    channel: 'cold_email',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isFormValid =
    formData.firstName.trim() !== '' &&
    formData.jobTitle.trim() !== '' &&
    formData.company.trim() !== '' &&
    formData.productDescription.trim() !== ''

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-6">
        {/* Prospect First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            Prospect First Name *
          </label>
          <input
            type="text"
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Sarah"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Prospect Title */}
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Prospect Title *
          </label>
          <input
            type="text"
            id="jobTitle"
            required
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="VP of Sales"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Prospect Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Prospect Company *
          </label>
          <input
            type="text"
            id="company"
            required
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Stripe"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Your Product / Service */}
        <div>
          <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Your Product / Service *
          </label>
          <textarea
            id="productDescription"
            required
            value={formData.productDescription}
            onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
            placeholder="AI-powered sales outreach automation tool that generates personalized cold email openers"
            rows={3}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">1-2 sentences on what you sell</p>
        </div>

        {/* Channel */}
        <div>
          <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-2">
            Channel *
          </label>
          <select
            id="channel"
            value={formData.channel}
            onChange={(e) => setFormData({ ...formData, channel: e.target.value as ProspectInput['channel'] })}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="cold_email">Cold Email</option>
            <option value="linkedin_dm">LinkedIn DM</option>
            <option value="cold_call">Cold Call Opener</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Openers'}
        </button>
      </div>
    </form>
  )
}
