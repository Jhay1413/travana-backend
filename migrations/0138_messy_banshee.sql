ALTER TABLE "booking_table" ADD COLUMN "deletion_code" varchar;--> statement-breakpoint
ALTER TABLE "booking_table" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "booking_table" ADD COLUMN "deleted_at" timestamp (0) with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "deletion_code" varchar;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "deleted_at" timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "deletion_code" varchar;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "deleted_at" timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_deleted_by_user_table_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_deleted_by_user_table_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_table" ADD CONSTRAINT "quote_table_deleted_by_user_table_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;