import { sql } from 'drizzle-orm';
import { uuid, varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';

export const postTypeEnum = ['Flash Sale', 'Hot Deal', 'Admin', 'Urgent'] as const;

export const headlinesTable = pgTable('headlines', {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  title: varchar(),
  message: varchar(),
  link: varchar(), // optional
  post_type: varchar(), // should be validated in service/controller
  expiry_date: timestamp({ mode: 'string' }),
  created_at: timestamp({ mode: 'string' }).notNull().defaultNow(),
  updated_at: timestamp({ mode: 'string' }).notNull().defaultNow(),
}); 