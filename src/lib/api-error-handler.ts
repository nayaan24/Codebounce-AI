import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Simple, safe error handler for API routes
 * Wraps API handlers to catch errors and return proper responses
 */
export function withErrorHandler<T extends NextRequest>(
  handler: (req: T) => Promise<Response>
) {
  return async (req: T): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      // Log error using logger
      logger.error("API request failed", error, {
        path: req.url,
        method: req.method,
      });

      // Return safe error response
      const statusCode = error instanceof Error && "statusCode" in error 
        ? (error as { statusCode: number }).statusCode 
        : 500;

      return NextResponse.json(
        {
          error: "An error occurred processing your request",
          ...(process.env.NODE_ENV === "development" && {
            message: error instanceof Error ? error.message : String(error),
          }),
        },
        { status: statusCode }
      );
    }
  };
}

/**
 * Validate request body size (simple protection)
 */
export function validateRequestSize(req: NextRequest, maxSizeMB = 5): boolean {
  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
    return sizeMB <= maxSizeMB;
  }
  return true; // If no content-length, allow (streaming requests)
}

