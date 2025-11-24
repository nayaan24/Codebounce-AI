import type { UIMessage } from "ai";

/**
 * Premade responses for free users
 * These simulate AI responses without using real AI
 */

export const PREMADE_PROMPTS = {
  "Make me a Landing page": "landing-page",
  "Make me a simple Snake Game": "snake-game",
  "Make me a online store for my bakery": "bakery-store",
} as const;

export type PremadePromptType = keyof typeof PREMADE_PROMPTS;

/**
 * Premade AI responses that will be streamed to free users
 */
export const PREMADE_RESPONSES: Record<string, UIMessage[]> = {
  "landing-page": [
    {
      id: "premade-1",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "I'll create a stunning landing page for you! Let me start by setting up the project structure and creating a modern, eye-catching design.",
        },
      ],
    },
    {
      id: "premade-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "First, I'll create the main page component with a beautiful hero section, gradient background, and smooth animations...",
        },
      ],
    },
    {
      id: "premade-3",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_file",
          toolInvocation: {
            toolName: "edit_file",
            toolCallId: "premade-tool-1",
            state: "output-available",
            input: {
              path: "app/page.tsx",
              target_file: "app/page.tsx",
              instructions: "I'm creating a beautiful landing page with hero section, gradient background, call-to-action buttons, and smooth animations.",
              code_edit: "// Creating landing page component with modern design",
            },
            output: {
              isError: false,
              content: [
                {
                  type: "text",
                  text: "Successfully created app/page.tsx with landing page component",
                },
              ],
            },
            result: {
              isError: false,
              content: [
                {
                  type: "text",
                  text: "Successfully created app/page.tsx with landing page component",
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: "premade-4",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Perfect! I've created a modern, responsive landing page with:\n\n✨ **Hero Section**\n- Eye-catching gradient background\n- Compelling headline and subheadline\n- Smooth animations and hover effects\n\n🎨 **Design Features**\n- Modern glassmorphism effects\n- Responsive design for all devices\n- Professional call-to-action buttons\n- Smooth transitions and animations\n\n🚀 **Ready to Launch**\nThe landing page is now live! You can see it in the preview panel. The design is fully responsive and will look great on desktop, tablet, and mobile devices.",
        },
      ],
    },
  ],
  "snake-game": [
    {
      id: "premade-1",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "I'll create a classic Snake game for you! This will be a fully interactive game using HTML5 Canvas with smooth gameplay and score tracking.",
        },
      ],
    },
    {
      id: "premade-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Let me set up the game logic: canvas rendering, snake movement, food generation, collision detection, and score system...",
        },
      ],
    },
    {
      id: "premade-3",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_file",
          toolInvocation: {
            toolName: "edit_file",
            toolCallId: "premade-tool-1",
            state: "output-available",
            input: {
              path: "app/page.tsx",
              target_file: "app/page.tsx",
              instructions: "I'm creating a Snake game with canvas rendering, game loop, collision detection, arrow key controls, and score tracking.",
              code_edit: "// Creating Snake game with full game logic",
            },
            output: {
              isError: false,
              content: [
                {
                  type: "text",
                  text: "Successfully created app/page.tsx with Snake game component",
                },
              ],
            },
            result: {
              isError: false,
              content: [
                {
                  type: "text",
                  text: "Successfully created app/page.tsx with Snake game component",
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: "premade-4",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Awesome! I've built a fully functional Snake game with:\n\n🎮 **Game Features**\n- Smooth canvas-based rendering\n- Arrow key controls (WASD also works!)\n- Real-time score tracking\n- Game over detection\n- Random food generation\n- Smooth 60fps game loop\n\n🎯 **How to Play**\n- Use arrow keys to control the snake\n- Eat the red food to grow and score points\n- Avoid hitting the walls or yourself\n- Try to beat your high score!\n\nThe game is ready in the preview! Click on the preview and use arrow keys to start playing.",
        },
      ],
    },
  ],
  "bakery-store": [
    {
      id: "premade-1",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "I'll create a beautiful online store for your bakery! This will include a product catalog, shopping cart, and a smooth checkout experience.",
        },
      ],
    },
    {
      id: "premade-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Let me build the store with product listings, add-to-cart functionality, cart management, and a beautiful bakery-themed design...",
        },
      ],
    },
    {
      id: "premade-3",
      role: "assistant",
      parts: [
        {
          type: "tool-edit_file",
          toolInvocation: {
            toolName: "edit_file",
            toolCallId: "premade-tool-1",
            state: "output-available",
            input: {
              path: "app/page.tsx",
              target_file: "app/page.tsx",
              instructions: "I'm creating an online bakery store with product catalog, shopping cart functionality, add to cart feature, and checkout flow with beautiful bakery-themed styling.",
              code_edit: "// Creating bakery store with products, cart, and checkout",
            },
            output: {
              isError: false,
              content: [
                {
                  type: "text",
                  text: "Successfully created app/page.tsx with bakery store component",
                },
              ],
            },
            result: {
              isError: false,
              content: [
                {
                  type: "text",
                  text: "Successfully created app/page.tsx with bakery store component",
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: "premade-4",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Perfect! I've created a complete online bakery store with:\n\n🍰 **Product Catalog**\n- Beautiful product cards with emoji icons\n- Product names and prices\n- Add to cart buttons\n- Responsive grid layout\n\n🛒 **Shopping Cart**\n- Real-time cart updates\n- Quantity management\n- Total price calculation\n- Clean cart interface\n\n🎨 **Design Features**\n- Warm, bakery-themed color scheme\n- Smooth hover effects\n- Professional checkout button\n- Mobile-responsive design\n\n✨ **Ready for Customers**\nYour bakery store is live! Customers can browse products, add items to their cart, and see the total. The store is fully functional and ready to accept orders!",
        },
      ],
    },
  ],
};

/**
 * Get premade response for a prompt
 */
export function getPremadeResponse(prompt: string): UIMessage[] | null {
  const promptKey = Object.keys(PREMADE_PROMPTS).find(
    (key) => key.toLowerCase() === prompt.toLowerCase()
  ) as PremadePromptType | undefined;

  if (!promptKey) {
    return null;
  }

  const responseKey = PREMADE_PROMPTS[promptKey];
  return PREMADE_RESPONSES[responseKey] || null;
}

/**
 * Check if a prompt is a premade prompt
 */
export function isPremadePrompt(prompt: string): boolean {
  return Object.keys(PREMADE_PROMPTS).some(
    (key) => key.toLowerCase() === prompt.toLowerCase()
  );
}
