ALTER TABLE "referral" DROP CONSTRAINT "referral_referrerId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "referral_request" DROP CONSTRAINT "referral_request_referrerId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_referrerId_user_id_fk" FOREIGN KEY ("referrerId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_request" ADD CONSTRAINT "referral_request_referrerId_user_id_fk" FOREIGN KEY ("referrerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;