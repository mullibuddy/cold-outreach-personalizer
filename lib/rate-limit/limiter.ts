import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Lazy initialization to support runtime env var changes (e.g., in tests)
let rateLimiter: Ratelimit | null = null

function getRateLimiter(): Ratelimit | null {
  // Return cached instance if exists
  if (rateLimiter) {
    return rateLimiter
  }

  // Only create rate limiter if Upstash credentials are configured
  // This allows local development without Upstash account
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    rateLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'ratelimit',
    })
    return rateLimiter
  }

  return null
}

export async function checkRateLimit(
  ip: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = getRateLimiter()

  // If rate limiter not configured (local dev), allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: 10,
      remaining: 10,
      reset: Date.now() + 3600000, // 1 hour from now
    }
  }

  return await limiter.limit(ip)
}

// Export for testing
export { rateLimiter }
