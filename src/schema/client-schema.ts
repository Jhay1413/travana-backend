import { relations, sql } from 'drizzle-orm';
import { boolean, date, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable, timestamp } from 'drizzle-orm/pg-core';
import { enquiry_table } from './enquiry-schema';
import { task } from './task-schema';
import { transaction } from './transactions-schema';
import { notification, notification_token } from './notification-schema';
import { clientFileTable } from './client-file-schema';
import { ticket } from './ticket-schema';
import { historicalBooking } from './historical-schema';
import { referralRequest } from './referral-schema';
import { user } from './auth-schema';

export const clientTable = pgTable('client_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  title: varchar(),
  firstName: varchar().notNull(),
  surename: varchar().notNull(),
  DOB: date({ mode: 'string' }),
  phoneNumber: varchar().notNull(),
  email: varchar(),
  emailIsAllowed: boolean(),
  VMB: varchar(),
  VMBfirstAccess: varchar(),
  whatsAppVerified: boolean().notNull().default(false),
  mailAllowed: boolean().default(false),
  houseNumber: varchar(),
  city: varchar(),
  street: varchar(),
  country: varchar(),
  post_code: varchar(),
  avatarUrl: varchar(),
  badge: varchar(),
  createdAt: timestamp().notNull().defaultNow(),
  referrerId: text().references(() => user.id, { onDelete: 'set null' }),
});

export const client_relations = relations(clientTable, ({ one, many }) => ({
  //   booking: many(bookingTable),
  transaction: many(transaction),
  task: many(task),
  notification: many(notification),
  clientFile: many(clientFileTable),
  ticket: many(ticket),
  historicalBooking: many(historicalBooking),
  referralRequest: many(referralRequest),
  referrer: one(user, {
    fields: [clientTable.referrerId],
    references: [user.id],
  }),
}));
