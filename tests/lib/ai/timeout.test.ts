/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse, delay } from 'msw'

// Mock the env module to avoid validation errors in tests
vi.mock('@/types/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'sk-ant-test-key-123',
    UPSTASH_REDIS_REST_URL: undefined,
    UPSTASH_REDIS_REST_TOKEN: undefined
  }
}))

import { ClaudeClient } from '@/lib/ai/client'

const handlers = [
  http.post('https://api.anthropic.com/v1/messages', async () => {
    // Return a fast response
    return HttpResponse.json({
      id: 'msg_test123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
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

describe('Generation Timeout - GEN-02', () => {
  it('completes generation within 30 seconds under normal conditions', async () => {
    // This is tested via MSW - normal responses complete quickly
    const client = new ClaudeClient()
    const input = {
      firstName: 'John',
      jobTitle: 'VP Sales',
      company: 'Acme Corp',
      productDescription: 'Sales automation software',
      channel: 'cold_email' as const,
    }

    const start = Date.now()
    const result = await client.generateOpeners(input)
    const duration = Date.now() - start

    expect(duration).toBeLessThan(30000)
    expect(result.openers).toHaveLength(3)
  })

  it('ClaudeClient is configured with 25s timeout', () => {
    // Verify that the timeout configuration is set correctly
    // The actual timeout behavior is covered by integration tests
    const client = new ClaudeClient()

    // Access the private client property to verify timeout configuration
    // This ensures the 25s timeout is configured (leaving 5s buffer for 30s Vercel limit)
    const anthropicClient = (client as any).client
    expect(anthropicClient).toBeDefined()
    expect(anthropicClient.timeout).toBe(25000)
  })
})
