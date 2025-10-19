import { not, relations, sql } from 'drizzle-orm';
import { boolean, decimal, index, integer, pgEnum, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { enquiry_accomodation, enquiry_board_basis, enquiry_destination, enquiry_resorts, enquiry_table } from './enquiry-schema';
import { airport } from './flights-schema';
import {
  quote,
  quote_accomodation,
  quote_airport_parking,
  quote_attraction_ticket,
  quote_car_hire,
  quote_cruise,
  quote_cruise_item_extra,
  quote_flights,
  quote_lounge_pass,
  quote_transfers,
} from './quote-schema';
import { clientTable } from './client-schema';
import { usersTable } from './user-schema';
import {
  booking,
  booking_accomodation,
  booking_airport_parking,
  booking_attraction_ticket,
  booking_car_hire,
  booking_cruise,
  booking_cruise_item_extra,
  booking_flights,
  booking_lounge_pass,
  booking_transfers,
} from './booking-schema';
import { notes } from './note-schema';
import { task } from './task-schema';
import { referral } from './referral-schema';
import { user } from './auth-schema';

export const leadSourceEnum = pgEnum('lead_source', ['SHOP','FACEBOOK', 'WHATSAPP', 'INSTAGRAM', 'PHONE_ENQUIRY']);
export const transactionStatusEnum = pgEnum('transaction_status', ['on_quote', 'on_enquiry', 'on_booking']);
export const transaction = pgTable('transaction', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  status: transactionStatusEnum(),
  is_active: boolean().default(true),
  client_id: uuid().references(() => clientTable.id).notNull(),
  holiday_type_id: uuid().references(() => package_type.id),
  created_at: timestamp({ mode: 'string' }).notNull().defaultNow(),
  agent_id: uuid().references(() => usersTable.id),
  lead_source: leadSourceEnum().default("SHOP"),
  user_id: text().references(() => user.id).notNull(),
  
});

export const transactionRelation = relations(transaction, ({ one, many }) => ({
  user:one(user,{
    fields: [transaction.user_id],
    references: [user.id],
  }),
  agent: one(usersTable, {
    fields: [transaction.agent_id],
    references: [usersTable.id],
  }),
  booking: one(booking, {
    fields: [transaction.id],
    references: [booking.transaction_id],
  }),
  enquiry: one(enquiry_table, {
    fields: [transaction.id],
    references: [enquiry_table.transaction_id],
  }),
  quote: many(quote),
  holiday_type: one(package_type, {
    fields: [transaction.holiday_type_id],
    references: [package_type.id],
  }),
  client: one(clientTable, {
    fields: [transaction.client_id],
    references: [clientTable.id],
  }),
  referrals: many(referral),
  tasks:many(task),
  notes: many(notes),
}));
export const accomodation_type = pgTable('accomodation_type', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  type: varchar(),
});
export const accomodation_type_relation = relations(accomodation_type, ({ one, many }) => ({
  accomodation_list: many(accomodation_list),
}));

export const board_basis = pgTable('board_basis', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  type: varchar().notNull(),
});
export const board_basis_relation = relations(board_basis, ({ one, many }) => ({
  enquiry_board_basis: many(enquiry_board_basis),
  quote_accomodation: many(quote_accomodation),
  booking_accomodation: many(booking_accomodation),
}));
export const destination = pgTable('destination_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar().notNull(),
  type: varchar(),
  country_id: uuid().references(() => country.id),
});

export const destination_relation = relations(destination, ({ one, many }) => ({
  enquiry_destination: many(enquiry_destination),
  //   booking: many(bookingTable),
  //   booking_extra: many(booking_extra),
  country: one(country, {
    fields: [destination.country_id],
    references: [country.id],
  }),
}));
export const country = pgTable('country_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  country_name: varchar().notNull(),
  country_code: varchar(),
});
export const country_relation = relations(country, ({ one, many }) => ({
  destination: many(destination),
  airport: many(airport),
}));
export const accomodation_list = pgTable('accomodation_list_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  type_id: uuid().references(() => accomodation_type.id),
  name: varchar().notNull(),
resorts_id: uuid().references(() => resorts.id),
});
export const accomodation_list_relations = relations(accomodation_list, ({ one, many }) => ({
  //   booking_accomodation: many(booking_accomodation),
  type: one(accomodation_type, {
    fields: [accomodation_list.type_id],
    references: [accomodation_type.id],
  }),
  resorts: one(resorts, {
    fields: [accomodation_list.resorts_id],
    references: [resorts.id],
  }),
  enquiry_accodation: many(enquiry_accomodation),
  quote_accomodation: many(quote_accomodation),
  booking_accomodation: many(booking_accomodation),
}));

