import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { clientTable } from './client-schema';
import { relations } from 'drizzle-orm';

export const clientFileTable = pgTable('client_file_table', {
  id: uuid().defaultRandom().primaryKey(),
  fileTitle: varchar(),
  filename: varchar(),
  fileUrl: varchar(),
  fileType: varchar(),
  clientId: uuid().references(() => clientTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
});
export const clientFile_relations = relations(clientFileTable, ({ one }) => ({
  client: one(clientTable, {
    fields: [clientFileTable.clientId],
    references: [clientTable.id],
  }),
}));