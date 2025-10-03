import { relations, sql } from 'drizzle-orm';
import { boolean, date, pgEnum, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable, timestamp } from 'drizzle-orm/pg-core';
import { enquiry_table } from './enquiry-schema';
import { task } from './task-schema';
import { notes } from './note-schema';
import { transaction } from './transactions-schema';
import { notification, notification_token } from './notification-schema';
import { agentTargetTable } from './agent-target-schema';
import { booking } from './booking-schema';
import { ticket, ticket_reply } from './ticket-schema';

export const usersTable = pgTable('user_table', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  role: varchar({ enum: ['agent', 'manager', 'home_worker', 'affiliate'] }),
  firstName: varchar(),
  lastName: varchar(),
  email: varchar(),
  phoneNumber: varchar(),
  accountId: varchar().unique(),
});

export const agent_relation = relations(usersTable, ({ one, many }) => ({
  //   booking: many(bookingTable),
  transaction: many(transaction),
  notes: many(notes),
  assigned_task: many(task, { relationName: 'agent_assigned' }),
  task_assigned: many(task, { relationName: 'assigned_by' }),
  notification_token: many(notification_token),
  notification: many(notification),
  agentTargets: many(agentTargetTable),
  deleted_bookings: many(booking),
  assigned_tickets: many(ticket, { relationName: 'assigned_agent' }),
  created_tickets: many(ticket, { relationName: 'created_by' }),
  reply_tickets: many(ticket_reply, { relationName: 'reply_agent' }),
  // chat_participant: many(chatParticipant),
  // chat_message: many(chatMessage),
  // chat_message_read: many(chatMessageRead),
  // chat_room: many(chatRoom),

}));


export const accountStatusEnum = pgEnum('account_status', ['pending', 'approved', 'rejected']);
export const account_request = pgTable('account_request', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: varchar().notNull(),
  phoneNumber: varchar(),
  firstName: varchar().notNull(),
  lastName: varchar().notNull(),
  role:varchar().notNull(),
  orgName:varchar(),
  status:accountStatusEnum().default('pending'),
  createdAt: timestamp({ precision: 0, withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ precision: 0, withTimezone: true }).defaultNow(),  
});