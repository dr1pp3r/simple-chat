CREATE TABLE "user_message_counts" (
	"userId" text NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "user_message_counts_userId_date_pk" PRIMARY KEY("userId","date")
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_message_counts" ADD CONSTRAINT "user_message_counts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "better-auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."chat_message_roles";