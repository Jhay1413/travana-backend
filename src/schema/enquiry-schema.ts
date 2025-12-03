import { relations, sql } from 'drizzle-orm';
import { boolean, date, integer, numeric, pgEnum, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { usersTable } from './user-schema';
import { accomodation_list, accomodation_type, board_basis, destination, package_type, resorts, transaction } from './transactions-schema';
import { cruise_destination, cruise_line, port } from './cruise-schema';
import { airport } from './flights-schema';
import { notes } from './note-schema';
import { passengers } from './quote-schema';


export const enquiryStatusEnum = pgEnum('enquiry_status', [
  'ACTIVE',
  'LOST',
  'INACTIVE',
  'EXPIRED',
  'NEW_LEAD',
]);
export const budgetTypeEnum = pgEnum('budget_type', ['PER_PERSON', 'PACKAGE']);
export const enquiry_table = pgTable('enquiry_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  holiday_type_id: uuid().references(() => package_type.id).notNull(),
  transaction_id: uuid()
    .references(() => transaction.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
  accomodation_type_id: uuid().references(() => accomodation_type.id),
  travel_date: date({ mode: 'string' }),
  adults: integer(),
  children: integer(),
  flexibility_date: varchar(),
  email: varchar(),
  infants: integer(),
  cabin_type: varchar(),
  title: varchar(),
  flexible_date: varchar(),
  weekend_lodge: varchar(),
  accom_min_star_rating: varchar(),
  no_of_nights: integer(),
  budget: numeric(),
  budget_type: budgetTypeEnum().default('PACKAGE'),
  no_of_guests: integer(),
  no_of_pets: integer(),
  pre_cruise_stay: integer(),
  post_cruise_stay: integer(),
  status: enquiryStatusEnum().default('NEW_LEAD'),
  date_created: timestamp({ precision: 0, withTimezone: true }).defaultNow(),
  date_expiry: timestamp({ precision: 0, withTimezone: true }),
  is_future_deal: boolean().default(false),
  future_deal_date: date({ mode: 'string' }),
  is_expired: boolean().default(false),
  // Deletion tracking fields
  is_active: boolean().default(true),
  deletion_code: varchar(),
  deleted_by: uuid().references(() => usersTable.id),
  deleted_at: timestamp({ precision: 0, withTimezone: true }),
});
export const enquiry_relations = relations(enquiry_table, ({ one, many }) => ({

  transaction: one(transaction, {
    fields: [enquiry_table.transaction_id],
    references: [transaction.id],
  }),
  holiday_type: one(package_type, {
    fields: [enquiry_table.holiday_type_id],
    references: [package_type.id],
  }),
  accomodation_type: one(accomodation_type, {
    fields: [enquiry_table.accomodation_type_id],
    references: [accomodation_type.id],
  }),
  cruise_line: many(enquiry_cruise_line),
  board_basis: many(enquiry_board_basis),
  departure_port: many(enquiry_departure_port),
  enquiry_cruise_destination: many(enquiry_cruise_destination),
  destination: many(enquiry_destination),
  resortss: many(enquiry_resorts),
  accomodation: many(enquiry_accomodation),
  departure_airport: many(enquiry_departure_airport),
  passengers: many(enquiry_passenger),
}));

export const enquiry_departure_port = pgTable('enquiry_departure_port', {
  port_id: uuid().references(() => port.id),
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
});
export const enquiry_departure_port_relations = relations(enquiry_departure_port, ({ one, many }) => ({
  port: one(port, {
    fields: [enquiry_departure_port.port_id],
    references: [port.id],
  }),
  enquiry: one(enquiry_table, {
    fields: [enquiry_departure_port.enquiry_id],
    references: [enquiry_table.id],
  }),
}));
export const enquiry_departure_airport = pgTable('enquiry_departure_airport', {
  airport_id: uuid().references(() => airport.id),
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
});
export const enquiry_departure_airport_relations = relations(enquiry_departure_airport, ({ one, many }) => ({
  airport: one(airport, {
    fields: [enquiry_departure_airport.airport_id],
    references: [airport.id],
  }),
  enquiry: one(enquiry_table, {
    fields: [enquiry_departure_airport.enquiry_id],
    references: [enquiry_table.id],
  }),
}));

export const enquiry_cruise_destination = pgTable('enquiry_cruise_destination', {
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
  cruise_destination_id: uuid().references(() => cruise_destination.id),
});
export const enquiry_cruise_destinationRelations = relations(enquiry_cruise_destination, ({ one, many }) => ({
  enquiry: one(enquiry_table, {
    fields: [enquiry_cruise_destination.enquiry_id],
    references: [enquiry_table.id],
  }),
  cruise_destination: one(cruise_destination, {
    fields: [enquiry_cruise_destination.cruise_destination_id],
    references: [cruise_destination.id],
  }),
}));

export const enquiry_board_basis = pgTable('enquiry_board_basis', {
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
  board_basis_id: uuid().references(() => board_basis.id),
});
export const enquiry_board_basis_relation = relations(enquiry_board_basis, ({ one, many }) => ({
  enquiry: one(enquiry_table, {
    fields: [enquiry_board_basis.enquiry_id],
    references: [enquiry_table.id],
  }),
  board_basis: one(board_basis, {
    fields: [enquiry_board_basis.board_basis_id],
    references: [board_basis.id],
  }),
}));
export const enquiry_destination = pgTable('enquiry_destination', {
  destination_id: uuid().references(() => destination.id),
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
});
export const enquiry_destination_relations = relations(enquiry_destination, ({ one, many }) => ({
  destination: one(destination, {
    fields: [enquiry_destination.destination_id],
    references: [destination.id],
  }),
  enquiry: one(enquiry_table, {
    fields: [enquiry_destination.enquiry_id],
    references: [enquiry_table.id],
  }),
}));
export const enquiry_cruise_line = pgTable('enquiry_cruise_line', {
  cruise_line_id: uuid().references(() => cruise_line.id),
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
});
export const enquiry_cruise_line_relations = relations(enquiry_cruise_line, ({ one, many }) => ({
  cruise_line: one(cruise_line, {
    fields: [enquiry_cruise_line.cruise_line_id],
    references: [cruise_line.id],
  }),
  enquiry: one(enquiry_table, {
    fields: [enquiry_cruise_line.enquiry_id],
    references: [enquiry_table.id],
  }),
}));

export const enquiry_resorts = pgTable('enquiry_resorts', {
  resorts_id: uuid().references(() => resorts.id),
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
});
export const enquiry_resorts_relations = relations(enquiry_resorts, ({ one, many }) => ({
  resorts: one(resorts, {
    fields: [enquiry_resorts.resorts_id],
    references: [resorts.id],
  }),
  enquiry: one(enquiry_table, {
    fields: [enquiry_resorts.enquiry_id],
    references: [enquiry_table.id],
  }),
}));
export const enquiry_accomodation = pgTable('enquiry_accomodation', {
  accomodation_id: uuid().references(() => accomodation_list.id),
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
});
export const enquiry_accomodation_relations = relations(enquiry_accomodation, ({ one, many }) => ({
  accomodation: one(accomodation_list, {
    fields: [enquiry_accomodation.accomodation_id],
    references: [accomodation_list.id],
  }),
  enquiry: one(enquiry_table, {
    fields: [enquiry_accomodation.enquiry_id],
    references: [enquiry_table.id],
  }),
}));


export const enquiry_passenger = pgTable('enquiry_passenger', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  enquiry_id: uuid().references(() => enquiry_table.id, {
    onDelete: 'cascade',
  }),
  type: varchar(), // e.g., 'ADULT', 'CHILD', 'INFANT'
  age: integer(),
});

export const enquiry_passenger_relations = relations(enquiry_passenger, ({ one, many }) => ({
  enquiry: one(enquiry_table, {
    fields: [enquiry_passenger.enquiry_id],
    references: [enquiry_table.id],
  }),
}));