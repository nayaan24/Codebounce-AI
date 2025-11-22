import { getStream, stopStream } from "@/lib/internal/stream-manager";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getUser } from "@/auth/stack-auth";
import { appUsers } from "@/db/schema";
import { db } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await getUser();
    
    const { id: appId } = await params;
    logger.debug("GET stream for appId", { appId });

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
    
    const currentStream = await getStream(appId);

    if (!currentStream) {
      return new Response(null, { status: 404 });
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
    // Require authentication
    const user = await getUser();
    
    const { id: appId } = await params;

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
