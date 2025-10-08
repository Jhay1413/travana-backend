import { z } from 'zod';

import { referralRequestSchema } from './mutation';

export const fetchReferralRequestSchema = z.object({
  id: z.string(),
  createdAt: z.date().nullable(),
  referredName: z.string(),
  referredEmail: z.string().nullable(),
  referredPhoneNumber: z.string().nullable(),
  clientId: z.nullable(z.string()).optional(),
  referrerId: z.nullable(z.string()).optional(),
  updatedAt: z.date().nullable(),
  referrerName: z.string(),
  notes: z.string(),
  referredStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

export const fetchReferralSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  status: z.string(),
  clientName: z.string(),
  referredBy: z.string(),
  referralStatus: z.enum(['PENDING', 'RELEASED', 'REJECTED']),
  potentialCommission: z.number(),
  commission: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const fetchReferrerStatsSchema = z.object({
  activeReferralsCount: z.number(),
  totalEarnings: z.number(),
  pendingReferrals: z.number(),
  potentialComission:z.number(),
});
export type FetchReferral = z.infer<typeof fetchReferralSchema>;
export type FetchReferrerStats = z.infer<typeof fetchReferrerStatsSchema>;

export type FetchReferralRequest = z.infer<typeof fetchReferralRequestSchema>;
