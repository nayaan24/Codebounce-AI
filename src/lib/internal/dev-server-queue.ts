"use server";

import { redis, redisPublisher } from "./redis";
import { freestyle } from "@/lib/freestyle";
import { checkRateLimit } from "@/lib/rate-limit";

interface DevServerRequest {
  repoId: string;
  userId: string;
  requestId: string;
  timestamp: number;
}

interface DevServerResponse {
  ephemeralUrl: string;
  codeServerUrl: string;
  mcpEphemeralUrl?: string;
  fs?: any;
}

/**
 * Rate limit for dev server requests: 5 requests per user per 5 minutes
 */
const DEV_SERVER_RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 300, // 5 minutes
};

/**
 * Maximum concurrent dev server requests to Freestyle API
 * This prevents overwhelming the external API
 */
const MAX_CONCURRENT_REQUESTS = 10;

/**
 * Check if user has exceeded dev server rate limit
 */
export async function checkDevServerRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const identifier = `dev_server:user:${userId}`;
  return checkRateLimit(identifier, DEV_SERVER_RATE_LIMIT.maxRequests, DEV_SERVER_RATE_LIMIT.windowSeconds);
}

/**
 * Get current number of active dev server requests
 */
async function getActiveRequestCount(): Promise<number> {
  try {
    const keys = await redis.keys("dev_server:active:*");
    return keys.length;
  } catch (error) {
    console.error("[Dev Server Queue] Error getting active count:", error);
    return 0;
  }
}

/**
 * Add request to queue and process if under limit
 */
async function enqueueRequest(request: DevServerRequest): Promise<void> {
  const queueKey = `dev_server:queue:${request.userId}`;
  const requestKey = `dev_server:request:${request.requestId}`;
  
  // Store request details
  await redisPublisher.set(
    requestKey,
    JSON.stringify(request),
    { EX: 600 } // 10 minute expiration
  );
  
  // Add to user's queue
  await redisPublisher.lPush(queueKey, request.requestId);
  await redisPublisher.expire(queueKey, 600);
}

/**
 * Process dev server request with retry logic
 */
async function processRequest(
  request: DevServerRequest,
  retryCount: number = 0
): Promise<DevServerResponse> {
  const maxRetries = 2;
  const baseDelay = 2000; // 2 seconds
  
  try {
    const result = await freestyle.requestDevServer({
      repoId: request.repoId,
    });
    
    return {
      ephemeralUrl: result.ephemeralUrl,
      codeServerUrl: result.codeServerUrl,
      mcpEphemeralUrl: result.mcpEphemeralUrl,
      fs: result.fs,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Dev Server Queue] Request failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, errorMessage);
    
    // Retry with exponential backoff
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return processRequest(request, retryCount + 1);
    }
    
    throw new Error(`Failed to start dev server after ${maxRetries + 1} attempts: ${errorMessage}`);
  }
}

/**
 * Request dev server with queueing and rate limiting
 * This is the main function that should be used instead of direct freestyle.requestDevServer()
 * 
 * Simple, Scalable, Secure approach:
 * - Rate limits per user (prevents abuse)
 * - Queues requests when at capacity (prevents API overload)
 * - Retries with backoff (handles transient failures)
 * - Non-blocking (doesn't affect other operations)
 * - Graceful fallback if Redis fails
 */
