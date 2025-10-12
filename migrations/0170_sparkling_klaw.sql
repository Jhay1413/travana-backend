ALTER TABLE "client_table" DROP CONSTRAINT "client_table_referrerId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_v2_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_client_id_client_table_id_fk";
--> statement-breakpoint
ALTER TABLE "notification_token" DROP CONSTRAINT "notification_token_user_id_v2_user_id_fk";
--> statement-breakpoint
ALTER TABLE "referral_request" DROP CONSTRAINT "referral_request_clientId_client_table_id_fk";
--> statement-breakpoint
ALTER TABLE "task_table" DROP CONSTRAINT "task_table_agent_id_user_table_id_fk";
--> statement-breakpoint
ALTER TABLE "task_table" DROP CONSTRAINT "task_table_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task_table" DROP CONSTRAINT "task_table_client_id_client_table_id_fk";
--> statement-breakpoint
ALTER TABLE "task_table" DROP CONSTRAINT "task_table_assigned_by_id_user_table_id_fk";
--> statement-breakpoint
ALTER TABLE "task_table" DROP CONSTRAINT "task_table_assigned_by_id_v2_user_id_fk";
--> statement-breakpoint
ALTER TABLE "client_table" ADD CONSTRAINT "client_table_referrerId_user_id_fk" FOREIGN KEY ("referrerId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_v2_user_id_fk" FOREIGN KEY ("user_id_v2") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_client_id_client_table_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_token" ADD CONSTRAINT "notification_token_user_id_v2_user_id_fk" FOREIGN KEY ("user_id_v2") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_request" ADD CONSTRAINT "referral_request_clientId_client_table_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."client_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_agent_id_user_table_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_client_id_client_table_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_assigned_by_id_user_table_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."user_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_assigned_by_id_v2_user_id_fk" FOREIGN KEY ("assigned_by_id_v2") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;