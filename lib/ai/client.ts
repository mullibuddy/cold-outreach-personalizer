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
      maxRetries: 2, // Limit retries for web search queries
      timeout: 55000, // 55s (leave 5s buffer for 60s route limit)
    })
  }

  /**
   * Extracts JSON from Claude's response, handling markdown code blocks,
   * preamble text, and other formatting issues
   */
  private extractJSON(content: string): string {
    // Try to extract from markdown code block first
    const markdownMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (markdownMatch) {
      return markdownMatch[1].trim()
    }

    // Try to find JSON object by looking for { and matching }
    const firstBrace = content.indexOf('{')
    if (firstBrace === -1) {
      throw new Error('No JSON object found in response')
    }

    // Find matching closing brace
    let depth = 0
    let lastBrace = firstBrace
    for (let i = firstBrace; i < content.length; i++) {
      if (content[i] === '{') depth++
      if (content[i] === '}') {
        depth--
        if (depth === 0) {
          lastBrace = i
          break
        }
      }
    }

    return content.substring(firstBrace, lastBrace + 1).trim()
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
          { type: 'web_search_20250305' as const, name: 'web_search' }
        ],
      })

      // Extract text content from response
      let fullContent = ''
      for (const block of response.content) {
        if (block.type === 'text') {
          fullContent += block.text
        }
      }

      // Extract JSON from response (handles markdown, preamble text, etc.)
      const jsonContent = this.extractJSON(fullContent)

      // Parse JSON response
      const parsed = JSON.parse(jsonContent)

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
