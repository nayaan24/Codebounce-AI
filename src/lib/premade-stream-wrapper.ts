import { isProUser } from "./user-plan";
import { isPremadePrompt, getPremadeResponse } from "./premade-responses";
import { createPremadeStream } from "./premade-stream";
import { 
  sendMessageWithStreaming, 
  handleStreamLifecycle, 
  setupAbortCallback,
  setStream 
} from "./internal/stream-manager";
import { AIService } from "./internal/ai-service";
import type { UIMessage } from "ai";
import type { Agent } from "@mastra/core";
import type { FreestyleDevServerFilesystem } from "freestyle-sandboxes";

/**
 * Wrapper around sendMessageWithStreaming that uses premade responses for free users
 * This avoids touching the core AI workflow
 */
export async function sendMessageWithStreamingWrapper(
  agent: Agent,
  appId: string,
  mcpUrl: string,
  fs: FreestyleDevServerFilesystem,
  message: UIMessage,
  isPremade?: boolean
) {
  const proUser = await isProUser();
  const messageText = message.parts[0]?.type === "text" ? message.parts[0].text : "";

  // If it's a premade prompt or user is free, use premade response
  if ((isPremade || isPremadePrompt(messageText)) && !proUser) {
    console.log("[Premade] Using premade response for:", messageText);
    console.log("[Premade] App ID:", appId);
    
    // Set up abort callback
    await setupAbortCallback(appId, () => {
      // Handle abort if needed
    });
    
    const memory = await agent.getMemory();
    const premadeResponses = getPremadeResponse(messageText);
    
    // Write files immediately so preview shows up right away
    const { getPremadeCode } = await import("./premade-code");
    const codeFiles = getPremadeCode(messageText);
    if (fs && codeFiles) {
      try {
        console.log("[Premade] Writing files immediately...");
        for (const [filePath, content] of Object.entries(codeFiles)) {
          await fs.writeFile(filePath, content);
          console.log(`[Premade] Wrote file: ${filePath}`);
        }
      } catch (error) {
        console.error("[Premade] Error writing files:", error);
      }
    }
    
    // Save ALL messages (user + assistant) to memory immediately
    // This makes everything appear right away when page loads
    if (memory) {
      const allMessages = [
        {
          content: {
            parts: message.parts,
            format: 3,
          },
          role: "user",
          createdAt: new Date(),
          id: message.id,
          threadId: appId,
          type: "text",
          resourceId: appId,
        },
        ...premadeResponses.map((msg: UIMessage) => ({
          content: {
            parts: msg.parts,
            format: 3,
          },
          role: "assistant",
          createdAt: new Date(),
          id: msg.id,
          threadId: appId,
          type: "text",
          resourceId: appId,
        })),
      ];
      
      await memory.saveMessages({
        messages: allMessages,
      });
      console.log("[Premade] Saved all messages to memory");
    }
    
    // Create an empty stream (messages are already in memory)
    const premadeStream = createPremadeStream(messageText, fs);

    // Set up finish callback to clear state immediately after stream is set
    // Since messages are already in memory, we don't need to wait for stream consumption
    const streamResponse = await setStream(appId, message, premadeStream as any);
    
    // Clear stream state immediately since everything is already in memory
    setTimeout(async () => {
      await handleStreamLifecycle(appId, "finish");
    }, 1000);

    return streamResponse;
  }

  // Otherwise, use real AI (pro users or non-premade prompts)
  return await sendMessageWithStreaming(agent, appId, mcpUrl, fs, message);
}

