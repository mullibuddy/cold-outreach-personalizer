import { describe, it, expect } from 'vitest'
import { buildSalesPrompt } from '@/lib/ai/prompts'
import type { ProspectInput } from '@/types/prospect'

describe('Prompt Voice - Anti-spam Patterns', () => {
  it('explicitly forbids AI clichés in prompt', () => {
    const input: ProspectInput = {
      firstName: 'Sarah',
      jobTitle: 'VP of Sales',
      company: 'Acme Corp',
      productDescription: 'Sales automation platform',
      channel: 'cold_email'
    }

    const prompt = buildSalesPrompt(input)

    // Verify prompt includes explicit instruction to avoid clichés
    expect(prompt).toContain('NEVER use AI clichés')
  })

  it('lists specific clichés to avoid', () => {
    const input: ProspectInput = {
      firstName: 'John',
      jobTitle: 'CEO',
      company: 'StartupXYZ',
      productDescription: 'AI analytics tool',
      channel: 'linkedin_dm'
    }

    const prompt = buildSalesPrompt(input)

    // Verify specific clichés are listed
    expect(prompt).toContain('I hope this email finds you well')
    expect(prompt).toContain('reaching out')
    expect(prompt).toContain('just wanted to')
    expect(prompt).toContain('thought you might be interested')
  })

  it('instructs to write like human text message', () => {
    const input: ProspectInput = {
      firstName: 'Mike',
      jobTitle: 'CTO',
      company: 'TechCo',
      productDescription: 'DevOps platform',
      channel: 'cold_call'
    }

    const prompt = buildSalesPrompt(input)

    expect(prompt).toContain('casual, direct, specific')
  })
})
