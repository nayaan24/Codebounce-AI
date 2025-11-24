import { useRef } from "react";
import { PromptInputTextarea } from "./ui/prompt-input";
import { useTypingAnimation } from "../hooks/typing-animation";

export function PromptInputTextareaWithTypingAnimation() {
  const placeholderRef = useRef<HTMLTextAreaElement>(null);

  const exampleIdeas = [
    "a dog food marketplace",
    "a personal portfolio website for my mother's bakery",
    "a B2B SaaS for burrito shops to sell burritos",
    "a social network for coders to find grass to touch",
  ];

  const { displayText } = useTypingAnimation({
    texts: exampleIdeas,
    baseText: "I want to build",
    typingSpeed: 100,
    erasingSpeed: 50,
    pauseDuration: 2000,
    initialDelay: 500,
  });

  return (
    <PromptInputTextarea
      ref={placeholderRef}
      placeholder={displayText || "MAKE A WONDERFUL APP |"}
      className="min-h-[60px] w-full bg-transparent pr-12 text-foreground placeholder:text-muted-foreground text-base"
      onBlur={() => {}}
    />
  );
}
