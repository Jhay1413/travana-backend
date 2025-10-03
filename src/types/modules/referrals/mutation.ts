import { z } from "zod";

export const referralRequestSchema = z.object({
  referrerId: z.string(),
  referredFirstName: z.string(),
  referredLastName: z.string(),
  referredEmail: z.string().nullable(),
  referredPhoneNumber: z.string().nullable(),
  notes: z.string(),
});



export type ReferralRequest = z.infer<typeof referralRequestSchema>;