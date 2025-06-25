"use client";

import { AppBrand } from "@/components/app-brand";
import { UseChatHelpers } from "@ai-sdk/react";

const suggestions = [
  {
    label: "games",
    prompt: "Play rock, paper, scissors against me",
  },
  {
    label: "web search",
    prompt: "What's the weather in Jamaica?",
  },
  {
    label: "jokes",
    prompt: "Tell me a funny joke",
  },
  {
    label: "weird",
    prompt: "Act like a pirate",
  },
];

export function ChatSplash({ append }: { append: UseChatHelpers["append"] }) {
  return (
    <div className="h-full w-full max-w-3xl mx-auto flex flex-col justify-center gap-6 px-4">
      <AppBrand className="self-auto text-lg inline-flex w-fit" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => append({ role: "user", content: suggestion.prompt })}
            className="p-4 border border-border rounded-lg hover:border-border/80 hover:bg-accent/50 transition-colors text-left group flex flex-col justify-start"
          >
            <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 mb-1">
              {suggestion.label}
            </div>
            <div className="text-sm text-foreground group-hover:text-foreground/90">
              {suggestion.prompt}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
