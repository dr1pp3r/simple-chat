CREATE TYPE "public"."chat_message_roles" AS ENUM('user', 'assistant');--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "role" SET DATA TYPE "public"."chat_message_roles" USING "role"::"public"."chat_message_roles";--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "content" text DEFAULT '' NOT NULL;