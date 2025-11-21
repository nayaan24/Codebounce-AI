import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  headers: {
    ...(process.env.OPENROUTER_SITE && {
      "HTTP-Referer": process.env.OPENROUTER_SITE,
    }),
    ...(process.env.OPENROUTER_APP_TITLE && {
      "X-Title": process.env.OPENROUTER_APP_TITLE,
    }),
  },
});

export const BUILDER_MODEL = openrouter.chat(
  process.env.OPENROUTER_MODEL ?? "openrouter/anthropic/claude-3.5-sonnet"
);
