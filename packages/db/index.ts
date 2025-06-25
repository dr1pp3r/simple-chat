import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schemas";

export type Database = ReturnType<typeof database>;

export function database(url: string) {
  const client = postgres(url, { prepare: false });
  return drizzle({ client, schema });
}

export {
  users,
  chats,
  chatMessages,
  userMessageCounts,
  type Chat,
  type ChatMessage,
  type UserMessageCount,
} from "./schemas";
