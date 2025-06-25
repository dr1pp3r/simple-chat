import { boolean, text, timestamp, pgSchema } from "drizzle-orm/pg-core";

/**
 * better-auth schema
 * See [docs](https://www.better-auth.com/docs/concepts/database#core-schema).
 */

export const authSchema = pgSchema("better-auth");

export const users = authSchema.table("users", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull(),
  image: text().default(""),
  isAnonymous: boolean(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});

export const sessions = authSchema.table("user_sessions", {
  id: text().primaryKey(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = authSchema.table("user_accounts", {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});

export const verifications = authSchema.table("user_verifications", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});
