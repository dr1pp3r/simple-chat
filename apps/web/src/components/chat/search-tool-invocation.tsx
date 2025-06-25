"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolInvocation } from "ai";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  id?: string;
  url: string;
  title: string;
  author?: string;
  summary: string;
  image?: string;
}

export function SearchToolInvocation({
  toolInvocation,
}: {
  toolInvocation: ToolInvocation;
}) {
  const { state: toolState, result: toolResult } =
    toolInvocation as ToolInvocation & {
      result?: SearchResult[];
    };

  if (toolState === "call" || !toolResult) {
    return (
      <Card className="border-border pb-0 gap-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Web Search</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="overflow-x-auto rounded-b-[calc(var(--radius)-1px)] scrollbar-thin"
            role="region"
            aria-label="Search results carousel"
            tabIndex={0}
          >
            <div className="flex gap-3 p-4 pt-0 w-max">
              {[...Array(5)].map((_, index) => (
                <ArticleSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const results = toolResult || [];

  return (
    <Card className="w-full border-border overflow-hidden pb-0 gap-0">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Web Search</CardTitle>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="overflow-x-auto rounded-b-[calc(var(--radius)-1px)] scrollbar-thin"
          role="region"
          aria-label="Search results carousel"
          tabIndex={0}
        >
          <div className="flex gap-3 p-4 pt-0 w-max">
            {results.map((result: SearchResult, index: number) => (
              <article
                key={result.id || `result-${index}`}
                className="group relative flex min-w-[320px] max-w-[320px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <header className="flex gap-2">
                    <div className="relative h-8 w-8 flex-shrink-0">
                      <Image
                        src={`https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}&sz=32`}
                        alt=""
                        fill
                        className="rounded object-contain"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                        {result.title}
                      </h3>
                      {result.author && (
                        <p className="text-xs text-muted-foreground">
                          {result.author}
                        </p>
                      )}
                    </div>
                  </header>

                  <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {result.summary}
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 self-end text-xs"
                    asChild
                  >
                    <Link
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View source for ${result.title}`}
                    >
                      View Source
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ArticleSkeleton = memo(function ArticleSkeleton() {
  return (
    <article className="group relative flex min-w-[320px] max-w-[320px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <header className="flex gap-2">
          <Skeleton className="h-8 w-8 flex-shrink-0 rounded" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-1" />
          </div>
        </header>

        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        <Skeleton className="h-8 w-24 self-end" />
      </div>
    </article>
  );
});
