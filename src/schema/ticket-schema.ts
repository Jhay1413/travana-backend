import { relations, sql } from 'drizzle-orm';
import { pgTable, timestamp, varchar, uuid, text } from 'drizzle-orm/pg-core';
import { clientTable } from './client-schema';
import { usersTable } from './user-schema';
import { user } from './auth-schema';

export const ticket = pgTable('ticket', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  ticket_id: varchar('ticket_id', { length: 7 }).unique(),
  ticket_type: varchar('ticket_type', { length: 20 }), // admin, sales, travana
  category: varchar(),
  deal_id: varchar(),
  transaction_type: varchar(),
  subject: varchar(),
  status: varchar(),
  priority: varchar(),
  description: varchar(),
  client_id: uuid().references(() => clientTable.id),
  agent_id: uuid().references(() => usersTable.id),
  user_id: text().references(() => user.id),
  created_by: uuid().references(() => usersTable.id),
  created_by_user: text().references(() => user.id),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
export const ticket_file = pgTable('ticket_file', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  ticket_id: uuid().references(() => ticket.id, { onDelete: 'cascade' }),
  file_name: varchar(),
  file_path: varchar(),
  file_size: varchar(),
  file_type: varchar(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
export const ticket_file_relation = relations(ticket_file, ({ one }) => ({
  ticket: one(ticket, {
    fields: [ticket_file.ticket_id],
    references: [ticket.id],
  }),
}));
export const ticket_reply = pgTable('ticket_reply', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  ticket_id: uuid().references(() => ticket.id, { onDelete: 'cascade' }),
  reply: varchar(),
  agent_id: uuid().references(() => usersTable.id),
  user_id: text().references(() => user.id),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
export const ticket_reply_file = pgTable('ticket_reply_file', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  ticket_reply_id: uuid().references(() => ticket_reply.id, { onDelete: 'cascade' }),
  file_name: varchar(),
  file_path: varchar(),
  file_size: varchar(),
  file_type: varchar(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
export const ticket_reply_file_relation = relations(ticket_reply_file, ({ one }) => ({
  ticket_reply: one(ticket_reply, {
    fields: [ticket_reply_file.ticket_reply_id],
    references: [ticket_reply.id],
  }),
}));
export const ticketRelation = relations(ticket, ({ one, many }) => ({
  client: one(clientTable, {
    fields: [ticket.client_id],
    references: [clientTable.id],
  }),
  user: one(user,{
    fields: [ticket.user_id],
    references: [user.id],
    relationName: 'assigned_user',
  }),
  agent: one(usersTable, {
    fields: [ticket.agent_id],
    references: [usersTable.id],
    relationName: 'assigned_agent',
  }),
  replies: many(ticket_reply),
  files: many(ticket_file),
  created_by_user: one(user,{
    fields: [ticket.created_by_user],
    references: [user.id],
    relationName: 'created_by_user',
  }),
  created_by: one(usersTable, {
    fields: [ticket.created_by],
    references: [usersTable.id],
    relationName: 'created_by',
  }),
}));

export const ticketReplyRelation = relations(ticket_reply, ({ one,many }) => ({
  ticket: one(ticket, {
    fields: [ticket_reply.ticket_id],
    references: [ticket.id],
  }),
  user: one(user,{
    fields: [ticket_reply.user_id],
    references: [user.id],
    relationName: 'reply_user',
  }),
  agent: one(usersTable, {
    fields: [ticket_reply.agent_id],
    references: [usersTable.id],
    relationName: 'reply_agent',
  }),
  files: many(ticket_reply_file),
}));
