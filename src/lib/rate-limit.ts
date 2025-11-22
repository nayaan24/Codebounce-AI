import { NextRequest } from "next/server";
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
    // Atomically increment and get the new count
    const newCount = await redis.incr(key);

    // Set expiration only on first request (when count was 0, now 1)
    if (newCount === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (newCount > maxRequests) {
      // Rate limited
      const ttl = await redis.ttl(key);
      const resetAt = ttl > 0 ? now + (ttl * 1000) : now + windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Under limit
    const remaining = Math.max(0, maxRequests - newCount);
    const ttl = await redis.ttl(key);
    const resetAt = ttl > 0 ? now + (ttl * 1000) : now + windowMs;
    
    return {
      allowed: true,
      remaining,
      resetAt,
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
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip")?.trim() || "unknown";
  return `ip:${ip}`;
}

