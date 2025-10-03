import { relations, sql } from 'drizzle-orm';
import { date, numeric, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { enquiry_cruise_destination, enquiry_cruise_line } from './enquiry-schema';
import { destination } from './transactions-schema';

export const cruise_line = pgTable('cruise_line_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar(),
});
export const cruise_ship = pgTable('ship_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar(),
  cruise_line_id: uuid().references(() => cruise_line.id,{onDelete:'cascade'}),
});
export const cruise_line_relation = relations(cruise_line, ({ one, many }) => ({
  cruise_ship: many(cruise_ship),
  //   booking_cruise: many(booking_cruise),
  enquiry_cruise_line: many(enquiry_cruise_line),
}));

export const cruise_ship_relation = relations(cruise_ship, ({ one, many }) => ({
  //   booking_cruise: many(booking_cruise),
  cruise_line: one(cruise_line, {
    fields: [cruise_ship.cruise_line_id],
    references: [cruise_line.id],
  }),
  itenary: many(cruise_itenary),
}));

export const cruise_itenary = pgTable('cruise_itenary_table', {
  id: uuid().defaultRandom().primaryKey(),
  ship_id: uuid().references(() => cruise_ship.id ,{onDelete:'cascade'}),
  itenary: varchar(),
  departure_port: varchar().notNull(),
  date: date().notNull(),
});
export const cruise_itenerary_relation = relations(cruise_itenary, ({ one, many }) => ({
  cruise_ship: one(cruise_ship, {
    fields: [cruise_itenary.ship_id],
    references: [cruise_ship.id],
  }),
  cruise_voyage: many(cruise_voyage),
}));

export const cruise_voyage = pgTable('cruise_voyage_table', {
  id: uuid().defaultRandom().primaryKey(),
  itinerary_id: uuid().references(() => cruise_itenary.id,{onDelete:'cascade'}),
  day_number: numeric(),
  description: varchar(),
});
export const cruise_voyage_relation = relations(cruise_voyage, ({ one, many }) => ({
  //   booking_cruise: many(booking_cruise),
  cruise_itenary: one(cruise_itenary, {
    fields: [cruise_voyage.itinerary_id],
    references: [cruise_itenary.id],
  }),
}));
export const cruise_destination = pgTable('cruise_destination_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar(),
});
export const cruise_destination_relation = relations(cruise_destination, ({ one, many }) => ({
  //   booking_cruise: many(booking_cruise),
  port: many(port),
  enquiry_cruise_destination: many(enquiry_cruise_destination),
}));

export const port = pgTable('port_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  cruise_destination_id: uuid().references(() => cruise_destination.id),
  name: varchar(),
});

export const port_relation = relations(port, ({ one, many }) => ({
  //   booking_cruise: many(booking_cruise),
  cruise_destination: one(cruise_destination, {
    fields: [port.cruise_destination_id],
    references: [cruise_destination.id],
  }),
}));
