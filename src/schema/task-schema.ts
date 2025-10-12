import { relations, sql } from 'drizzle-orm';
import { date, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './user-schema';
import { clientTable } from './client-schema';
import { transaction } from './transactions-schema';
import { user } from './auth-schema';


export const task = pgTable('task_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  agent_id: uuid().references(() => usersTable.id, { onDelete: 'set null' }),
  user_id: text().references(() => user.id, { onDelete: 'set null' }),
  client_id: uuid().references(() => clientTable.id, { onDelete: 'set null' }),
  assigned_by_id: uuid().references(() => usersTable.id, { onDelete: 'set null' }),
  assigned_by_id_v2: text().references(() => user.id, { onDelete: 'set null' }),
  transaction_id: uuid().references(() => transaction.id, { onDelete: 'cascade' }),
  deal_id: varchar(),
  transaction_type: varchar(),
  title: varchar(),
  type: varchar().default('task'),
  task: varchar(),
  due_date: timestamp(),
  number: varchar(),

  priority: varchar(),
  status: varchar(),
  created_at: timestamp({ mode: 'string' }).notNull().defaultNow(),
});
export const taskRelation = relations(task, ({ one, many }) => ({
  assigned_by_user: one(user, {
    fields: [task.assigned_by_id_v2],
    references: [user.id],
    relationName: 'assigned_by_user',
  }),
  user: one(user, {
    fields: [task.user_id],
    references: [user.id],
    relationName: 'user_assigned',
  }),
  transaction: one(transaction, {
    fields: [task.transaction_id],
    references: [transaction.id],
  }),
  agent: one(usersTable, {
    fields: [task.agent_id],
    references: [usersTable.id],
    relationName: 'agent_assigned',
  }),
  client: one(clientTable, {
    fields: [task.client_id],
    references: [clientTable.id],
  }),
  assignedBy: one(usersTable, {
    fields: [task.assigned_by_id],
    references: [usersTable.id],
    relationName: 'assigned_by',
  }),
}));
