"use client";

import Image from "next/image";

import { PromptInputBasic } from "./chatinput";
import { Markdown } from "./ui/markdown";
import { useState, useEffect } from "react";
import { ChatContainer } from "./ui/chat-container";
import { UIMessage } from "ai";
import { ToolMessage } from "./tools";
import { useQuery } from "@tanstack/react-query";
import { chatState } from "@/actions/chat-streaming";
import { CompressedImage } from "@/lib/image-compression";
import { useChatSafe } from "./use-chat";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Chat(props: {
  appId: string;
  initialMessages: UIMessage[];
  isLoading?: boolean;
  topBar?: React.ReactNode;
  running: boolean;
}) {
  const { data: chat } = useQuery({
    queryKey: ["stream", props.appId],
    queryFn: async () => {
      return chatState(props.appId);
    },
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  const shouldResume = props.running && chat?.state === "running";
  console.log("[Chat] Resume check:", { 
    running: props.running, 
    chatState: chat?.state, 
    shouldResume,
    appId: props.appId 
  });

  const { messages, sendMessage } = useChatSafe({
    messages: props.initialMessages,
    id: props.appId,
    resume: shouldResume,
  });

  const [input, setInput] = useState("");
  const [isProUser, setIsProUser] = useState<boolean | null>(null);
  const router = useRouter();

  // Check user plan
  useEffect(() => {
    const checkPlan = async () => {
      try {
        const response = await fetch("/api/test-plan");
        const data = await response.json();
        setIsProUser(data.plan === "pro");
      } catch {
        setIsProUser(false);
      }
    };
    checkPlan();
  }, []);

  const onSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    
    // Block free users from sending messages
    if (!isProUser) {
      toast.error("Want to unlock your full potential? Upgrade to our pro and enjoy!");
      router.push("/pricing");
      return;
    }
    
    sendMessage(
      {
        parts: [
          {
            type: "text",
            text: input,
          },
        ],
      },
      {
        headers: {
          "Adorable-App-Id": props.appId,
        },
      }
    );
    setInput("");
  };

  const onSubmitWithImages = (text: string, images: CompressedImage[]) => {
    const parts: Parameters<typeof sendMessage>[0]["parts"] = [];

    if (text.trim()) {
      parts.push({
        type: "text",
        text: text,
      });
    }

    images.forEach((image) => {
      parts.push({
        type: "file",
        mediaType: image.mimeType,
        url: image.data,
      });
    });

    sendMessage(
      {
        parts,
      },
      {
        headers: {
          "Adorable-App-Id": props.appId,
        },
      }
    );
    setInput("");
  };

  async function handleStop() {
    await fetch("/api/chat/" + props.appId + "/stream", {
      method: "DELETE",
      headers: {
        "Adorable-App-Id": props.appId,
      },
    });
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ transform: "translateZ(0)" }}
    >
      {props.topBar}
      <div
        className="flex-1 overflow-y-auto flex flex-col space-y-6 min-h-0"
        style={{ overflowAnchor: "auto" }}
      >
        <ChatContainer autoScroll>
          {messages
            .filter((message: any, index: number, self: any[]) => {
              // Remove duplicates by checking if this is the first occurrence of this ID
              const isFirst = self.findIndex((m: any) => m.id === message.id) === index;
              
              // Filter out any messages that look like premade prompt buttons
              // (these shouldn't be in messages, but just in case)
              if (message.role === "user") {
                const text = message.parts?.[0]?.text || "";
                if (text.includes("Make me a") || text.includes("Make me an")) {
                  // This might be a premade prompt - check if it's actually a button/UI element
                  return false;
                }
              }
              
              return isFirst;
            })
            .map((message: any, index: number) => (
              <MessageBody key={`${message.id}-${index}`} message={message} />
            ))}
        </ChatContainer>
      </div>
      <div className="flex-shrink-0 p-3 transition-all bg-background md:backdrop-blur-sm">
        {isProUser === false ? (
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Want to unlock your full potential? Upgrade to our pro and enjoy!
            </p>
            <button
              onClick={() => router.push("/pricing")}
              className="rounded-lg border border-border bg-primary text-primary-foreground px-4 py-2 text-sm font-normal transition-all duration-200 hover:bg-primary/90 hover:scale-105"
            >
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <PromptInputBasic
            stop={handleStop}
            input={input}
            onValueChange={(value) => {
              setInput(value);
            }}
            onSubmit={onSubmit}
            onSubmitWithImages={onSubmitWithImages}
            isGenerating={props.isLoading || chat?.state === "running"}
            disabled={isProUser === null || !isProUser}
          />
        )}
      </div>
    </div>
  );
}

function MessageBody({ message }: { message: any }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end py-1 mb-4">
        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-xl px-4 py-1 max-w-[80%] ml-auto">
          {message.parts.map((part: any, index: number) => {
            if (part.type === "text") {
              return <div key={index}>{part.text}</div>;
            } else if (
              part.type === "file" &&
              part.mediaType?.startsWith("image/")
            ) {
              return (
                <div key={index} className="mt-2">
                  <Image
                    src={part.url as string}
                    alt="User uploaded image"
                    width={200}
                    height={200}
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              );
            }
            return <div key={index}>unexpected message</div>;
          })}
        </div>
      </div>
    );
  }

  if (Array.isArray(message.parts) && message.parts.length !== 0) {
    return (
      <div className="mb-4">
        {message.parts.map((part: any, index: any) => {
          if (part.type === "text") {
            return (
              <div key={index} className="mb-4">
                <Markdown className="prose prose-sm dark:prose-invert max-w-none">
                  {part.text}
                </Markdown>
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            // if (
            //   part.toolInvocation.state === "result" &&
            //   part.toolInvocation.result.isError
            // ) {
            //   return (
            //     <div
            //       key={index}
            //       className="border-red-500 border text-sm text-red-800 rounded bg-red-100 px-2 py-1 mt-2 mb-4"
            //     >
            //       {part.toolInvocation.result?.content?.map(
            //         (content: { type: "text"; text: string }, i: number) => (
            //           <div key={i}>{content.text}</div>
            //         )
            //       )}
            //       {/* Unexpectedly failed while using tool{" "}
            //       {part.toolInvocation.toolName}. Please try again. again. */}
            //     </div>
            //   );
            // }

            // if (
            //   message.parts!.length - 1 == index &&
            //   part.toolInvocation.state !== "result"
            // ) {
            return <ToolMessage key={index} toolInvocation={part} />;
            // } else {
            //   return undefined;
            // }
          }
        })}
      </div>
    );
  }

  if (message.parts) {
    return (
      <Markdown className="prose prose-sm dark:prose-invert max-w-none">
        {message.parts
          .map((part: any) =>
            part.type === "text" ? part.text : "[something went wrong]"
          )
          .join("")}
      </Markdown>
    );
  }

  return (
    <div>
      <p className="text-gray-500">Something went wrong</p>
    </div>
  );
}
