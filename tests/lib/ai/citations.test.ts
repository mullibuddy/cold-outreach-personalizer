import { describe, it, expect } from 'vitest'
import { OpenerOutputSchema } from '@/types/opener'

describe('Citation Validation', () => {
  it('validates citations as URLs', () => {
    const validOutput = {
      openers: [
        {
          angle: 'trigger' as const,
          hook: 'Test hook with sufficient length to meet minimum requirement',
          explanation: 'Test explanation',
          followUp: 'Test follow-up',
          bestFor: 'cold_email' as const
        },
        {
          angle: 'pain' as const,
          hook: 'Test hook with sufficient length to meet minimum requirement',
          explanation: 'Test explanation',
          followUp: 'Test follow-up',
          bestFor: 'linkedin_dm' as const
        },
        {
          angle: 'curiosity' as const,
          hook: 'Test hook with sufficient length to meet minimum requirement',
          explanation: 'Test explanation',
          followUp: 'Test follow-up',
          bestFor: 'cold_call' as const
        }
      ],
      intelSummary: 'Test summary with sufficient length',
      citations: [
        'https://example.com',
        'https://techcrunch.com/article'
      ]
    }

    const result = OpenerOutputSchema.safeParse(validOutput)
    expect(result.success).toBe(true)
  })

  it('rejects invalid citations', () => {
    const invalidOutput = {
      openers: [
        {
          angle: 'trigger' as const,
          hook: 'Test hook with sufficient length to meet minimum requirement',
          explanation: 'Test explanation',
          followUp: 'Test follow-up',
          bestFor: 'cold_email' as const
        },
        {
          angle: 'pain' as const,
          hook: 'Test hook with sufficient length to meet minimum requirement',
          explanation: 'Test explanation',
          followUp: 'Test follow-up',
          bestFor: 'linkedin_dm' as const
        },
        {
          angle: 'curiosity' as const,
          hook: 'Test hook with sufficient length to meet minimum requirement',
          explanation: 'Test explanation',
          followUp: 'Test follow-up',
          bestFor: 'cold_call' as const
        }
      ],
      intelSummary: 'Test summary with sufficient length',
      citations: [
        'not-a-url',
        'also-invalid'
      ]
    }

    const result = OpenerOutputSchema.safeParse(invalidOutput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(issue =>
        issue.path.includes('citations')
      )).toBe(true)
    }
  })
})
