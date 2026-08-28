-- Convert plain-text assistant bodies to ordered markdown blocks, then switch
-- the column to jsonb. Existing rows are varchar; new writes use
-- `{ "blocks": [{ "kind": "markdown", "text": "…" }] }`.
ALTER TABLE "ChatMessagesAssistantText" ALTER COLUMN "body" SET DATA TYPE jsonb USING jsonb_build_object(
  'blocks',
  jsonb_build_array(
    jsonb_build_object('kind', 'markdown', 'text', "body")
  )
);--> statement-breakpoint
ALTER TABLE "ChatMessages" ADD COLUMN "parentChatMessageId" uuid;--> statement-breakpoint
ALTER TABLE "ChatMessagesAssistantText" ADD COLUMN "sources" jsonb;--> statement-breakpoint
ALTER TABLE "ChatMessages" ADD CONSTRAINT "ChatMessages_parentChatMessageId_ChatMessages_chatMessageId_fk" FOREIGN KEY ("parentChatMessageId") REFERENCES "public"."ChatMessages"("chatMessageId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "ChatMessages_parentChatMessageId_createdAt_idx" ON "ChatMessages" USING btree ("parentChatMessageId","createdAt");
