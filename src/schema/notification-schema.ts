  import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './user-schema';
import { clientTable } from './client-schema';
import { user } from './auth-schema';

export const notification_token = pgTable('notification_token', {
  id: uuid().defaultRandom().primaryKey(),
  token: varchar().unique(),
  user_id: uuid()
    .references(() => usersTable.id, { onDelete: 'cascade' })
    ,
  user_id_v2: text().references(() => user.id , {onDelete:'cascade'}),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
export const notification_token_relations = relations(notification_token, ({ one }) => ({
  owner: one(user,{
    fields: [notification_token.user_id_v2],
    references: [user.id],
  }),
  user: one(usersTable, {
    fields: [notification_token.user_id],
    references: [usersTable.id],
  }),
}));

export const notification = pgTable('notification', {
  id: uuid().defaultRandom().primaryKey(),
  type: varchar(),
  user_id: uuid().references(() => usersTable.id, { onDelete: 'cascade' }),
  user_id_v2: text().references(() => user.id, { onDelete: 'cascade' }),
  client_id: uuid().references(() => clientTable.id, { onDelete: 'cascade' }),
  message: varchar(),
  hoursDue: integer().default(0),
  date_created: timestamp().defaultNow(),
  is_read: boolean().default(false),
  date_read: timestamp(),
  reference_id: varchar(),
  due_date: timestamp(),
  date_updated: timestamp().defaultNow(),
});

export const notification_relations = relations(notification, ({ one }) => ({
  owner: one(user,{
    fields: [notification.user_id_v2],
    references: [user.id],
  }),
  user: one(usersTable, {
    fields: [notification.user_id],
    references: [usersTable.id],
  }),
  client: one(clientTable, {
    fields: [notification.client_id],
    references: [clientTable.id],
  }),
}));
