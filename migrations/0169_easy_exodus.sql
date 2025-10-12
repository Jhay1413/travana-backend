ALTER TABLE "referral" DROP CONSTRAINT "referral_transactionId_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_transactionId_transaction_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;