CREATE TABLE "package_type_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE TABLE "tour_operator_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE TABLE "tour_package_commission_table" (
	"package_type_id" uuid,
	"tour_operator_id" uuid,
	"percentage_commission" numeric(5, 2),
	CONSTRAINT "id" PRIMARY KEY("package_type_id","tour_operator_id")
);
--> statement-breakpoint
ALTER TABLE "tour_package_commission_table" ADD CONSTRAINT "tour_package_commission_table_package_type_id_package_type_table_id_fk" FOREIGN KEY ("package_type_id") REFERENCES "public"."package_type_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_package_commission_table" ADD CONSTRAINT "tour_package_commission_table_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;