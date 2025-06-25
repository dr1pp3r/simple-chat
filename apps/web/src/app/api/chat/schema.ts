import { z } from "zod";

const textPartSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(["text"]),
});

const toolInvocationPartSchema = z.object({
  type: z.enum(["tool-invocation"]),
  toolInvocation: z.object({
    toolCallId: z.string(),
    toolName: z.string(),
    args: z.any().optional(),
    state: z.enum(["pending", "result"]).optional(),
    result: z.any().optional(),
  }),
});

// Handle other part types that AI SDK might send
const otherPartSchema = z.object({
  type: z.string(), // Allow any string type
}).passthrough(); // Allow additional properties

const messagePartSchema = z.union([textPartSchema, toolInvocationPartSchema, otherPartSchema]);

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(["user", "assistant"]),
    content: z.string().max(2000).optional().default(""),
    parts: z.array(messagePartSchema),
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1).max(2000),
          contentType: z.enum(["image/png", "image/jpg", "image/jpeg"]),
        }),
      )
      .optional(),
  }),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