export const resorts = pgTable('resorts_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar().notNull(),
  destination_id: uuid().references(() => destination.id),
});
export const resortsRelations = relations(resorts, ({ one, many }) => ({
  destination: one(destination, {
    fields: [resorts.destination_id],
    references: [destination.id],
  }),
  accomodation: many(accomodation_list),
  enquiry_resorts: many(enquiry_resorts),
}));

export const tour_operator = pgTable('tour_operator_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar(),
});
export const tour_operator_relation = relations(tour_operator, ({ one, many }) => ({
  quote: many(quote),
  booking: many(booking),
  tour_package_commission: many(tour_package_commission),

  quote_flights: many(quote_flights),
  quote_accomodation: many(quote_accomodation),
  quote_transfers: many(quote_transfers),
  quote_car_hire: many(quote_car_hire),
  quote_attraction_tickets: many(quote_attraction_ticket),
  quote_lounge_pass: many(quote_lounge_pass),
  quote_airport_parking: many(quote_airport_parking),
  quote_cruise: many(quote_cruise),

  booking_flights: many(booking_flights),
  booking_accomodation: many(booking_accomodation),
  booking_transfers: many(booking_transfers),
  booking_car_hire: many(booking_car_hire),
  booking_attraction_tickets: many(booking_attraction_ticket),
  booking_lounge_pass: many(booking_lounge_pass),
  booking_airport_parking: many(booking_airport_parking),
  booking_cruise: many(booking_cruise),
}));
export const package_type = pgTable('package_type_table', {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar().notNull(),
});
export const package_type_relation = relations(package_type, ({ one, many }) => ({
  tour_package_commission: many(tour_package_commission),
  transaction: many(transaction),
  quote: many(quote),
  enquiry: many(enquiry_table),
  booking: many(booking),

}));
export const tour_package_commission = pgTable(
  'tour_package_commission_table',
  {
    package_type_id: uuid().references(() => package_type.id),
    tour_operator_id: uuid().references(() => tour_operator.id),
    percentage_commission: decimal({ precision: 5, scale: 2 }),
  },
  (table) => [primaryKey({ name: 'id', columns: [table.package_type_id, table.tour_operator_id] })]
);
export const tour_package_commission_relation = relations(tour_package_commission, ({ one, many }) => ({
  package_type: one(package_type, {
    fields: [tour_package_commission.package_type_id],
    references: [package_type.id],
  }),
  tour_operator: one(tour_operator, {
    fields: [tour_package_commission.tour_operator_id],
    references: [tour_operator.id],
  }),
}));

export const park = pgTable('park_table', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar(),
  image_1: varchar(),
  image_2: varchar(),
  location: varchar(),
  city: varchar(),
  county: varchar(),
  code: varchar(),
  description: varchar(),
});
export const park_relation = relations(park, ({ one, many }) => ({
  lodge: many(lodges),
}));

export const cottages = pgTable('cottages_table', {
  id: uuid().defaultRandom().primaryKey(),
  cottage_name: varchar(),
  location: varchar(),
  cottage_code: varchar(),
  bedrooms: integer(),
  bathrooms: integer(),
  sleeps: integer(),
  pets: integer(),
  image_1: varchar(),
  image_2: varchar(),
  details_url: varchar(),
});
export const cottage_relation = relations(cottages, ({ one, many }) => ({
  quote_cottage: many(quote),
  booking_cottage: many(booking),
}));
export const lodges = pgTable(
  'lodges_table',
  {
    id: uuid().defaultRandom().primaryKey(),
    park_id: uuid().references(() => park.id),
    lodge_name: varchar(),
    lodge_code: varchar(),
    image: varchar(),
    adults: integer(),
    children: integer(),
    bedrooms: integer(),
    bathrooms: integer(),
    pets: integer(),
    sleeps: integer(),
    infants: integer(),
  },
  (table) => ({
    emailIdx: index('lodge_code_idx').on(table.lodge_code),
  })
);

export const lodge_relation = relations(lodges, ({ one, many }) => ({
  park: one(park, {
    fields: [lodges.park_id],
    references: [park.id],
  }),
  quote_lodge: many(quote),
  booking_lodge: many(booking),
}));

export const cruise_extra_item = pgTable('cruise_extra_item_table', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar(),
});
export const cruise_extra_item_relation = relations(cruise_extra_item, ({ one, many }) => ({
  quote: many(quote_cruise_item_extra),
  booking: many(booking_cruise_item_extra),
}));


export const deletion_codes = pgTable('deletion_codes',{
  id:uuid().defaultRandom().primaryKey(),
  is_used:boolean().default(false),
  code:varchar(),
  created_at:timestamp({ mode: 'string' }).notNull().defaultNow(),
})
export const room_type = pgTable('room_type',{
  id:uuid().defaultRandom().primaryKey(),
  name:varchar(),
})
