"use server";

import { requestDevServerWithQueue } from "@/lib/internal/dev-server-queue";
import { getUser } from "@/auth/stack-auth";

export async function requestDevServer({ repoId }: { repoId: string }) {
  // Get user for rate limiting and queueing
  const user = await getUser();
  
  // Use queue system with rate limiting
  const result = await requestDevServerWithQueue(repoId, user.userId);

  return {
    ephemeralUrl: result.ephemeralUrl,
    devCommandRunning: true,
    installCommandRunning: false,
    codeServerUrl: result.codeServerUrl,
    mcpEphemeralUrl: result.mcpEphemeralUrl,
  };
}
