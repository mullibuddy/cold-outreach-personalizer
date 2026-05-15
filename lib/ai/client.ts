import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/types/env'
import { ProspectInput } from '@/types/prospect'
import { OpenerOutput, OpenerOutputSchema } from '@/types/opener'
import { buildSalesPrompt } from './prompts'

export class ClaudeClient {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      maxRetries: 2, // Reduce retries to fit in 30s window
      timeout: 28000, // 28s (leave 2s buffer for 30s route limit)
    })
  }

  async generateOpeners(input: ProspectInput): Promise<OpenerOutput> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: buildSalesPrompt(input) }
        ],
        tools: [
          { type: 'web_search_20260209' as const, name: 'web_search' }
        ],
      })

      // Extract text content from response
      let fullContent = ''
      for (const block of response.content) {
        if (block.type === 'text') {
          fullContent += block.text
        }
      }

      // Parse JSON response
      const parsed = JSON.parse(fullContent)

      // Validate with Zod schema
      const validated = OpenerOutputSchema.parse(parsed)

      return validated
    } catch (error) {
      // Handle Anthropic SDK errors (Pattern 4 from research)
      if (error instanceof Anthropic.APIError) {
        if (error.status === 429) {
          const retryAfter = error.headers?.['retry-after']
          throw new Error(`Claude API rate limited. Retry after ${retryAfter}s`)
        } else if (error.status === 529) {
          throw new Error('Claude API temporarily unavailable. Try again shortly.')
        } else if (error.status && error.status >= 500) {
          throw new Error('Claude API server error. Please try again.')
        }
      }

      // Timeout errors
      if (error instanceof Error &&
          (error.name === 'AbortError' || error.message.includes('timeout'))) {
        throw new Error('Request timed out. Try again with simpler query.')
      }

      throw error
    }
  }
}
