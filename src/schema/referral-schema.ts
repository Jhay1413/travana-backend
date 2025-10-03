import { pgEnum, pgTable, timestamp, uuid, varchar, text, numeric } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { transaction } from './transactions-schema';
import { relations } from 'drizzle-orm';
import { clientTable } from './client-schema';

export const referralStatusEnum = pgEnum('referral_status', ['PENDING', 'APPROVED', 'REJECTED']);
export const referralRequest = pgTable('referral_request', {
  id: uuid().defaultRandom().primaryKey(),
  referrerId: text().references(() => user.id),
  referredStatus: referralStatusEnum().default('PENDING'),
  notes: varchar(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
  clientId: uuid().references(() => clientTable.id),
});

export const referralRequestRelation = relations(referralRequest, ({ one }) => ({
  referrer: one(user, {
    fields: [referralRequest.referrerId],
    references: [user.id],
  }),
  client: one(clientTable, {
    fields: [referralRequest.clientId],
    references: [clientTable.id],
  }),
}));

export const releasedStatusEnum = pgEnum('released_status', ['PENDING', 'RELEASED', 'REJECTED']);
export const referral = pgTable('referral', {
  id: uuid().defaultRandom().primaryKey(),
  referrerId: text().references(() => user.id),
  transactionId: uuid().references(() => transaction.id),
  referralStatus: releasedStatusEnum().default('PENDING'),
  potentialCommission: numeric(),
  commission: numeric(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const referralRelation = relations(referral, ({ one }) => ({
  referrer: one(user, {
    fields: [referral.referrerId],
    references: [user.id],
  }),
  transaction: one(transaction, {
    fields: [referral.transactionId],
    references: [transaction.id],
  }),
}));
