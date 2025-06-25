"use client";

import equal from "fast-deep-equal";
import { UIMessage } from "ai";
import { memo } from "react";
import { RPSToolInvocation } from "@/components/chat/rps-tool-invocation";
import { SearchToolInvocation } from "@/components/chat/search-tool-invocation";
import { UseChatHelpers } from "@ai-sdk/react";
import { Markdown } from "@/components/markdown";

function PureChatMessage({
  message,
  addToolResult,
  status,
}: {
  message: UIMessage;
  addToolResult: (params: { toolCallId: string; result: any }) => void;
  status: UseChatHelpers["status"];
}) {
  return (
    <div key={message.id} className="group w-full" data-role={message.role}>
      <div className="flex group-data-[role='user']:justify-end group-data-[role='assistant']:justify-start">
        <div className="space-y-3 rounded-xl rounded-br-none group-data-[role='assistant']:w-full group-data-[role='assistant']:max-w-full group-data-[role='user']:max-w-[80%] group-data-[role='user']:bg-muted group-data-[role='user']:px-4 group-data-[role='user']:py-3 group-data-[role='assistant']:px-0 group-data-[role='assistant']:py-2 overflow-hidden">
          {message.parts?.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="whitespace-pre-wrap prose space-y-2"
                  >
                    <Markdown content={part.text} id={message.id} />
                  </div>
                );
              case "tool-invocation":
                const toolInvocation = part.toolInvocation;
                switch (toolInvocation.toolName) {
                  case "playRockPaperScissors":
                    return (
                      <RPSToolInvocation
                        key={`${message.id}-part-${i}`}
                        toolInvocation={toolInvocation}
                        addToolResult={addToolResult}
                        status={status}
                      />
                    );
                  case "webSearch":
                    return (
                      <SearchToolInvocation
                        key={`${message.id}-part-${i}`}
                        toolInvocation={toolInvocation}
                      />
                    );
                }
              default:
                return null;
            }
          }) || null}
        </div>
      </div>
    </div>
  );
}

export const ChatMessage = memo(PureChatMessage, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) {
    return false;
  }

  if (!equal(prevProps.message, nextProps.message)) {
    return false;
  }

  return true;
});
