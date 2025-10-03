ALTER TABLE "ticket" ADD COLUMN "ticket_id" varchar(7);--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_ticket_id_unique" UNIQUE("ticket_id");