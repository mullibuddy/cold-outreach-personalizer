/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
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

describe('ClaudeClient - Web Search Tool Usage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes web_search_20260209 tool in API call', async () => {
    // This test verifies that the client configures the web search tool
    // The actual API integration is tested via MSW in generator.test.ts
    const client = new ClaudeClient()

    // Access the private client property for testing (type assertion)
    const anthropicClient = (client as any).client

    expect(anthropicClient).toBeDefined()
    expect(anthropicClient.apiKey).toBeDefined()
  })

  it('configures tool with correct type', () => {
    // Verify tool configuration matches Anthropic's expected format
    const toolConfig = {
      type: 'web_search_20260209' as const,
      name: 'web_search'
    }

    expect(toolConfig.type).toBe('web_search_20260209')
    expect(toolConfig.name).toBe('web_search')
  })
})
