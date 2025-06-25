import "server-only";
import { generateText, tool } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { searchQueryPrompt } from "@/lib/ai/prompts";
import { exa } from "@/lib/exa-client";

export const playRockPaperScissors = tool({
  description: "Start a game of Rock Paper Scissors with the user",
  parameters: z.object({}),
});

export const webSearch = tool({
  description: "Search the web for information",
  parameters: z.object({
    userInquiry: z.string().describe("The raw user inquiry"),
  }),
  execute: async ({ userInquiry }) => {
    const { text: query } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: searchQueryPrompt(userInquiry),
    });

    const { results } = await exa.searchAndContents(query, {
      summary: {
        query:
          "Return relevant content from the page that likely answers the user's inquiry.",
      },
      numResults: 5,
    });

    return results;
  },
});
