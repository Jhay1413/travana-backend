import { boolean, date, numeric, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { clientTable } from './client-schema';

export const historicalBooking = pgTable('historical_booking', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  client_id: uuid().references(() => clientTable.id),
  booking_ref: varchar(),
  booking_date: date({ mode: 'string' }),
  departure_date: date({ mode: 'string' }),
  return_date: date({ mode: 'string' }),
  gross_price: numeric(),
  net_price: numeric(),
  gross_before_discount: numeric(),
  profit: numeric(),
  total_payment: numeric(),
  destination_country: varchar(),
  product_type: varchar(),
  duration: numeric(),
  passegners: numeric(),
  adults: numeric(),
  children: numeric(),
  infants: numeric(),
  seniors: numeric(),
  cancelled: boolean(),
  cancelled_date: date({ mode: 'string' }),
  main_supplier: varchar(),
});

export const historicalBookingRelation = relations(historicalBooking, ({ one }) => ({
  client: one(clientTable, {
    fields: [historicalBooking.client_id],
    references: [clientTable.id],
  }),
}));
