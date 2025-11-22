import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { UIMessage } from "ai";
import { builderAgent } from "@/mastra/agents/builder";
import { withErrorHandler, validateRequestSize } from "@/lib/api-error-handler";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getUser } from "@/auth/stack-auth";

// "fix" mastra mcp bug
import { EventEmitter } from "events";
import {
  isStreamRunning,
  stopStream,
  waitForStreamToStop,
  clearStreamState,
  sendMessageWithStreaming,
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

  // Rate limiting: 20 requests per minute per user
  const user = await getUser().catch(() => null);
  const identifier = getRateLimitIdentifier(req, user?.userId);
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

  // Check if a stream is already running and stop it if necessary
  if (await isStreamRunning(appId)) {
    console.log("Stopping previous stream for appId:", appId);
    await stopStream(appId);

    // Wait until stream state is cleared
    const stopped = await waitForStreamToStop(appId);
    if (!stopped) {
      await clearStreamState(appId);
      return NextResponse.json(
        { error: "Previous stream is still shutting down, please try again" },
        { status: 429 }
      );
    }
  }

  // Parse and validate request body
  let messages: UIMessage[];
  try {
    const body = await req.json();
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request body: messages array required" },
        { status: 400 }
      );
    }
    messages = body.messages;
    
    // Validate messages array size
    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array cannot be empty" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // Request dev server with error handling
  let mcpEphemeralUrl: string;
  let fs: any;
  try {
    const devServer = await freestyle.requestDevServer({
      repoId: app.info.gitRepo,
    });
    mcpEphemeralUrl = devServer.mcpEphemeralUrl;
    fs = devServer.fs;
  } catch (error) {
    console.error("[Dev Server Error]", error);
    return NextResponse.json(
      { error: "Failed to initialize development server. Please try again." },
      { status: 503 }
    );
  }

  // Create stream with error handling
  try {
    const resumableStream = await sendMessageWithStreaming(
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

    return response;
  } catch (error) {
    console.error("[Stream Error]", error);
    return NextResponse.json(
      { error: "Failed to create chat stream. Please try again." },
      { status: 500 }
    );
  }
}

export const POST = withErrorHandler(handlePOST);
