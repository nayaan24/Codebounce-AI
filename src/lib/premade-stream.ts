import { PREMADE_RESPONSES, PREMADE_PROMPTS } from "./premade-responses";
import { getPremadeCode } from "./premade-code";
import type { UIMessage } from "ai";
import type { FreestyleDevServerFilesystem } from "freestyle-sandboxes";

/**
 * Create a streamable response from premade messages
 * This simulates the AI streaming response without using real AI
 * Format matches AI SDK streaming format
 * Files are written when tool calls are streamed to make preview update progressively
 */
export function createPremadeStream(
  prompt: string,
  fs?: FreestyleDevServerFilesystem
) {
  const promptKey = Object.keys(PREMADE_PROMPTS).find(
    (key) => key.toLowerCase() === prompt.toLowerCase()
  );

  if (!promptKey) {
    throw new Error(`No premade response for prompt: ${prompt}`);
  }

  const responseKey = PREMADE_PROMPTS[promptKey as keyof typeof PREMADE_PROMPTS];
  const messages = PREMADE_RESPONSES[responseKey] || [];
  const codeFiles = getPremadeCode(prompt);

  // Create a stream that matches the AI SDK format
  const encoder = new TextEncoder();
  
  // Create an empty stream since messages are already saved to memory
  // This is just to satisfy the stream requirement, but messages will load from memory
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        console.log("[Premade Stream] Creating empty stream (messages already in memory)");
        // Immediately send completion since messages are already in memory
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return {
    toUIMessageStreamResponse: () => ({
      body: stream,
    }),
  };
}
