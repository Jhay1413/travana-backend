import { relations, sql } from 'drizzle-orm';
import { boolean, numeric, integer, uuid, varchar, pgTable, timestamp, text } from 'drizzle-orm/pg-core';
import { usersTable } from './user-schema';
import { user } from './auth-schema';

export const agentTargetTable = pgTable('agent_target_table', {
  id: uuid().defaultRandom().primaryKey(),
  agent_id: uuid().references(() => usersTable.id, { onDelete: 'cascade' }),
  user_id: text().references(() => user.id),
  year: integer(),
  month: integer(),
  target_amount: numeric({ precision: 10, scale: 2 }),
  description: varchar(),
  is_active: boolean().default(true),
  created_at: timestamp({ mode: 'string' }).defaultNow(),
  updated_at: timestamp({ mode: 'string' }).defaultNow(),
});

export const agentTargetRelation = relations(agentTargetTable, ({ one }) => ({
  agent: one(usersTable, {
    fields: [agentTargetTable.agent_id],
    references: [usersTable.id],
  }),
  user: one(user,{
    fields: [agentTargetTable.user_id],
    references: [user.id],
  }),
}));
