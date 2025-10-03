import { relations } from 'drizzle-orm';
import { boolean, date, integer, numeric, pgEnum, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { accomodation_list, board_basis, cottages, cruise_extra_item, lodges, package_type, tour_operator, transaction } from './transactions-schema';
import { airport } from './flights-schema';
import { passengers } from './quote-schema';
import { usersTable } from './user-schema';
import { user } from './auth-schema';

export const bookingStatus = pgEnum('booking_status', ['BOOKED', 'LOST']);

export const booking = pgTable('booking_table', {
  id: uuid().defaultRandom().primaryKey(),
  transaction_id: uuid()
    .references(() => transaction.id,{onDelete:"cascade"})
    .unique().notNull(),
  holiday_type_id: uuid().references(() => package_type.id).notNull(),
  hays_ref: varchar().notNull(),
  supplier_ref: varchar().notNull(),
  is_active: boolean().default(true),
  sales_price: numeric('sales_price', { precision: 10, scale: 2 }),
  package_commission: numeric('package_commission', { precision: 10, scale: 2 }),
  travel_date: date().notNull(),
  title:varchar(),
  discounts: numeric('discounts', { precision: 10, scale: 2 }),
  service_charge: numeric('service_charge', { precision: 10, scale: 2 }),
  num_of_nights: integer().notNull().default(0),
  pets: integer().notNull().default(0),
  cottage_id: uuid().references(() => cottages.id),
  lodge_id: uuid().references(() => lodges.id),
  lodge_type: varchar(),
  transfer_type: varchar(),
  infant: integer().notNull().default(0),
  child: integer().notNull().default(0) ,
  adult: integer().notNull().default(0),
  booking_status: bookingStatus(),
  main_tour_operator_id: uuid().references(() => tour_operator.id),
  date_created: timestamp({ precision: 0, withTimezone: true }).defaultNow(),
  deletion_code: varchar(),
  deleted_by: uuid().references(() => usersTable.id),

  deleted_by_user:text().references(() => user.id),
  deleted_at: timestamp({ precision: 0, withTimezone: true }).defaultNow(),
});

export const booking_relation = relations(booking, ({ one, many }) => ({
  passengers: many(passengers),
  booking_cruise: one(booking_cruise, {
    fields: [booking.id],
    references: [booking_cruise.booking_id],
  }),
  transaction: one(transaction, {
    fields: [booking.transaction_id],
    references: [transaction.id],
  }),
  cottage: one(cottages, {
    fields: [booking.cottage_id],
    references: [cottages.id],
  }),
  lodge: one(lodges, {
    fields: [booking.lodge_id],
    references: [lodges.id],
  }),
  deleted_by: one(usersTable, {
    fields: [booking.deleted_by],
    references: [usersTable.id],
  }),
  deleted_by_user: one(user,{
    fields: [booking.deleted_by_user],
    references: [user.id],
  }),

  main_tour_operator: one(tour_operator, {
    fields: [booking.main_tour_operator_id],
    references: [tour_operator.id],
  }),
  accomodation: many(booking_accomodation),
  transfers: many(booking_transfers),
  car_hire: many(booking_car_hire),
  attraction_tickets: many(booking_attraction_ticket),
  lounge_pass: many(booking_lounge_pass),
  airport_parking: many(booking_airport_parking),
  flights: many(booking_flights),
  holiday_type: one(package_type, {
    fields: [booking.holiday_type_id],
    references: [package_type.id],
  }),
}));

export const booking_cruise = pgTable('booking_cruise', {
  id: uuid().defaultRandom().primaryKey(),
  booking_id: uuid().references(() => booking.id, {
    onDelete: 'cascade',
  }),
  tour_operator_id: uuid().references(() => tour_operator.id),
  cruise_line: varchar(),
  ship: varchar(),
  cruise_date: date(),
  cabin_type: varchar(),
  cruise_name: varchar(),
  pre_cruise_stay: integer(),
  post_cruise_stay: integer(),
});

export const booking_cruise_relation = relations(booking_cruise, ({ one, many }) => ({
  booking: one(booking, {
    fields: [booking_cruise.booking_id],
    references: [booking.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [booking_cruise.tour_operator_id],
    references: [tour_operator.id],
  }),
  cruise_extra: many(booking_cruise_item_extra),
  cruise_itinerary: many(booking_cruise_itinerary),
}));

export const booking_cruise_itinerary = pgTable('booking_cruise_itinerary', {
  id: uuid().defaultRandom().primaryKey(),
  booking_cruise_id: uuid().references(() => booking_cruise.id, {
    onDelete: 'cascade',
  }),
  day_number: integer(),
  description: varchar(),
});
export const booking_cruise_itinerary_relation = relations(booking_cruise_itinerary, ({ one, many }) => ({
  booking_cruise: one(booking_cruise, {
    fields: [booking_cruise_itinerary.booking_cruise_id],
    references: [booking_cruise.id],
  }),
}));
export const booking_cruise_item_extra = pgTable('booking_cruise_item_extra', {
  id: uuid().defaultRandom().primaryKey(),
  cruise_extra_id: uuid().references(() => cruise_extra_item.id),
  booking_cruise_id: uuid().references(() => booking_cruise.id, {
    onDelete: 'cascade',
  }),
});
export const booking_cruise_item_extra_relation = relations(booking_cruise_item_extra, ({ one, many }) => ({
  cruise_extra: one(cruise_extra_item, {
    fields: [booking_cruise_item_extra.cruise_extra_id],
    references: [cruise_extra_item.id],
  }),
  booking_cruise: one(booking_cruise, {
    fields: [booking_cruise_item_extra.booking_cruise_id],
    references: [booking_cruise.id],
  }),
}));

export const booking_accomodation = pgTable('booking_accomodation', {
  id: uuid().defaultRandom().primaryKey(),
  booking_ref: varchar(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  no_of_nights: integer().notNull().default(0),
  room_type: varchar(),
  board_basis_id: uuid().references(() => board_basis.id),
  check_in_date_time: timestamp(),
  stay_type: varchar(),
  is_primary: boolean().default(false),
  is_included_in_package: boolean(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
  accomodation_id: uuid().references(() => accomodation_list.id),
  booking_id: uuid().references(() => booking.id, {
    onDelete: 'cascade',
  }),
});
export const booking_accomodation_relation = relations(booking_accomodation, ({ one, many }) => ({
  board_basis: one(board_basis, {
    fields: [booking_accomodation.board_basis_id],
    references: [board_basis.id],
  }),
  accomodation: one(accomodation_list, {
    fields: [booking_accomodation.accomodation_id],
    references: [accomodation_list.id],
  }),
  booking: one(booking, {
    fields: [booking_accomodation.booking_id],
    references: [booking.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [booking_accomodation.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const booking_transfers = pgTable('booking_transfers', {
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
  booking_id: uuid().references(() => booking.id, {
    onDelete: 'cascade',
  }),
  note: varchar(),
});
export const booking_transfers_relation = relations(booking_transfers, ({ one, many }) => ({
  booking: one(booking, {
    fields: [booking_transfers.booking_id],
    references: [booking.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [booking_transfers.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const booking_car_hire = pgTable('booking_car_hire', {
  id: uuid().defaultRandom().primaryKey(),
  booking_id: uuid().references(() => booking.id, {
    onDelete: 'cascade',
  }),
  booking_ref: varchar(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  pick_up_location: varchar(),
  drop_off_location: varchar(),
  pick_up_time: timestamp(),
  drop_off_time: timestamp(),
  no_of_days: integer(),
  driver_age: integer(),
  is_included_in_package: boolean(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
});
export const booking_car_hire_relation = relations(booking_car_hire, ({ one, many }) => ({
  booking: one(booking, {
    fields: [booking_car_hire.booking_id],
    references: [booking.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [booking_car_hire.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const booking_attraction_ticket = pgTable('booking_attraction_ticket', {
  id: uuid().defaultRandom().primaryKey(),
  booking_id: uuid().references(() => booking.id, {
    onDelete: 'cascade',
  }),
  booking_ref: varchar(),
  tour_operator_id: uuid().references(() => tour_operator.id),
  ticket_type: varchar(),
  date_of_visit: timestamp(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
  number_of_tickets: integer(),
  is_included_in_package: boolean(),
});
export const booking_attraction_ticket_relation = relations(booking_attraction_ticket, ({ one, many }) => ({
  booking: one(booking, {
    fields: [booking_attraction_ticket.booking_id],
    references: [booking.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [booking_attraction_ticket.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const booking_lounge_pass = pgTable('booking_lounge_pass', {
  id: uuid().defaultRandom().primaryKey(),
  booking_id: uuid().references(() => booking.id, {
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
export const booking_lounge_pass_relation = relations(booking_lounge_pass, ({ one, many }) => ({
  booking: one(booking, {
    fields: [booking_lounge_pass.booking_id],
    references: [booking.id],
  }),
  airport: one(airport, {
    fields: [booking_lounge_pass.airport_id],
    references: [airport.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [booking_lounge_pass.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const booking_airport_parking = pgTable('booking_airport_parking', {
  id: uuid().defaultRandom().primaryKey(),
  booking_ref: varchar(),
  booking_id: uuid().references(() => booking.id, {
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
export const booking_airport_parking_relation = relations(booking_airport_parking, ({ one, many }) => ({
  booking: one(booking, {
    fields: [booking_airport_parking.booking_id],
    references: [booking.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [booking_airport_parking.tour_operator_id],
    references: [tour_operator.id],
  }),
  airport: one(airport, {
    fields: [booking_airport_parking.airport_id],
    references: [airport.id],
  }),
}));

export const booking_flights = pgTable('booking_flights', {
  id: uuid().defaultRandom().primaryKey(),
  booking_id: uuid().references(() => booking.id, {
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
export const booking_flights_relation = relations(booking_flights, ({ one, many }) => ({
  booking: one(booking, {
    fields: [booking_flights.booking_id],
    references: [booking.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [booking_flights.tour_operator_id],
    references: [tour_operator.id],
  }),
  departing_airport: one(airport, {
    fields: [booking_flights.departing_airport_id],
    references: [airport.id],
    relationName: 'departing_airport_relation',
  }),
  arrival_airport: one(airport, {
    fields: [booking_flights.arrival_airport_id],
    references: [airport.id],
    relationName: 'arrival_airport_relation',
  }),
}));
