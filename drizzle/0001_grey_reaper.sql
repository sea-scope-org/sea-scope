ALTER TABLE "ChatMessagesAssistantInputCollection" ADD COLUMN "providerOptions" jsonb;--> statement-breakpoint
ALTER TABLE "ChatMessagesToolApprovalRequest" ADD COLUMN "providerOptions" jsonb;--> statement-breakpoint
ALTER TABLE "ChatMessagesToolCall" ADD COLUMN "providerOptions" jsonb;--> statement-breakpoint
ALTER TABLE "Sessions" ADD COLUMN "ipHash" varchar;--> statement-breakpoint
ALTER TABLE "Sessions" ADD COLUMN "referrer" varchar;--> statement-breakpoint
ALTER TABLE "Sessions" ADD COLUMN "landingPath" varchar;--> statement-breakpoint
ALTER TABLE "Sessions" ADD COLUMN "isBot" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "Sessions_ipHash_idx" ON "Sessions" USING btree ("ipHash");--> statement-breakpoint
CREATE INDEX "Sessions_createdAt_idx" ON "Sessions" USING btree ("createdAt");