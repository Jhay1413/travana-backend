import { relations, sql } from 'drizzle-orm';
import { boolean, date, integer, numeric, pgEnum, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { accomodation_list, board_basis, cottages, cruise_extra_item, lodges, package_type, tour_operator, transaction } from './transactions-schema';
import { airport } from './flights-schema';
import { booking } from './booking-schema';
import { usersTable } from './user-schema';
import { array } from 'zod';

export const quoteStatusEnum = pgEnum('quote_status', [
  'NEW_LEAD',
  'QUOTE_IN_PROGRESS',
  'QUOTE_CALL',
  'QUOTE_READY',
  'AWAITING_DECISION',
  'REQUOTE',
  'WON',
  'LOST',
  'INACTIVE',
  'EXPIRED',
]);

export const quote = pgTable('quote_table', {
  id: uuid().defaultRandom().primaryKey(),
  transaction_id: uuid().references(() => transaction.id, {
    onDelete: 'cascade',
  }).notNull(),
  holiday_type_id: uuid().references(() => package_type.id).notNull(),
  sales_price: numeric('sales_price', { precision: 10, scale: 2 }),
  package_commission: numeric('package_commission', { precision: 10, scale: 2 }),
  travel_date: date().notNull(),
  discounts: numeric('discounts', { precision: 10, scale: 2 }),
  service_charge: numeric('service_charge', { precision: 10, scale: 2 }),
  num_of_nights: integer().default(0).notNull(),
  is_expired: boolean().default(false),
  pets: integer().default(0).notNull(),
  cottage_id: uuid().references(() => cottages.id),
  lodge_id: uuid().references(() => lodges.id),
  quote_type: varchar().notNull(),
  infant: integer(),
  child: integer(),
  adult: integer(),
  title: varchar(),
  price_per_person: numeric('price_per_person', { precision: 10, scale: 2 }).default("0.00").notNull(),
  lodge_type: varchar(),
  transfer_type: varchar('transfer_type').default('none').notNull(),
  quote_status: quoteStatusEnum(),
  main_tour_operator_id: uuid().references(() => tour_operator.id),
  date_created: timestamp({ precision: 0, withTimezone: true }).defaultNow(),
  date_expiry: timestamp({ precision: 0, withTimezone: true }),
  is_future_deal: boolean().default(false),
  future_deal_date: date({ mode: 'string' }),
  // Deletion tracking fields
  is_active: boolean().default(true),
  deletion_code: varchar(),
  deleted_by: uuid().references(() => usersTable.id),
  deleted_at: timestamp({ precision: 0, withTimezone: true }),
  quote_ref: varchar(),
});
export const quote_relation = relations(quote, ({ one, many }) => ({
  quote_cruise: one(quote_cruise, {
    fields: [quote.id],
    references: [quote_cruise.quote_id],
  }),
  holiday_type: one(package_type, {
    fields: [quote.holiday_type_id],
    references: [package_type.id],
  }),
  transaction: one(transaction, {
    fields: [quote.transaction_id],
    references: [transaction.id],
  }),
  lodge: one(lodges, {
    fields: [quote.lodge_id],
    references: [lodges.id],
  }),
  cottage: one(cottages, {
    fields: [quote.cottage_id],
    references: [cottages.id],
  }),
  main_tour_operator: one(tour_operator, {
    fields: [quote.main_tour_operator_id],
    references: [tour_operator.id],
  }),
  travel_deal: one(travelDeal, {
    fields: [quote.id],
    references: [travelDeal.quote_id],
  }),
  passengers: many(passengers),
  accomodation: many(quote_accomodation),
  transfers: many(quote_transfers),
  car_hire: many(quote_car_hire),
  attraction_tickets: many(quote_attraction_ticket),
  lounge_pass: many(quote_lounge_pass),
  airport_parking: many(quote_airport_parking),
  flights: many(quote_flights),
}));

export const quote_cruise_item_extra = pgTable('quote_cruise_item_extra', {
  id: uuid().defaultRandom().primaryKey(),
  cruise_extra_id: uuid().references(() => cruise_extra_item.id),
  quote_cruise_id: uuid().references(() => quote_cruise.id, {
    onDelete: 'cascade',
  }),
});
export const quote_cruise_item_extra_relation = relations(quote_cruise_item_extra, ({ one, many }) => ({
  cruise_extra: one(cruise_extra_item, {
    fields: [quote_cruise_item_extra.cruise_extra_id],
    references: [cruise_extra_item.id],
  }),
  quote_cruise: one(quote_cruise, {
    fields: [quote_cruise_item_extra.quote_cruise_id],
    references: [quote_cruise.id],
  }),
}));
export const quote_accomodation = pgTable('quote_accomodation', {
  id: uuid().defaultRandom().primaryKey(),
  booking_ref: varchar(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  no_of_nights: integer().default(0).notNull(),
  room_type: varchar(),
  board_basis_id: uuid().references(() => board_basis.id),
  check_in_date_time: timestamp({ precision: 6, withTimezone: true }),
  stay_type: varchar(),
  is_primary: boolean().default(false),
  is_included_in_package: boolean(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
  accomodation_id: uuid().references(() => accomodation_list.id),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }),
});
export const quote_accomodation_relation = relations(quote_accomodation, ({ one, many }) => ({
  board_basis: one(board_basis, {
    fields: [quote_accomodation.board_basis_id],
    references: [board_basis.id],
  }),
  accomodation: one(accomodation_list, {
    fields: [quote_accomodation.accomodation_id],
    references: [accomodation_list.id],
  }),
  quote: one(quote, {
    fields: [quote_accomodation.quote_id],
    references: [quote.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [quote_accomodation.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const quote_transfers = pgTable('quote_transfers', {
  id: uuid().defaultRandom().primaryKey(),
  booking_ref: varchar(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  pick_up_location: varchar(),
  drop_off_location: varchar(),
  pick_up_time: timestamp(),
  drop_off_time: timestamp(),
  is_included_in_package: boolean(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }),
  note: varchar(),
});
export const quote_transfers_relation = relations(quote_transfers, ({ one, many }) => ({
  quote: one(quote, {
    fields: [quote_transfers.quote_id],
    references: [quote.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [quote_transfers.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const quote_car_hire = pgTable('quote_car_hire', {
  id: uuid().defaultRandom().primaryKey(),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }),
  booking_ref: varchar(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  pick_up_location: varchar(),
  drop_off_location: varchar(),
  pick_up_time: timestamp(),
  drop_off_time: timestamp(),
  no_of_days: integer().default(0).notNull(),
  driver_age: integer().default(0).notNull(),
  is_included_in_package: boolean(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
});
export const quote_car_hire_relation = relations(quote_car_hire, ({ one, many }) => ({
  quote: one(quote, {
    fields: [quote_car_hire.quote_id],
    references: [quote.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [quote_car_hire.tour_operator_id],
    references: [tour_operator.id],
  }),
}));
export const quote_attraction_ticket = pgTable('quote_attraction_ticket', {
  id: uuid().defaultRandom().primaryKey(),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }),
  booking_ref: varchar(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  ticket_type: varchar(),
  date_of_visit: timestamp(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
  number_of_tickets: integer().default(0).notNull(),
  is_included_in_package: boolean(),
});
export const quote_attraction_ticket_relation = relations(quote_attraction_ticket, ({ one, many }) => ({
  quote: one(quote, {
    fields: [quote_attraction_ticket.quote_id],
    references: [quote.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [quote_attraction_ticket.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const quote_lounge_pass = pgTable('quote_lounge_pass', {
  id: uuid().defaultRandom().primaryKey(),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }),
  booking_ref: varchar(),
  terminal: varchar(),
  airport_id: uuid().references(() => airport.id),
  date_of_usage: timestamp(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
  is_included_in_package: boolean(),
  note: varchar(),
});
export const quote_lounge_pass_relation = relations(quote_lounge_pass, ({ one, many }) => ({
  quote: one(quote, {
    fields: [quote_lounge_pass.quote_id],
    references: [quote.id],
  }),
  airport: one(airport, {
    fields: [quote_lounge_pass.airport_id],
    references: [airport.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [quote_lounge_pass.tour_operator_id],
    references: [tour_operator.id],
  }),
  passengers: many(passengers),
}));
export const passengers = pgTable('passengers', {
  id: uuid().defaultRandom().primaryKey(),
  type: varchar(),
  age: integer().default(0).notNull(),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }),
  lounge_pass_id: uuid().references(() => quote_lounge_pass.id, {
    onDelete: 'cascade',
  }),
  booking_id: uuid().references(() => booking.id, {
    onDelete: 'cascade',
  }),
});
export const passengers_relation = relations(passengers, ({ one, many }) => ({
  quote: one(quote, {
    fields: [passengers.quote_id],
    references: [quote.id],
  }),
  booking: one(booking, {
    fields: [passengers.booking_id],
    references: [booking.id],
  }),
  lounge_pass: one(quote_lounge_pass, {
    fields: [passengers.lounge_pass_id],
    references: [quote_lounge_pass.id],
  }),
}));

export const quote_airport_parking = pgTable('quote_airport_parking', {
  id: uuid().defaultRandom().primaryKey(),
  booking_ref: varchar(),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }),
  airport_id: uuid().references(() => airport.id),
  parking_type: varchar(),
  parking_date: timestamp(),
  car_make: varchar(),
  car_model: varchar(),
  colour: varchar(),
  car_reg_number: varchar(),
  duration: varchar(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  is_included_in_package: boolean(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
});
export const quote_airport_parking_relation = relations(quote_airport_parking, ({ one, many }) => ({
  quote: one(quote, {
    fields: [quote_airport_parking.quote_id],
    references: [quote.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [quote_airport_parking.tour_operator_id],
    references: [tour_operator.id],
  }),
  airport: one(airport, {
    fields: [quote_airport_parking.airport_id],
    references: [airport.id],
  }),
}));
export const quote_flights = pgTable('quote_flights', {
  id: uuid().defaultRandom().primaryKey(),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }),
  flight_number: varchar(),
  flight_ref: varchar(),
  departing_airport_id: uuid().references(() => airport.id),
  arrival_airport_id: uuid().references(() => airport.id),
  tour_operator_id: uuid().references(() => tour_operator.id),
  flight_type: varchar(),
  departure_date_time: timestamp(),
  arrival_date_time: timestamp(),
  is_included_in_package: boolean(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
});
export const quote_flights_relation = relations(quote_flights, ({ one, many }) => ({
  quote: one(quote, {
    fields: [quote_flights.quote_id],
    references: [quote.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [quote_flights.tour_operator_id],
    references: [tour_operator.id],
  }),
  departing_airport: one(airport, {
    fields: [quote_flights.departing_airport_id],
    references: [airport.id],
    relationName: 'departing_airport_relation',
  }),
  arrival_airport: one(airport, {
    fields: [quote_flights.arrival_airport_id],
    references: [airport.id],
    relationName: 'arrival_airport_relation',
  }),
}));

export const quote_cruise = pgTable('quote_cruise', {
  id: uuid().defaultRandom().primaryKey(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  cruise_line: varchar(),
  ship: varchar(),
  cruise_date: date(),
  cabin_type: varchar(),
  cruise_name: varchar(),
  pre_cruise_stay: integer().notNull(),
  post_cruise_stay: integer().notNull(),
  quote_id: uuid()
    .references(() => quote.id, {
      onDelete: 'cascade',
    }),
});
export const quote_cruise_relation = relations(quote_cruise, ({ one, many }) => ({
  quote: one(quote, {
    fields: [quote_cruise.quote_id],
    references: [quote.id],
  }),
  cruise_extra: many(quote_cruise_item_extra),
  cruise_itinerary: many(quote_cruise_itinerary),
  tour_operator: one(tour_operator, {
    fields: [quote_cruise.tour_operator_id],
    references: [tour_operator.id],
  }),
}));
export const quote_cruise_itinerary = pgTable('quote_cruise_itinerary', {
  id: uuid().defaultRandom().primaryKey(),
  quote_cruise_id: uuid().references(() => quote_cruise.id, {
    onDelete: 'cascade',
  }),
  day_number: integer(),
  description: varchar(),
});
export const quote_cruise_itinerary_relation = relations(quote_cruise_itinerary, ({ one, many }) => ({
  quote_cruise: one(quote_cruise, {
    fields: [quote_cruise_itinerary.quote_cruise_id],
    references: [quote_cruise.id],
  }),
}));


export const travelDeal = pgTable('travel_deal', {
  id: uuid().defaultRandom().primaryKey(),
  title: varchar().notNull(),
  subtitle: varchar(),
  post: text().notNull(),
  resortSummary: varchar(),
  hashtags: text().array().notNull().default(sql`ARRAY[]::text[]`),
  travelDate: date({ mode: "string" }),
  nights: integer().notNull(),
  boardBasis: varchar(),
  departureAirport: varchar(),
  luggageTransfers: varchar(),
  price: numeric('price', { precision: 10, scale: 2 }),
  quote_id: uuid().references(() => quote.id, {
    onDelete: 'cascade',
  }).notNull(),
  created_at: timestamp({ precision: 0, withTimezone: true }).defaultNow(),
})

export const travelDeal_relation = relations(travelDeal, ({ one, many }) => ({
  quote: one(quote, {
    fields: [travelDeal.quote_id],
    references: [quote.id],
  }),
}));