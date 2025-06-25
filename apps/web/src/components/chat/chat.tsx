"use client";

import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatUserInput } from "@/components/chat/chat-user-input";
import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import type { Chat } from "simple-chat/db";
import { useRouter } from "next/navigation";
import { ChatSplash } from "@/components/chat/chat-splash";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: UIMessage[];
}) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const {
    append,
    messages,
    input,
    handleInputChange,
    handleSubmit: handleSubmitOriginal,
    addToolResult,
    status,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
    }),
    generateId: () => crypto.randomUUID(),
    onFinish: async () => {
      mutate("/api/history");
      router.replace(`/chat/${id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const hasPendingRpsToolInvocation = messages[
    messages.length - 1
  ]?.parts?.some(
    (part) =>
      part.type === "tool-invocation" &&
      part.toolInvocation.toolName === "playRockPaperScissors" &&
      part.toolInvocation.state === "call",
  );

  const handleSubmit = () => {
    if (hasPendingRpsToolInvocation) {
      toast.error(
        "Please take action on the previous message before continuing to chat.",
      );
      return;
    }
    handleSubmitOriginal(undefined);
    window.history.replaceState({}, "", `/chat/${id}`);
  };

  return (
    <div className="flex flex-col min-w-0 h-full md:h-[calc(100vh-16px)]">
      {messages.length === 0 && (
        <div className="flex-1 px-4">
          <ChatSplash append={append} />
        </div>
      )}
      {messages.length > 0 && (
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            status={status}
            messages={messages}
            addToolResult={addToolResult}
          />
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto flex flex-col px-4">
        <ChatUserInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          disabled={
            status === "error" ||
            status === "submitted" ||
            status === "streaming" ||
            !input?.trim().length ||
            !!hasPendingRpsToolInvocation
          }
        />
      </div>
    </div>
  );
}
