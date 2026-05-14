import { describe, it, expect } from 'vitest'
import { ProspectInputSchema, OpenerSchema } from '@/types'

describe('ProspectInput Validation', () => {
  it('should validate valid prospect input', () => {
    const valid = {
      firstName: "John",
      jobTitle: "VP of Sales",
      company: "Acme Corp",
      productDescription: "Enterprise sales automation platform",
      channel: "cold_email" as const
    }

    expect(() => ProspectInputSchema.parse(valid)).not.toThrow()
  })

  it('should reject empty firstName', () => {
    const invalid = {
      firstName: "",
      jobTitle: "VP",
      company: "Acme",
      productDescription: "Product description here",
      channel: "cold_email" as const
    }

    expect(() => ProspectInputSchema.parse(invalid)).toThrow()
  })

  it('should reject short productDescription', () => {
    const invalid = {
      firstName: "John",
      jobTitle: "VP",
      company: "Acme",
      productDescription: "Too short",
      channel: "cold_email" as const
    }

    expect(() => ProspectInputSchema.parse(invalid)).toThrow()
  })

  it('should reject invalid channel', () => {
    const invalid = {
      firstName: "John",
      jobTitle: "VP",
      company: "Acme",
      productDescription: "Product description here",
      channel: "invalid_channel"
    }

    expect(() => ProspectInputSchema.parse(invalid)).toThrow()
  })
})

describe('Opener Validation', () => {
  it('should validate valid opener', () => {
    const valid = {
      angle: "trigger" as const,
      hook: "Congratulations on the Series B announcement!",
      explanation: "This opener references recent funding news",
      followUp: "Would love to discuss how we help scaling companies",
      bestFor: "cold_email" as const
    }

    expect(() => OpenerSchema.parse(valid)).not.toThrow()
  })

  it('should reject short hook', () => {
    const invalid = {
      angle: "trigger" as const,
      hook: "Too short",
      explanation: "Explanation here",
      followUp: "Follow up here",
      bestFor: "cold_email" as const
    }

    expect(() => OpenerSchema.parse(invalid)).toThrow()
  })
})
