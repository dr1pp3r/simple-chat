"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UseChatHelpers } from "@ai-sdk/react";
import { ArrowRightIcon } from "lucide-react";
import { memo, useRef } from "react";

export function ChatUserInput({
  className,
  input,
  handleInputChange,
  handleSubmit,
  disabled,
}: {
  className?: string;
  input: UseChatHelpers["input"];
  handleInputChange: UseChatHelpers["handleInputChange"];
  handleSubmit: UseChatHelpers["handleSubmit"];
  disabled: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form
      className={cn(
        "h-auto min-h-32 w-full overflow-hidden shrink-0 bg-sidebar backdrop-blur-lg flex flex-col rounded-t-lg [--input-border:hsl(var(--border))] has-[:focus]:border-primary [--input-border-focus:hsl(var(--ring)/40%)",
        className,
      )}
      onClick={() => textareaRef?.current?.focus()}
      onSubmit={handleSubmit}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInputChange}
        placeholder="What should we accomplish today?"
        className="h-full max-h-[400px] p-4 pb-0 resize-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        rows={2}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(undefined);
          }
        }}
      />

      <div className="w-full flex justify-end px-4 py-3">
        <SendButton disabled={disabled} onClick={handleSubmit} />
      </div>
    </form>
  );
}

const SendButton = memo(
  function SendButton({
    disabled,
    ...rest
  }: React.ComponentProps<typeof Button>) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled={disabled}
        {...rest}
        type="submit"
      >
        <ArrowRightIcon className="size-4" />
        <span className="sr-only">Send</span>
      </Button>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.disabled !== nextProps.disabled) return false;
    return true;
  },
);
