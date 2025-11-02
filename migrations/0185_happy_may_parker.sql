CREATE TABLE "forwards_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"company_commission" numeric(10, 2) NOT NULL,
	"agent_commission" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"adjustment" numeric(10, 2) DEFAULT '0.00',
	CONSTRAINT "forwards_report_month_year_unique" UNIQUE("month","year")
);
