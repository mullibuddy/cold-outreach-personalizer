import { z } from 'zod'

// Source: CONTEXT.md environment variable decisions + RESEARCH.md Pattern 2
const serverEnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', {
    message: "ANTHROPIC_API_KEY must be a valid Anthropic API key starting with 'sk-ant-'. Get one from https://console.anthropic.com/"
  }),
  // Upstash Redis for rate limiting (optional for local dev)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional()
})

// Validate at module load time (startup)
// This will throw and prevent app from starting if ANTHROPIC_API_KEY is missing/invalid
// Per CONTEXT.md: "fail fast if ANTHROPIC_API_KEY missing to prevent runtime errors"
export const env = serverEnvSchema.parse({
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN
})

// Usage in API routes: import { env } from '@/types/env'
// env.ANTHROPIC_API_KEY is typed and validated
