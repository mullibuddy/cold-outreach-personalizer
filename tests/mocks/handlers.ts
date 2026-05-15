import { http, HttpResponse } from 'msw'
import type { OpenerOutput } from '@/types/opener'

/**
 * MSW request handlers for Claude API mocking in tests
 * Pattern from 02-RESEARCH.md: MSW API Mocking for Tests
 */
export const handlers = [
  // Mock Claude Messages API endpoint
  http.post('https://api.anthropic.com/v1/messages', async () => {
    // Mock OpenerOutput structure with 3 distinct openers
    const mockResponse: OpenerOutput = {
      openers: [
        {
          angle: 'trigger',
          hook: 'Saw your Series B announcement last week - congrats on the $50M raise',
          explanation: 'References recent company funding event to establish relevance and timeliness',
          followUp: 'How are you planning to scale your sales team with the new capital?',
          bestFor: 'cold_email',
        },
        {
          angle: 'pain',
          hook: 'Most VPs of Sales struggle to get reps productive in under 90 days',
          explanation: 'Addresses role-specific challenge of new hire ramp time',
          followUp: 'What\'s your current onboarding timeline looking like?',
          bestFor: 'linkedin_dm',
        },
        {
          angle: 'curiosity',
          hook: 'Quick question about your Q4 pipeline velocity',
          explanation: 'Uses insight-based question to pique interest',
          followUp: 'Are you seeing conversion rates hold steady as deal sizes increase?',
          bestFor: 'cold_call',
        },
      ],
      intelSummary: 'TechCorp recently raised $50M Series B led by Accel Partners. VP of Sales Sarah Chen joined 6 months ago from Salesforce. Company is scaling rapidly with 40% QoQ growth.',
      citations: [
        'https://techcrunch.com/2026/05/01/techcorp-raises-50m',
        'https://www.linkedin.com/in/sarahchen',
        'https://techcorp.com/press/series-b-announcement',
      ],
    }

    // Return mock response with proper Claude API structure
    return HttpResponse.json({
      id: 'msg_01mock123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockResponse),
        },
      ],
      model: 'claude-sonnet-4-5-20250929',
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 150,
        output_tokens: 250,
      },
    })
  }),
]