export async function requestDevServerWithQueue(
  repoId: string,
  userId: string
): Promise<DevServerResponse> {
  // Security: Check rate limit first (prevents abuse)
  let rateLimit;
  try {
    rateLimit = await checkDevServerRateLimit(userId);
  } catch (error) {
    // If rate limiting fails, log but continue (fail open for availability)
    console.error("[Dev Server Queue] Rate limit check failed:", error);
    rateLimit = { allowed: true, remaining: DEV_SERVER_RATE_LIMIT.maxRequests, resetAt: Date.now() + DEV_SERVER_RATE_LIMIT.windowSeconds * 1000 };
  }
  
  if (!rateLimit.allowed) {
    const waitSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    throw new Error(
      `Rate limit exceeded. You can request ${DEV_SERVER_RATE_LIMIT.maxRequests} dev servers per ${DEV_SERVER_RATE_LIMIT.windowSeconds / 60} minutes. Please wait ${waitSeconds} seconds.`
    );
  }
  
  const requestId = `req_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const request: DevServerRequest = {
    repoId,
    userId,
    requestId,
    timestamp: Date.now(),
  };
  
  // Scalability: Check concurrent request limit
  let activeCount: number;
  try {
    activeCount = await getActiveRequestCount();
  } catch (error) {
    // If queue check fails, proceed directly (fail open)
    console.error("[Dev Server Queue] Active count check failed:", error);
    activeCount = 0; // Assume we can process
  }
  
  // If at capacity, queue the request
  if (activeCount >= MAX_CONCURRENT_REQUESTS) {
    await enqueueRequest(request);
    
    // Poll for completion (with reasonable timeout)
    const maxWaitTime = 120000; // 2 minutes max wait
    const pollInterval = 2000; // Check every 2 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const resultKey = `dev_server:result:${request.requestId}`;
      const result = await redis.get(resultKey);
      
      if (result) {
        const parsed = JSON.parse(result);
        // Cleanup
        await redis.del(resultKey);
        await redis.del(`dev_server:request:${request.requestId}`);
        
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        return parsed;
      }
      
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
    
    // Cleanup on timeout
    await redis.del(`dev_server:request:${request.requestId}`);
    throw new Error("Dev server request timed out. The system is busy. Please try again in a moment.");
  }
  
  // Process immediately if under limit
  const activeKey = `dev_server:active:${request.requestId}`;
  try {
    // Mark as active (non-blocking - if it fails, continue anyway)
    redisPublisher.set(activeKey, "1", { EX: 120 }).catch(() => {
      // Ignore - this is just for tracking
    });
    
    // Process with retry logic
    const result = await processRequest(request);
    
    // Process next item in queue (non-blocking, fire and forget)
    // This doesn't block the response - use Promise.resolve for async fire-and-forget
    Promise.resolve().then(() => {
      processNextInQueue(userId).catch((err) => {
        console.error("[Dev Server Queue] Error processing next in queue:", err);
      });
    });
    
    return result;
  } catch (error) {
    // Process next item even on error (don't block queue)
    Promise.resolve().then(() => {
      processNextInQueue(userId).catch((err) => {
        console.error("[Dev Server Queue] Error processing next in queue:", err);
      });
    });
    throw error;
  } finally {
    // Always cleanup active marker (non-blocking)
    redisPublisher.del(activeKey).catch(() => {
      // Ignore cleanup errors
    });
  }
}

/**
 * Process next request in user's queue
 * This runs in the background and doesn't block
 */
async function processNextInQueue(userId: string): Promise<void> {
  const queueKey = `dev_server:queue:${userId}`;
  
  try {
    const activeCount = await getActiveRequestCount();
    if (activeCount >= MAX_CONCURRENT_REQUESTS) {
      return; // Still at limit, can't process more
    }
    
    const requestId = await redisPublisher.rPop(queueKey);
    if (!requestId) {
      return; // No items in queue
    }
    
    const requestKey = `dev_server:request:${requestId}`;
    const requestData = await redis.get(requestKey);
    
    if (!requestData) {
      return; // Request expired or not found
    }
    
    const request: DevServerRequest = JSON.parse(requestData);
    const activeKey = `dev_server:active:${request.requestId}`;
    
    // Mark as active
    await redisPublisher.set(activeKey, "1", { EX: 120 });
    
    // Process in background
    processRequest(request)
      .then((result) => {
        const resultKey = `dev_server:result:${request.requestId}`;
        return redisPublisher.set(resultKey, JSON.stringify(result), { EX: 60 });
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const resultKey = `dev_server:result:${request.requestId}`;
        return redisPublisher.set(
          resultKey,
          JSON.stringify({ error: errorMessage }),
          { EX: 60 }
        );
      })
      .finally(async () => {
        // Cleanup
        await redisPublisher.del(`dev_server:request:${request.requestId}`).catch(() => {});
        await redisPublisher.del(activeKey).catch(() => {});
        
        // Try to process next item (recursive but safe due to queue limits)
        processNextInQueue(userId).catch(() => {
          // Ignore errors in background processing
        });
      });
  } catch (error) {
    console.error("[Dev Server Queue] Error processing queue:", error);
    // Don't throw - this is background processing
  }
}

