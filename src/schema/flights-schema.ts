import { relations, sql } from 'drizzle-orm';
import { date, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { enquiry_departure_airport } from './enquiry-schema';
import { country, destination } from './transactions-schema';
import { quote_airport_parking, quote_flights, quote_lounge_pass } from './quote-schema';
import { booking_airport_parking, booking_flights, booking_lounge_pass } from './booking-schema';

export const airport = pgTable('airport_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  airport_code: varchar(),
  airport_name: varchar(),
  country_id: uuid().references(() => country.id),
});
export const airport_relations = relations(airport, ({ one, many }) => ({
  enquiry_departure_airport: many(enquiry_departure_airport),
  departure_flight: many(flights, { relationName: 'departure_airport_relation' }),
  destination_flight: many(flights, { relationName: 'destination_airport_relation' }),
  country: one(country, {
    fields: [airport.country_id],
    references: [country.id],
  }),
  quote_lounge_pass: many(quote_lounge_pass),
  quote_parking: many(quote_airport_parking),
  quote_flights_departure_airport: many(quote_flights, { relationName: 'departing_airport_relation' }),
  quote_flights_arrival_airport: many(quote_flights, { relationName: 'arrival_airport_relation' }),

  booking_lounge_pass: many(booking_lounge_pass),
  booking_parking: many(booking_airport_parking),
  booking_flights_departure_airport: many(booking_flights, { relationName: 'departing_airport_relation' }),
  booking_flights_arrival_airport: many(booking_flights, { relationName: 'arrival_airport_relation' }),

}));

export const flights = pgTable('flights_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  //   booking_id: uuid().references(() => bookingTable.id),
  //   provider_id: uuid().references(() => providers.id),
  flight_id: varchar(),
  flight_number: varchar(),
  flight_route: varchar(),
  departure_date: date({ mode: 'string' }),
  departure_time: varchar(),
  arrival_date: date({ mode: 'string' }),
  arrival_time: varchar(),
  departure_airport_id: uuid().references(() => airport.id),
  destination_airport_id: uuid().references(() => airport.id),
});
export const flight_relations = relations(flights, ({ one, many }) => ({
  departure_aiport: one(airport, {
    fields: [flights.departure_airport_id],
    references: [airport.id],
    relationName: 'departure_airport_relation',
  }),
  destination_aiport: one(airport, {
    fields: [flights.destination_airport_id],
    references: [airport.id],
    relationName: 'destination_airport_relation',
  }),
  //   booking: one(bookingTable, {
  //     fields: [flights.booking_id],
  //     references: [bookingTable.id],
  //   }),
  //   provider: one(providers, {
  //     fields: [flights.provider_id],
  //     references: [providers.id],
  //   }),
}));
