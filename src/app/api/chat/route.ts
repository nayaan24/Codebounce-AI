import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { UIMessage } from "ai";
import { builderAgent } from "@/mastra/agents/builder";
import { withErrorHandler, validateRequestSize } from "@/lib/api-error-handler";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getUser } from "@/auth/stack-auth";
import { appUsers } from "@/db/schema";
import { db } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { isProUser } from "@/lib/user-plan";

// "fix" mastra mcp bug
import { EventEmitter } from "events";
import {
  isStreamRunning,
  stopStream,
  waitForStreamToStop,
  clearStreamState,
  sendMessageWithStreaming,
  acquireStreamLock,
  releaseStreamLock,
  waitForStreamLock,
} from "@/lib/internal/stream-manager";
EventEmitter.defaultMaxListeners = 1000;

import { NextRequest, NextResponse } from "next/server";

async function handlePOST(req: NextRequest) {
  // Validate request size (max 5MB)
  if (!validateRequestSize(req, 5)) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }

  // Require authentication
  const user = await getUser();
  
  // Check if user is on free plan - block chat for free users
  const proUser = await isProUser();
  if (!proUser) {
    return NextResponse.json(
      {
        error: "Want to unlock your full potential? Upgrade to our pro and enjoy!",
      },
      { status: 403 }
    );
  }
  
  // Rate limiting: 20 requests per minute per user
  const identifier = getRateLimitIdentifier(req, user.userId);
  const rateLimit = await checkRateLimit(identifier, 20, 60);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      }
    );
  }

  console.log("creating new chat stream");
  const appId = getAppIdFromHeaders(req);

  if (!appId) {
    return NextResponse.json(
      { error: "Missing App Id header" },
      { status: 400 }
    );
  }

  const app = await getApp(appId);
  if (!app) {
    return NextResponse.json(
      { error: "App not found" },
      { status: 404 }
    );
  }

  // Verify user has permission to access this app
  const userApp = await db
    .select()
    .from(appUsers)
    .where(and(
      eq(appUsers.appId, appId),
      eq(appUsers.userId, user.userId)
    ))
    .limit(1)
    .then((apps) => apps.at(0));

  if (!userApp) {
    return NextResponse.json(
      { error: "Unauthorized to access this app" },
      { status: 403 }
    );
  }

  // Acquire atomic lock to prevent concurrent streams
  // First, try to stop any existing stream
  if (await isStreamRunning(appId)) {
    console.log("Stopping previous stream for appId:", appId);
    await stopStream(appId);

    // Wait until stream state is cleared
    const stopped = await waitForStreamToStop(appId);
    if (!stopped) {
      await clearStreamState(appId);
      // Release any stale lock
      await releaseStreamLock(appId);
    }
  }

  // Try to acquire lock (wait up to 2 seconds if another request is processing)
  const lockAcquired = await waitForStreamLock(appId, 2);
  if (!lockAcquired) {
    return NextResponse.json(
      { error: "Another request is being processed. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // Lock acquired - ensure we release it on any error
  let lockReleased = false;
  const ensureLockRelease = async () => {
    if (!lockReleased) {
      await releaseStreamLock(appId);
      lockReleased = true;
    }
  };

  // Parse and validate request body
  let messages: UIMessage[];
  try {
    const body = await req.json();
    if (!body.messages || !Array.isArray(body.messages)) {
      await ensureLockRelease();
      return NextResponse.json(
        { error: "Invalid request body: messages array required" },
        { status: 400 }
      );
    }
    messages = body.messages;
    
    // Validate messages array size
    if (messages.length === 0) {
      await ensureLockRelease();
      return NextResponse.json(
        { error: "Messages array cannot be empty" },
        { status: 400 }
      );
    }
  } catch (error) {
    await ensureLockRelease();
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // Request dev server with queueing and rate limiting
  let mcpEphemeralUrl: string;
  let fs: any;
  try {
    const { requestDevServerWithQueue } = await import("@/lib/internal/dev-server-queue");
    const devServer = await requestDevServerWithQueue(app.info.gitRepo, user.userId);
    mcpEphemeralUrl = devServer.mcpEphemeralUrl || devServer.ephemeralUrl;
    fs = devServer.fs;
  } catch (error) {
    console.error("[Dev Server Error]", error);
    await ensureLockRelease();
    const errorMessage = error instanceof Error ? error.message : "Failed to initialize development server";
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes("Rate limit") ? 429 : 503 }
    );
  }

  // Create stream with error handling
  try {
    // Import wrapper instead of direct function
    const { sendMessageWithStreamingWrapper } = await import("@/lib/premade-stream-wrapper");
    const resumableStream = await sendMessageWithStreamingWrapper(
      builderAgent,
      appId,
      mcpEphemeralUrl,
      fs,
      messages.at(-1)!
    );

    const response = resumableStream.response();
    
    // Add rate limit headers to successful response
    response.headers.set("X-RateLimit-Limit", "20");
    response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimit.resetAt));

    // Lock will be released when stream finishes/errors via handleStreamLifecycle
    lockReleased = true;
    return response;
  } catch (error) {
    console.error("[Stream Error]", error);
    // Ensure lock is released on error
    await ensureLockRelease();
    return NextResponse.json(
      { error: "Failed to create chat stream. Please try again." },
      { status: 500 }
    );
  }
}

export const POST = withErrorHandler(handlePOST);
