import { describe, it, expect, beforeEach } from 'vitest'
import { z } from 'zod'

describe('Environment Validation', () => {
  const originalEnv = process.env.ANTHROPIC_API_KEY

  beforeEach(() => {
    // Restore original env before each test
    if (originalEnv) {
      process.env.ANTHROPIC_API_KEY = originalEnv
    }
  })

  it('should validate correct ANTHROPIC_API_KEY format', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-12345'

    const envSchema = z.object({
      ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-')
    })

    expect(() => envSchema.parse({
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
    })).not.toThrow()
  })

  it('should reject ANTHROPIC_API_KEY without sk-ant- prefix', () => {
    process.env.ANTHROPIC_API_KEY = 'invalid-key-format'

    const envSchema = z.object({
      ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-')
    })

    expect(() => envSchema.parse({
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
    })).toThrow()
  })

  it('should reject missing ANTHROPIC_API_KEY', () => {
    const envSchema = z.object({
      ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-')
    })

    expect(() => envSchema.parse({
      ANTHROPIC_API_KEY: undefined
    })).toThrow()
  })
})
