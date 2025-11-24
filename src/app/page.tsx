"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserButton, useUser } from "@stackframe/stack";
import { Paperclip, Hand, Lock } from "lucide-react";

import LogoMark from "@/logo.svg";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { FrameworkSelector } from "@/components/framework-selector";
import { Button } from "@/components/ui/button";
import { PromptInputTextareaWithTypingAnimation } from "@/components/prompt-input";
import { UserApps } from "@/components/user-apps";
import { useProjectOpening } from "@/contexts/project-opening-context";
import { ModeToggle } from "@/components/theme-provider";
import { toast } from "sonner";
import { Logo } from "@/components/logo";

const queryClient = new QueryClient();

const PREMADE_PROMPTS = [
  "Make me a Landing page",
  "Make me a simple Snake Game",
  "Make me a online store for my bakery",
] as const;

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "community">("projects");
  const [isProUser, setIsProUser] = useState<boolean | null>(null);
  const [testPlan, setTestPlan] = useState<"free" | "pro">("free");
  const router = useRouter();
  const user = useUser();
  const { isAnyProjectOpening, isAnyProjectDeleting } = useProjectOpening();
  
  const isAnyOperationInProgress = isAnyProjectOpening || isAnyProjectDeleting;

  // Check user plan
  useEffect(() => {
    const checkPlan = async () => {
      try {
        const response = await fetch("/api/test-plan");
        const data = await response.json();
        setTestPlan(data.plan || "free");
        setIsProUser(data.plan === "pro");
      } catch {
        setIsProUser(false);
      }
    };
    checkPlan();
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim() || isAnyOperationInProgress) return;
    
    // Block free users from typing custom prompts
    if (!isProUser) {
      toast.error("Want to unlock your full potential? Upgrade to our pro and enjoy!");
      return;
    }
    
    setIsLoading(true);
    router.push(
      `/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`
    );
  };

  const handlePremadePrompt = (premadePrompt: string) => {
    if (isAnyOperationInProgress) return;
    setIsLoading(true);
    router.push(
      `/app/new?message=${encodeURIComponent(premadePrompt)}&template=${framework}&premade=true`
    );
  };

  const toggleTestPlan = async () => {
    const newPlan = testPlan === "free" ? "pro" : "free";
    try {
      await fetch("/api/test-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      setTestPlan(newPlan);
      setIsProUser(newPlan === "pro");
      toast.success(`Switched to ${newPlan} plan`);
    } catch {
      toast.error("Failed to switch plan");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border px-0 py-0">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Logo 
                width={120} 
                height={120}
                onClick={() => router.push("/")}
              />
              <button
                onClick={() => router.push("/pricing")}
                className="text-sm font-normal text-foreground/80 transition-colors hover:text-foreground"
              >
                Pricing
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* Test Toggle Button */}
              <Button
                variant="outline"
                className="rounded-lg border-border bg-secondary text-secondary-foreground px-3 py-1.5 text-xs font-normal transition-all duration-200 hover:bg-secondary/80"
                onClick={toggleTestPlan}
                title="Toggle between Free/Pro for testing"
              >
                {testPlan === "pro" ? "🧪 Pro" : "🧪 Free"}
              </Button>
              <ModeToggle />
              {user ? (
                <UserButton />
              ) : (
                <>
              <Button
                variant="outline"
                className="rounded-lg border-border bg-primary text-primary-foreground px-6 py-2 text-sm font-normal transition-all duration-200 hover:bg-primary/90 hover:scale-105"
                onClick={() => router.push("/handler/login")}
              >
                Log In
              </Button>
              <Button
                variant="outline"
                className="rounded-lg border-border bg-secondary text-secondary-foreground px-6 py-2 text-sm font-normal transition-all duration-200 hover:bg-secondary/80 hover:scale-105"
                onClick={() => router.push("/handler/signup")}
              >
                Get Started
              </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col px-6 py-12">
          {/* Large Title */}
          <div className="mb-12 text-center">
            <h2 className="font-pixelated text-5xl text-foreground sm:text-6xl md:text-7xl logo-shadow-main animate-fade-in">
              codebounce
            </h2>
          </div>

          {/* Input Field or Premade Prompts */}
          <div className="mb-8">
            {isProUser ? (
              // Pro users see the normal input
              <div className={`relative flex items-center gap-4 rounded-lg border bg-transparent p-4 input-container transition-all duration-300 ${
                isAnyOperationInProgress 
                  ? "border-border/50 opacity-50 cursor-not-allowed" 
                  : "border-border"
              }`}>
                {/* Cursor Icon */}
                <div className="flex-shrink-0 animate-float">
                  <Hand className="h-6 w-6 text-foreground" />
                </div>

                {/* Input */}
                <div className="flex-1">
                  <PromptInput
                    isLoading={isLoading}
                    value={prompt}
                    onValueChange={setPrompt}
                    onSubmit={handleSubmit}
                    className="border-none bg-transparent p-0"
                    disabled={isAnyOperationInProgress}
                  >
                    <PromptInputTextareaWithTypingAnimation />
                  </PromptInput>
                </div>

                {/* Circular Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-all duration-200 hover:bg-secondary/80 hover:scale-110"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt.trim() || isAnyOperationInProgress}
                    className="rounded-full border border-border bg-secondary text-secondary-foreground px-4 py-2 text-xs font-normal transition-all duration-200 hover:bg-secondary/80 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    GO
                  </button>
                </div>
              </div>
            ) : (
              // Free users see premade prompts
              <div className="space-y-4">
                <div className="relative flex items-center gap-4 rounded-lg border border-border bg-transparent p-4 input-container">
                  <div className="flex-shrink-0">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Want to unlock your full potential? Upgrade to our pro and enjoy!"
                      className="w-full bg-transparent text-muted-foreground placeholder:text-muted-foreground/70 border-none outline-none cursor-not-allowed"
                      disabled
                      onFocus={(e) => {
                        e.target.blur();
                        toast.error("Want to unlock your full potential? Upgrade to our pro and enjoy!");
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Try these premade prompts:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PREMADE_PROMPTS.map((premadePrompt) => (
                      <button
                        key={premadePrompt}
                        onClick={() => handlePremadePrompt(premadePrompt)}
                        disabled={isAnyOperationInProgress || isLoading}
                        className="rounded-lg border border-border bg-secondary text-secondary-foreground px-4 py-3 text-sm font-normal transition-all duration-200 hover:bg-secondary/80 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-left"
                      >
                        {premadePrompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="mt-auto rounded-lg border border-border bg-card p-6">
            {/* Tabs */}
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`rounded-full px-6 py-2 text-sm font-normal transition-colors ${
                  activeTab === "projects"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Your Projects
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("community")}
                className={`rounded-full px-6 py-2 text-sm font-normal transition-colors ${
                  activeTab === "community"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                community
              </button>
            </div>

            {/* Content */}
            <div className="min-h-[200px]">
              {activeTab === "projects" ? (
                <UserApps />
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <p className="text-sm">Community projects coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}

