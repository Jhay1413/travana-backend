import { relations, sql } from 'drizzle-orm';
import { uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable, timestamp, text } from 'drizzle-orm/pg-core';
import { task } from './task-schema';
import { user } from './auth-schema';

export const taskSnooze = pgTable('task_snooze_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  task_id: uuid().references(() => task.id, { onDelete: 'cascade' }).notNull(),
  user_id: text().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  snooze_until: timestamp().notNull(),
  snooze_duration_minutes: varchar(), // e.g., '5', '10', '15', '30'
  created_at: timestamp({ mode: 'string' }).notNull().defaultNow(),
});

export const taskSnoozeRelation = relations(taskSnooze, ({ one }) => ({
  task: one(task, {
    fields: [taskSnooze.task_id],
    references: [task.id],
  }),
  user: one(user, {
    fields: [taskSnooze.user_id],
    references: [user.id],
  }),
}));
