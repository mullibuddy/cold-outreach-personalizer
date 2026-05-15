/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import type { ProspectInput } from '@/types/prospect'

// Mock the env module to avoid validation errors in tests
vi.mock('@/types/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'sk-ant-test-key-123',
    UPSTASH_REDIS_REST_URL: undefined,
    UPSTASH_REDIS_REST_TOKEN: undefined
  }
}))

import { ClaudeClient } from '@/lib/ai/client'

// Mock Anthropic API responses
const handlers = [
  http.post('https://api.anthropic.com/v1/messages', async () => {
    // Mock streaming response with 3 distinct openers
    const mockResponse = {
      openers: [
        {
          angle: 'trigger',
          hook: 'Saw you just raised Series A. Congrats! Funding rounds usually mean 2-3x headcount growth in 6 months.',
          explanation: 'Why This Works: Funding announcements = hiring spikes = onboarding pain points',
          followUp: 'Mind if I share how we helped another Series A company cut onboarding time by 40%?',
          bestFor: 'cold_email'
        },
        {
          angle: 'pain',
          hook: 'Most VPs of Sales I talk to hate spending 2+ hours daily on CRM data entry instead of coaching reps.',
          explanation: 'Why This Works: Pain-first approach resonates with time-starved executives',
          followUp: 'Want to see how we automate 80% of that CRM work?',
          bestFor: 'linkedin_dm'
        },
        {
          angle: 'curiosity',
          hook: 'Read your LinkedIn post about scaling outbound. You mentioned "quality over quantity" - curious how you measure quality?',
          explanation: 'Why This Works: Referencing their content shows genuine interest and research',
          followUp: 'We built a quality scoring system that might align with your approach.',
          bestFor: 'cold_call'
        }
      ],
      intelSummary: '- Company recently announced Series A funding [https://techcrunch.com/example]\n- VP of Sales role typically manages team of 10-15 reps\n- Industry faces 35% avg churn in sales roles',
      citations: [
        'https://techcrunch.com/example',
        'https://linkedin.com/posts/example'
      ]
    }

    // Simulate streaming response by returning text delta chunks
    return HttpResponse.json({
      id: 'msg_test123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockResponse)
        }
      ],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 500 }
    })
  })
]

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ClaudeClient - generateOpeners', () => {
  it('returns OpenerOutput with exactly 3 openers (trigger, pain, curiosity angles)', async () => {
    const client = new ClaudeClient()
    const input: ProspectInput = {
      firstName: 'Sarah',
      jobTitle: 'VP of Sales',
      company: 'Acme Corp',
      productDescription: 'Sales automation platform',
      channel: 'cold_email'
    }

    const result = await client.generateOpeners(input)

    expect(result.openers).toHaveLength(3)
    expect(result.openers[0]?.angle).toBe('trigger')
    expect(result.openers[1]?.angle).toBe('pain')
    expect(result.openers[2]?.angle).toBe('curiosity')
  })

  it('includes citations array with valid URLs from web search', async () => {
    const client = new ClaudeClient()
    const input: ProspectInput = {
      firstName: 'John',
      jobTitle: 'CEO',
      company: 'StartupXYZ',
      productDescription: 'AI analytics tool',
      channel: 'linkedin_dm'
    }

    const result = await client.generateOpeners(input)

    expect(result.citations).toBeDefined()
    expect(Array.isArray(result.citations)).toBe(true)
    expect(result.citations.length).toBeGreaterThan(0)

    // Validate URLs
    result.citations.forEach((citation) => {
      expect(citation).toMatch(/^https?:\/\//)
    })
  })

  it('includes intelSummary from research findings', async () => {
    const client = new ClaudeClient()
    const input: ProspectInput = {
      firstName: 'Mike',
      jobTitle: 'CTO',
      company: 'TechCo',
      productDescription: 'DevOps platform',
      channel: 'cold_call'
    }

    const result = await client.generateOpeners(input)

    expect(result.intelSummary).toBeDefined()
    expect(typeof result.intelSummary).toBe('string')
    expect(result.intelSummary.length).toBeGreaterThan(20)
  })
})
