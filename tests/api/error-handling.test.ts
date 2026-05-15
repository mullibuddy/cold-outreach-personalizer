import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the env module to avoid validation errors in tests
vi.mock('@/types/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'sk-ant-test-key-123',
    UPSTASH_REDIS_REST_URL: undefined,
    UPSTASH_REDIS_REST_TOKEN: undefined
  }
}))

// Mock dependencies
vi.mock('@/lib/ai/client')
vi.mock('@/lib/rate-limit/limiter')
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn(() => '127.0.0.1')
  }))
}))

import { POST } from '@/app/api/generate/route'

describe('API Route Error Handling - GEN-02, GEN-05, INFRA-04', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('POST /api/generate with valid input returns 200 with OpenerOutput', async () => {
    // Mock successful rate limit check
    const { checkRateLimit } = await import('@/lib/rate-limit/limiter')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 3600000
    })

    // Mock successful Claude response
    const { ClaudeClient } = await import('@/lib/ai/client')
    const mockGenerateOpeners = vi.fn().mockResolvedValue({
      openers: [
        {
          angle: 'trigger',
          hook: 'Recent funding announcement caught my eye...',
          explanation: 'Why This Works: Timing shows awareness',
          followUp: 'Can I share how others handle growth?',
          bestFor: 'cold_email'
        },
        {
          angle: 'pain',
          hook: 'Manual prospecting eating into selling time?',
          explanation: 'Why This Works: Pain is universal for VPs',
          followUp: 'Want to see the automation approach?',
          bestFor: 'linkedin_dm'
        },
        {
          angle: 'curiosity',
          hook: 'Loved your take on AI in sales ops...',
          explanation: 'Why This Works: Social proof builds credibility',
          followUp: 'Have you explored AI personalization?',
          bestFor: 'cold_call'
        }
      ],
      intelSummary: 'Company recently raised Series B funding, expanding sales team.',
      citations: ['https://example.com/news']
    })

    vi.mocked(ClaudeClient).mockImplementation(function() {
      return {
        generateOpeners: mockGenerateOpeners
      } as any
    } as any)

    const request = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Sarah',
        jobTitle: 'VP of Sales',
        company: 'Stripe',
        productDescription: 'AI-powered sales outreach automation',
        channel: 'cold_email'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.openers).toHaveLength(3)
    expect(data.data.citations).toContain('https://example.com/news')
  })

  it('POST /api/generate with invalid input returns 400 with field errors', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        firstName: '',
        jobTitle: 'VP'
        // missing company, productDescription, channel
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.message).toContain('Invalid input')
    expect(data.error.fields).toBeDefined()
    expect(data.error.fields?.firstName).toContain('Please enter a first name')
  })

  it('POST /api/generate enforces rate limit, returns 429 on 11th request', async () => {
    // Mock rate limit exceeded
    const { checkRateLimit } = await import('@/lib/rate-limit/limiter')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 3600000
    })

    const request = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Sarah',
        jobTitle: 'VP of Sales',
        company: 'Stripe',
        productDescription: 'AI-powered sales outreach automation',
        channel: 'cold_email'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error.message).toContain('Rate limit exceeded')
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
  })

  it('POST /api/generate handles Claude API timeout, returns 504 with specific error', async () => {
    // Mock successful rate limit
    const { checkRateLimit } = await import('@/lib/rate-limit/limiter')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 3600000
    })

    // Mock timeout error from ClaudeClient
    const { ClaudeClient } = await import('@/lib/ai/client')
    const mockGenerateOpeners = vi.fn().mockRejectedValue(new Error('Request timed out'))

    vi.mocked(ClaudeClient).mockImplementation(function() {
      return {
        generateOpeners: mockGenerateOpeners
      } as any
    } as any)

    const request = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Sarah',
        jobTitle: 'VP of Sales',
        company: 'Stripe',
        productDescription: 'AI-powered sales outreach automation',
        channel: 'cold_email'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(504)
    expect(data.success).toBe(false)
    expect(data.error.message).toContain('timed out')
  })

  it('POST /api/generate handles Claude API 529 error, returns 503 with retry message', async () => {
    // Mock successful rate limit
    const { checkRateLimit } = await import('@/lib/rate-limit/limiter')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 3600000
    })

    // Mock 529 error from ClaudeClient
    const { ClaudeClient } = await import('@/lib/ai/client')
    const mockGenerateOpeners = vi.fn().mockRejectedValue(
      new Error('Claude API temporarily unavailable')
    )

    vi.mocked(ClaudeClient).mockImplementation(function() {
      return {
        generateOpeners: mockGenerateOpeners
      } as any
    } as any)

    const request = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Sarah',
        jobTitle: 'VP of Sales',
        company: 'Stripe',
        productDescription: 'AI-powered sales outreach automation',
        channel: 'cold_email'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.error.message).toContain('temporarily unavailable')
  })
})
