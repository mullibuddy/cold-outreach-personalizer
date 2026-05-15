/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Upstash modules
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      // Mock Redis client
    }))
  }
}))

vi.mock('@upstash/ratelimit', () => {
  // Track call count per IP
  const callCounts = new Map<string, number>()

  class RatelimitMock {
    static slidingWindow(limit: number, window: string) {
      return { limit, window }
    }

    limit = vi.fn(async (ip: string) => {
      const count = (callCounts.get(ip) || 0) + 1
      callCounts.set(ip, count)

      // Simulate rate limiting: first 10 calls succeed, 11th fails
      if (count <= 10) {
        return {
          success: true,
          limit: 10,
          remaining: 10 - count,
          reset: Date.now() + 3600000
        }
      } else {
        return {
          success: false,
          limit: 10,
          remaining: 0,
          reset: Date.now() + 3600000
        }
      }
    })

    constructor(_config: any) {
      // Mock constructor
    }
  }

  return {
    Ratelimit: RatelimitMock
  }
})

describe('Rate Limiting - INFRA-02', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset module state between tests
    vi.resetModules()
  })

  it('allows first 10 requests within 1 hour', async () => {
    // Set env vars to enable rate limiting
    process.env.UPSTASH_REDIS_REST_URL = 'https://mock.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token'

    // Import after env vars are set
    const { checkRateLimit } = await import('@/lib/rate-limit/limiter')

    const results = []
    for (let i = 0; i < 10; i++) {
      const result = await checkRateLimit('192.168.1.1')
      results.push(result)
    }

    // All 10 requests should succeed
    results.forEach(result => {
      expect(result.success).toBe(true)
    })
  })

  it('returns success: false on 11th request within same hour', async () => {
    // Set env vars to enable rate limiting
    process.env.UPSTASH_REDIS_REST_URL = 'https://mock.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token'

    // Import after env vars are set
    const { checkRateLimit } = await import('@/lib/rate-limit/limiter')

    // Make 11 requests
    const results = []
    for (let i = 0; i < 11; i++) {
      const result = await checkRateLimit('192.168.1.2')
      results.push(result)
    }

    // 11th request should fail
    expect(results[10]?.success).toBe(false)
  })

  it('includes limit, remaining, and reset metadata', async () => {
    // Set env vars to enable rate limiting
    process.env.UPSTASH_REDIS_REST_URL = 'https://mock.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token'

    // Import after env vars are set
    const { checkRateLimit } = await import('@/lib/rate-limit/limiter')

    const result = await checkRateLimit('192.168.1.3')

    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('limit')
    expect(result).toHaveProperty('remaining')
    expect(result).toHaveProperty('reset')
    expect(result.limit).toBe(10)
  })

  it('gracefully degrades when Upstash not configured (local dev)', async () => {
    // Clear env vars to simulate local development
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    // Import after env vars are cleared
    const { checkRateLimit } = await import('@/lib/rate-limit/limiter')

    const result = await checkRateLimit('192.168.1.4')

    // Should allow all requests when not configured
    expect(result.success).toBe(true)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(10)
  })
})
