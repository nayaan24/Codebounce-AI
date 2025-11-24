"use server";

import { requestDevServerWithQueue } from "@/lib/internal/dev-server-queue";
import { getUser } from "@/auth/stack-auth";

export async function getCodeServerUrl({
  repoId,
}: {
  repoId: string;
  baseId: string;
}): Promise<string> {
  // Get user for rate limiting and queueing
  const user = await getUser();
  
  // Use queue system with rate limiting
  const { codeServerUrl } = await requestDevServerWithQueue(repoId, user.userId);

  return codeServerUrl;
}
