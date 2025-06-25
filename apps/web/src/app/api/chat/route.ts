import {
  appendClientMessage,
  appendResponseMessages,
  Message,
  smoothStream,
  streamText,
  createDataStreamResponse,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { PostRequestBody, postRequestBodySchema } from "./schema";
import { auth } from "@/lib/auth";
import {
  createChat,
  getChatById,
  getChatMessages,
  saveChatMessages,
  saveUserMessage,
} from "@/lib/queries";
import { generateTitleFromUserMessage } from "@/app/(platform)/chat/actions";
import {
  cleanMessageParts,
  processRpsToolInvocation,
} from "@/app/api/chat/helpers";
import { ChatMessage } from "simple-chat/db";
import { systemPrompt } from "@/lib/ai/prompts";
import { playRockPaperScissors, webSearch } from "@/lib/ai/tools";
import {
  BadRequestError,
  ErrorWithResponse,
  InternalServerError,
  UnauthorizedError,
} from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedError();
    }

    let requestBody: PostRequestBody;
    try {
      const json = await request.json();
      requestBody = postRequestBodySchema.parse(json);
    } catch {
      throw new BadRequestError();
    }

    /**
     * Get chat if it exists, otherwise create a new one.
     */
    const { id: chatId, message } = requestBody;

    let chat = await getChatById({ id: chatId });
    let previousMessages: ChatMessage[] = [];

    if (chat) {
      if (chat?.userId !== session.user.id) {
        throw new UnauthorizedError();
      }
      previousMessages = await getChatMessages({ chatId: requestBody.id });
    } else {
      const title = await generateTitleFromUserMessage(message.content);
      chat = await createChat({
        id: chatId,
        userId: session.user.id,
        title,
      });
    }

    const cleanedMessage = {
      chatId,
      id: message.id,
      role: message.role,
      parts: cleanMessageParts(message.parts),
      attachments: message.experimental_attachments || [],
      createdAt: message.createdAt,
      content: message.content,
    };

    await saveUserMessage({
      userId: session.user.id,
      message: cleanedMessage,
    });

    return createDataStreamResponse({
      execute: async (dataStream) => {
        /**
         * Process tool invocations requiring human-in-the-loop first (RPS).
         */
        if (message.parts) {
          message.parts = await Promise.all(
            message.parts.map(async (part) => {
              if (part.type !== "tool-invocation") {
                return part;
              }

              // Tool invocation parts aren't typed but will be in ai-sdk v5
              const toolInvocation = part.toolInvocation as any;
              if (
                toolInvocation.toolName === "playRockPaperScissors" &&
                toolInvocation.state === "result"
              ) {
                return await processRpsToolInvocation({ part, dataStream });
              }

              return part;
            }),
          );
        }

        const result = streamText({
          model: openai("gpt-4o"),
          system: systemPrompt,
          messages: appendClientMessage({
            // @ts-expect-error TODO add casting for message parts
            messages: previousMessages,
            message: requestBody.message as Message,
          }),
          maxSteps: 5,
          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: () => crypto.randomUUID(),
          tools: {
            playRockPaperScissors,
            webSearch,
          },
          onFinish: async ({ response }) => {
            // hacky but oh well, whipped this up in a hurry
            const messagesToSave = appendResponseMessages({
              messages: [message as Message],
              responseMessages: response.messages,
            });
            await saveChatMessages({
              messages: messagesToSave.map((message) => ({
                ...message,
                chatId,
                attachments: message.experimental_attachments || [],
                parts: message.parts || [],
                content: message.content,
              })),
            });
          },
        });

        result.mergeIntoDataStream(dataStream);
      },
    });
  } catch (e) {
    if (e instanceof ErrorWithResponse) {
      return e.toResponse();
    }
    return new InternalServerError().toResponse();
  }
}
