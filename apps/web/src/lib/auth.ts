import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import {
  users,
  sessions,
  accounts,
  verifications,
} from "simple-chat/db/schemas";
import { database } from "simple-chat/db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  baseURL:
    process.env.NODE_ENV === "production"
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:3000`,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(database(process.env.DATABASE_URL!), {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  plugins: [anonymous(), nextCookies()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60, // 10 minutes
    },
  },
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [`https://${process.env.VERCEL_URL}`]
      : ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
});
