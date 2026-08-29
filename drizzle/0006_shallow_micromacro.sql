ALTER TABLE "AisPositions" ADD COLUMN "source" varchar DEFAULT 'aisstream' NOT NULL;--> statement-breakpoint
ALTER TABLE "Vessels" ADD COLUMN "source" varchar DEFAULT 'aisstream' NOT NULL;--> statement-breakpoint
CREATE INDEX "AisPositions_source_idx" ON "AisPositions" USING btree ("source");--> statement-breakpoint
CREATE INDEX "Vessels_source_idx" ON "Vessels" USING btree ("source");