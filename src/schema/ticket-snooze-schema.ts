import { relations, sql } from 'drizzle-orm';
import { uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable, timestamp, text } from 'drizzle-orm/pg-core';
import { ticket } from './ticket-schema';
import { user } from './auth-schema';

export const ticketSnooze = pgTable('ticket_snooze_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  ticket_id: uuid().references(() => ticket.id, { onDelete: 'cascade' }).notNull(),
  user_id: text().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  snooze_until: timestamp().notNull(),
  snooze_duration_minutes: varchar(), // e.g., '5', '10', '15', '30'
  created_at: timestamp({ mode: 'string' }).notNull().defaultNow(),
});

export const ticketSnoozeRelation = relations(ticketSnooze, ({ one }) => ({
  ticket: one(ticket, {
    fields: [ticketSnooze.ticket_id],
    references: [ticket.id],
  }),
  user: one(user, {
    fields: [ticketSnooze.user_id],
    references: [user.id],
  }),
}));
