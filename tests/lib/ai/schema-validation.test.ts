import { describe, it, expect } from 'vitest'
import { OpenerOutputSchema, OpenerSchema } from '@/types/opener'

describe('Opener Schema - OPENER-04, OPENER-05', () => {
  it('validates each opener has hook, explanation, followUp fields', () => {
    const validOpener = {
      angle: 'trigger' as const,
      hook: 'Saw your company just raised Series B...',
      explanation: 'Why This Works: Funding = hiring spike',
      followUp: 'Can I share how we help...',
      bestFor: 'cold_email' as const,
    }

    expect(() => OpenerSchema.parse(validOpener)).not.toThrow()

    const invalidOpener = {
      angle: 'trigger' as const,
      hook: 'Too short',
      // missing explanation and followUp
      bestFor: 'cold_email' as const,
    }

    expect(() => OpenerSchema.parse(invalidOpener)).toThrow()
  })

  it('validates each opener has bestFor channel recommendation', () => {
    const opener = {
      angle: 'pain' as const,
      hook: 'Manual data entry wasting hours...',
      explanation: 'Why This Works: VPs hate inefficiency',
      followUp: 'Want to see how others automate?',
      bestFor: 'linkedin_dm' as const,
    }

    const result = OpenerSchema.parse(opener)
    expect(result.bestFor).toBe('linkedin_dm')
  })

  it('OpenerOutputSchema validates exactly 3 openers', () => {
    const valid = {
      openers: [
        {
          angle: 'trigger' as const,
          hook: 'Recent news about your company...',
          explanation: 'Why This Works: Timing matters',
          followUp: 'Can I share insight?',
          bestFor: 'cold_email' as const,
        },
        {
          angle: 'pain' as const,
          hook: 'Struggling with manual work?',
          explanation: 'Why This Works: Pain is universal',
          followUp: 'Let me show you...',
          bestFor: 'linkedin_dm' as const,
        },
        {
          angle: 'curiosity' as const,
          hook: 'Loved your podcast on growth...',
          explanation: 'Why This Works: Social proof',
          followUp: 'Have you considered...',
          bestFor: 'cold_call' as const,
        },
      ],
      intelSummary: 'Findings from research...',
      citations: ['https://example.com'],
    }

    expect(() => OpenerOutputSchema.parse(valid)).not.toThrow()

    const invalidLength = { ...valid, openers: valid.openers.slice(0, 2) }
    expect(() => OpenerOutputSchema.parse(invalidLength)).toThrow('exactly 3 openers')
  })
})
