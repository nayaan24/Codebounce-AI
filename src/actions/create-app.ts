"use server";

import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/db/schema";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory, builderAgent } from "@/mastra/agents/builder";
import { sendMessageWithStreamingWrapper } from "@/lib/premade-stream-wrapper";

export async function createApp({
  initialMessage,
  templateId,
  isPremade,
}: {
  initialMessage?: string;
  templateId: string;
  isPremade?: boolean;
}) {
  console.time("get user");
  const user = await getUser();
  console.timeEnd("get user");

  if (!templates[templateId]) {
    throw new Error(
      `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
    );
  }

  let repo;
  let token;
  try {
    console.time("git");
    repo = await freestyle.createGitRepository({
      name: "Unnamed App",
      public: true,
      source: {
        type: "git",
        url: templates[templateId].repo,
      },
    });
    await freestyle.grantGitPermission({
      identityId: user.freestyleIdentity,
      repoId: repo.repoId,
      permission: "write",
    });

    token = await freestyle.createGitAccessToken({
      identityId: user.freestyleIdentity,
    });
  } finally {
    console.timeEnd("git");
  }

  let mcpEphemeralUrl: string;
  let fs;
  try {
    console.time("dev server");
    // Use queue system with rate limiting for scalability
    const { requestDevServerWithQueue } = await import("@/lib/internal/dev-server-queue");
    const devServerResult = await requestDevServerWithQueue(repo.repoId, user.userId);
    mcpEphemeralUrl = devServerResult.mcpEphemeralUrl || devServerResult.ephemeralUrl;
    fs = devServerResult.fs;
  } finally {
    console.timeEnd("dev server");
  }

  let app;
  try {
    console.time("database: create app");
    app = await db.transaction(async (tx) => {
      const appInsertion = await tx
        .insert(appsTable)
        .values({
          gitRepo: repo.repoId,
          name: initialMessage,
        })
        .returning();

      await tx
        .insert(appUsers)
        .values({
          appId: appInsertion[0].id,
          userId: user.userId,
          permissions: "admin",
          freestyleAccessToken: token.token,
          freestyleAccessTokenId: token.id,
          freestyleIdentity: user.freestyleIdentity,
        })
        .returning();

      return appInsertion[0];
    });
  } finally {
    console.timeEnd("database: create app");
  }

  try {
    console.time("mastra: create thread");
    await memory.createThread({
      threadId: app.id,
      resourceId: app.id,
    });
  } finally {
    console.timeEnd("mastra: create thread");
  }

  if (initialMessage) {
    try {
      console.time("send initial message");

      // Send the initial message using wrapper (handles free vs pro users)
      await sendMessageWithStreamingWrapper(builderAgent, app.id, mcpEphemeralUrl, fs, {
        id: crypto.randomUUID(),
        parts: [
          {
            text: initialMessage,
            type: "text",
          },
        ],
        role: "user",
      }, isPremade);
    } finally {
      console.timeEnd("send initial message");
    }
  }

  return app;
}
