import { describe, it, expect } from 'vitest'
import { buildSalesPrompt } from '@/lib/ai/prompts'
import type { ProspectInput } from '@/types/prospect'

describe('Prompt Channel Calibration', () => {
  it('includes cold_email specific instructions', () => {
    const input: ProspectInput = {
      firstName: 'Sarah',
      jobTitle: 'VP of Sales',
      company: 'Acme Corp',
      productDescription: 'Sales automation platform',
      channel: 'cold_email'
    }

    const prompt = buildSalesPrompt(input)

    expect(prompt).toContain('Subject line matters')
    expect(prompt).toContain('2-3 sentences max')
    expect(prompt).toContain('Single clear CTA')
  })

  it('includes linkedin_dm specific instructions', () => {
    const input: ProspectInput = {
      firstName: 'John',
      jobTitle: 'CEO',
      company: 'StartupXYZ',
      productDescription: 'AI analytics tool',
      channel: 'linkedin_dm'
    }

    const prompt = buildSalesPrompt(input)

    expect(prompt).toContain('No subject line')
    expect(prompt).toContain('Even shorter (2 sentences)')
    expect(prompt).toContain('Reference mutual connections')
  })

  it('includes cold_call specific instructions', () => {
    const input: ProspectInput = {
      firstName: 'Mike',
      jobTitle: 'CTO',
      company: 'TechCo',
      productDescription: 'DevOps platform',
      channel: 'cold_call'
    }

    const prompt = buildSalesPrompt(input)

    expect(prompt).toContain('Conversational opening')
    expect(prompt).toContain('Assume interruption')
    expect(prompt).toContain('Get permission to continue')
  })
})
