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
      let statusCode = 500;
      if (error instanceof Error && "statusCode" in error) {
        const code = (error as { statusCode: number }).statusCode;
        // Validate statusCode is a number within valid HTTP range (100-599)
        if (typeof code === "number" && code >= 100 && code <= 599) {
          statusCode = code;
        }
      }

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
  // Validate maxSizeMB is positive
  if (maxSizeMB <= 0) {
    return false;
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const sizeBytes = parseInt(contentLength, 10);
    
    // Check for NaN or negative values
    if (isNaN(sizeBytes) || sizeBytes < 0) {
      return false;
    }
    
    const sizeMB = sizeBytes / (1024 * 1024);
    return sizeMB <= maxSizeMB;
  }
  return true; // If no content-length, allow (streaming requests)
}

