import { redis } from "@/lib/internal/redis";

/**
 * Simple rate limiting using Redis
 * Returns true if request should be allowed, false if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  try {
    // Get current count
    const count = await redis.get(key);
    const currentCount = count ? parseInt(count, 10) : 0;

    if (currentCount >= maxRequests) {
      // Rate limited - get TTL to know when it resets
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + (ttl * 1000),
      };
    }

    // Increment counter
    if (currentCount === 0) {
      // First request in window - set with expiration
      await redis.set(key, "1", { EX: windowSeconds });
    } else {
      // Increment existing
      await redis.incr(key);
    }

    const newCount = currentCount + 1;
    const remaining = Math.max(0, maxRequests - newCount);
    const ttl = await redis.ttl(key);
    
    return {
      allowed: true,
      remaining,
      resetAt: now + (ttl * 1000),
    };
  } catch (error) {
    // If Redis fails, allow request (fail open for availability)
    console.error("[Rate Limit Error]", error);
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: now + windowMs,
    };
  }
}

/**
 * Get rate limit identifier from request (user ID or IP)
 */
export function getRateLimitIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  // Fallback to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

