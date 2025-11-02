ALTER TABLE "forwards_report" DROP CONSTRAINT "forwards_report_month_year_unique";--> statement-breakpoint
CREATE INDEX "year_month_index" ON "forwards_report" USING btree ("year","month");