import { DAILY_MESSAGE_LIMIT } from "@/lib/constants";
import { RateLimitError } from "@/lib/errors";
import {
  database,
  chats,
  chatMessages,
  users,
  userMessageCounts,
} from "simple-chat/db";
import { eq, asc, desc, InferInsertModel, and, sql } from "drizzle-orm";

const db = database(process.env.DATABASE_URL!);

export async function createChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  const [chat] = await db
    .insert(chats)
    .values({ id, userId, title })
    .returning();
  return chat;
}

export async function getChatById({ id }: { id: string }) {
  const [chat] = await db.select().from(chats).where(eq(chats.id, id));
  return chat;
}

export async function getChatsByUserId({ userId }: { userId: string }) {
  return await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.createdAt));
}

export async function getChatMessages({ chatId }: { chatId: string }) {
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.chatId, chatId))
    .orderBy(asc(chatMessages.createdAt));
  return messages;
}

export async function saveChatMessages({
  messages,
}: {
  messages: InferInsertModel<typeof chatMessages>[];
}) {
  // Use upsert for each message
  const promises = messages.map((message) =>
    db
      .insert(chatMessages)
      .values(message)
      .onConflictDoUpdate({
        target: chatMessages.id,
        set: {
          parts: message.parts,
          content: message.content,
        },
      }),
  );

  return await Promise.all(promises);
}

export async function deleteChat({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return await db
    .delete(chats)
    .where(and(eq(chats.id, id), eq(chats.userId, userId)));
}

export async function deleteUser({ id }: { id: string }) {
  return await db.delete(users).where(eq(users.id, id));
}

export async function saveUserMessage({
  userId,
  message,
}: {
  userId: string;
  message: InferInsertModel<typeof chatMessages>;
}) {
  return await db.transaction(async (tx) => {
    const [countUpdate] = await tx
      .insert(userMessageCounts)
      .values({ userId })
      .onConflictDoUpdate({
        target: [userMessageCounts.userId, userMessageCounts.date],
        set: { count: sql`user_message_counts.count + 1` },
      })
      .returning({ count: userMessageCounts.count });

    if (!countUpdate?.count) {
      throw new Error("Failed to update user message count");
    }

    if (countUpdate.count > DAILY_MESSAGE_LIMIT) {
      throw new RateLimitError(countUpdate.count);
    }

    await tx.insert(chatMessages).values(message);

    return countUpdate.count;
  });
}
