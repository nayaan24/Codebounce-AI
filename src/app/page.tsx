"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserButton, useUser } from "@stackframe/stack";
import { Paperclip, Hand } from "lucide-react";

import LogoMark from "@/logo.svg";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { FrameworkSelector } from "@/components/framework-selector";
import { Button } from "@/components/ui/button";
import { PromptInputTextareaWithTypingAnimation } from "@/components/prompt-input";
import { UserApps } from "@/components/user-apps";

const queryClient = new QueryClient();

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "community">("projects");
  const router = useRouter();
  const user = useUser();

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    router.push(
      `/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-gray-600/30 px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1 className="font-pixelated text-xl text-white logo-shadow">code bounce</h1>
            <div className="flex items-center gap-3">
              {user ? (
                <UserButton />
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="rounded-lg border-gray-500/50 bg-white px-6 py-2 text-sm font-normal text-black transition-all duration-200 hover:bg-gray-100 hover:scale-105"
                    onClick={() => router.push("/handler/login")}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-lg border-gray-500/50 bg-gray-400/20 px-6 py-2 text-sm font-normal text-white transition-all duration-200 hover:bg-gray-400/30 hover:scale-105"
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
            <h2 className="font-pixelated text-5xl text-white sm:text-6xl md:text-7xl logo-shadow-main animate-fade-in">
              code bounce
            </h2>
          </div>

          {/* Input Field */}
          <div className="mb-8">
            <div className="relative flex items-center gap-4 rounded-lg border border-gray-500/50 bg-transparent p-4 input-container transition-all duration-300">
              {/* Cursor Icon */}
              <div className="flex-shrink-0 animate-float">
                <Hand className="h-6 w-6 text-white" />
              </div>

              {/* Input */}
              <div className="flex-1">
                <PromptInput
                  isLoading={isLoading}
                  value={prompt}
                  onValueChange={setPrompt}
                  onSubmit={handleSubmit}
                  className="border-none bg-transparent p-0"
                >
                  <PromptInputTextareaWithTypingAnimation />
                </PromptInput>
              </div>

              {/* Circular Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-500/50 bg-gray-400/20 text-white transition-all duration-200 hover:bg-gray-400/30 hover:scale-110"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !prompt.trim()}
                  className="rounded-full border border-gray-500/50 bg-gray-400/20 px-4 py-2 text-xs font-normal text-white transition-all duration-200 hover:bg-gray-400/30 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  GO
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto rounded-lg border border-gray-500/50 bg-transparent p-6">
            {/* Tabs */}
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`rounded-full px-6 py-2 text-sm font-normal transition-colors ${
                  activeTab === "projects"
                    ? "bg-gray-400/20 text-white"
                    : "bg-gray-400/10 text-white/60 hover:bg-gray-400/15"
                }`}
              >
                Your Projects
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("community")}
                className={`rounded-full px-6 py-2 text-sm font-normal transition-colors ${
                  activeTab === "community"
                    ? "bg-gray-400/20 text-white"
                    : "bg-gray-400/10 text-white/60 hover:bg-gray-400/15"
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
                <div className="flex items-center justify-center py-12 text-white/40">
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

