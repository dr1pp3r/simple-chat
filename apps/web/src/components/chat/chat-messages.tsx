import { ChatMessage } from "@/components/chat/chat-message";
import { UIMessage } from "ai";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { UseChatHelpers } from "@ai-sdk/react";
import { memo } from "react";
import equal from "fast-deep-equal";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

function PureChatMessages({
  messages,
  addToolResult,
  status,
}: {
  messages: UIMessage[];
  addToolResult: (params: { toolCallId: string; result: any }) => void;
  status: UseChatHelpers["status"];
}) {
  const { containerRef, bottomRef } = useAutoScroll();

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto flex flex-col gap-2 px-6 pt-12 md:pt-16">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            addToolResult={addToolResult}
            status={status}
          />
        ))}
        {status === "submitted" && (
          <div>
            <AnimatedShinyText>
              <span>Thinking...</span>
            </AnimatedShinyText>
          </div>
        )}
        {status === "error" && (
          <Alert variant="destructive" className="w-fit">
            <AlertTitle className="flex items-center gap-1">
              <AlertCircleIcon className="size-4" />
              Uh oh!
            </AlertTitle>
            <AlertDescription>
              We were unable to process your request.
            </AlertDescription>
          </Alert>
        )}
        <div className="h-10" ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}

export const ChatMessages = memo(PureChatMessages, (prevProps, nextProps) => {
  const { messages: prevMessages, status: prevStatus } = prevProps;
  const { messages: nextMessages, status: nextStatus } = nextProps;

  if (prevStatus !== nextStatus) {
    return false;
  }

  if (prevMessages.length !== nextMessages.length) {
    return false;
  }

  if (prevMessages.length === nextMessages.length) {
    const lastMessage = prevMessages[prevMessages.length - 1];
    const nextLastMessage = nextMessages[nextMessages.length - 1];
    return equal(lastMessage, nextLastMessage);
  }

  return true;
});
