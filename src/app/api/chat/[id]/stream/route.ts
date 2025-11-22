import { getStream, stopStream } from "@/lib/internal/stream-manager";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logger.debug("GET stream for appId", { appId: id });
    
    const currentStream = await getStream(id);

    if (!currentStream) {
      return new Response();
    }

    return currentStream?.response();
  } catch (error) {
    logger.error("Failed to get stream", error);
    return NextResponse.json(
      { error: "Failed to retrieve stream" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    await stopStream(appId);

    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    logger.error("Failed to stop stream", error);
    return NextResponse.json(
      { error: "Failed to stop stream" },
      { status: 500 }
    );
  }
}
