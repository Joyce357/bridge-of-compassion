// ─── Rate Limiting ────────────────────────────────────────────────────────
// Uses Upstash Redis sliding-window rate limiter.
//
// Behaviour:
//   Development (no Redis env vars): gracefully skips — returns { success: true }
//   Production  (no Redis env vars): BLOCKS all requests — logs critical error
//   Any env     (Redis configured):  enforces the limit via Upstash
//
// Public submission endpoints that MUST have rate limiting in production:
//   /api/contact, /api/volunteer, /api/newsletter, /api/donations

export interface RateLimitResult {
  success:  boolean
  limit?:   number
  remaining?: number
  reset?:   number
  error?:   string
}

/**
 * Check rate limit for a given identifier (e.g. IP address + route).
 * @param identifier - Unique string per client+route (e.g. "contact:1.2.3.4")
 * @param limit      - Max requests per window (default: 5)
 * @param window     - Time window string (default: "10 m")
 */
export async function checkRateLimit(
  identifier: string,
  limit   = 5,
  window  = '10 m',
): Promise<RateLimitResult> {
  const hasRedis =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN

  if (!hasRedis) {
    if (process.env.NODE_ENV === 'production') {
      // Fail closed in production — protect endpoints even without Redis
      console.error(
        '[RateLimit] CRITICAL: Rate limiting is disabled because UPSTASH_REDIS_REST_URL',
        'and UPSTASH_REDIS_REST_TOKEN are not configured.',
        'Public submission endpoints are unprotected. Configure Upstash Redis immediately.',
      )
      return {
        success: false,
        error:   'Rate limiting not configured. Service temporarily unavailable.',
      }
    }

    // Development: skip rate limiting
    return { success: true }
  }

  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis }     = await import('@upstash/redis')

    const redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    // Parse window string (e.g. "10 m", "1 h", "30 s")
    const [amount, unit] = window.split(' ')
    const duration = `${amount} ${unit}` as Parameters<typeof Ratelimit.slidingWindow>[1]

    const ratelimit = new Ratelimit({
      redis,
      limiter:   Ratelimit.slidingWindow(limit, duration),
      analytics: true,
      prefix:    'boc_rl',
    })

    const result = await ratelimit.limit(identifier)

    return {
      success:   result.success,
      limit:     result.limit,
      remaining: result.remaining,
      reset:     result.reset,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[RateLimit] Error:', message)

    // If Redis call fails in production, fail closed
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Rate limit check failed.' }
    }

    // In development, fail open so work can continue
    return { success: true }
  }
}

/**
 * Get the client IP from a Next.js request, handling proxies.
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
