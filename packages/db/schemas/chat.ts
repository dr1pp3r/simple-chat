import {
  text,
  timestamp,
  pgTable,
  uuid,
  jsonb,
  date,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { InferSelectModel } from "drizzle-orm";

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid()
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  content: text().notNull().default(""),
  createdAt: timestamp().notNull().defaultNow(),
  role: text().notNull(),
  parts: jsonb().notNull(),
  attachments: jsonb().notNull(),
});

export const userMessageCounts = pgTable(
  "user_message_counts",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull().defaultNow(),
    count: integer("count").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);

export type Chat = InferSelectModel<typeof chats>;
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type UserMessageCount = InferSelectModel<typeof userMessageCounts>;
