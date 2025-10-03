import { relations, sql } from 'drizzle-orm';
import { boolean, date, uuid, varchar, text, pgEnum } from 'drizzle-orm/pg-core';
import { pgTable, timestamp } from 'drizzle-orm/pg-core';
import { enquiry_table } from './enquiry-schema';
import { usersTable } from './user-schema';
import { transaction } from './transactions-schema';
import { user } from './auth-schema';

export const todoStatus = pgEnum('todo_status', ['PENDING', 'DONE']);
export const notes = pgTable('notes_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  description: varchar(),
  content: text('content'),
  agent_id: uuid().references(() => usersTable.id),
  user_id: text().references(() => user.id).notNull(),
  createdAt: timestamp('timestamp2', { mode: 'string' })
    .notNull()
    .default(sql`now()`),
    parent_id: varchar(),
  transaction_id: uuid().references(() => transaction.id, { onDelete: 'cascade' }),
});
export const notes_relation = relations(notes, ({ one }) => ({
  user:one(user,{
    fields: [notes.user_id],
    references: [user.id],
  }),
  agent: one(usersTable, {
    fields: [notes.agent_id],
    references: [usersTable.id],
  }),
  transaction: one(transaction, {
    fields: [notes.transaction_id],
    references: [transaction.id],
  }),
}));
export const todos = pgTable('todo_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  note: varchar(),
  user_id: text().references(() => user.id),
  agent_id: uuid().references(() => usersTable.id, { onDelete: 'cascade' }),
  status: todoStatus().default('PENDING'),
  createdAt: timestamp({ mode: 'string' })
    .notNull()
    .default(sql`now()`),
});
export const todos_relation = relations(todos, ({ one, many }) => ({
  user: one(user, {
    fields: [todos.user_id],
    references: [user.id],
  }),
  agent: one(usersTable, {
    fields: [todos.agent_id],
    references: [usersTable.id],
  }),
}));
