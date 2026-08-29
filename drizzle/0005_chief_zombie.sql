CREATE TABLE "AisPositions" (
	"aisPositionId" uuid PRIMARY KEY NOT NULL,
	"mmsi" varchar NOT NULL,
	"lat" double precision NOT NULL,
	"lon" double precision NOT NULL,
	"sog" double precision NOT NULL,
	"cog" double precision NOT NULL,
	"heading" double precision NOT NULL,
	"navStatus" varchar,
	"reportedAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Vessels" (
	"mmsi" varchar PRIMARY KEY NOT NULL,
	"name" varchar DEFAULT '' NOT NULL,
	"imo" varchar,
	"callSign" varchar,
	"shipType" varchar DEFAULT 'Unknown' NOT NULL,
	"flag" varchar DEFAULT 'Unknown' NOT NULL,
	"lastLat" double precision,
	"lastLon" double precision,
	"lastSog" double precision,
	"lastCog" double precision,
	"lastHeading" double precision,
	"lastNavStatus" varchar,
	"lastReportedAt" timestamp with time zone,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "AisPositions" ADD CONSTRAINT "AisPositions_mmsi_Vessels_mmsi_fk" FOREIGN KEY ("mmsi") REFERENCES "public"."Vessels"("mmsi") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "AisPositions_mmsi_reportedAt_idx" ON "AisPositions" USING btree ("mmsi","reportedAt");--> statement-breakpoint
CREATE INDEX "AisPositions_reportedAt_idx" ON "AisPositions" USING btree ("reportedAt");--> statement-breakpoint
CREATE INDEX "Vessels_lastReportedAt_idx" ON "Vessels" USING btree ("lastReportedAt");