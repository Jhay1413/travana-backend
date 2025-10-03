import { pgTable, uuid, varchar, foreignKey, date, boolean, timestamp, unique, numeric, integer, index, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const bookingStatus = pgEnum("booking_status", ['BOOKED', 'LOST'])
export const enquiryStatus = pgEnum("enquiry_status", ['ACTIVE', 'LOST', 'INACTIVE', 'EXPIRED', 'NEW_LEAD'])
export const quoteStatus = pgEnum("quote_status", ['NEW_LEAD', 'QUOTE_IN_PROGRESS', 'QUOTE_READY', 'AWAITING_DECISION', 'REQUOTE', 'WON', 'LOST', 'INACTIVE', 'EXPIRED'])
export const transactionStatus = pgEnum("transaction_status", ['on_quote', 'on_enquiry', 'on_booking'])


export const cruiseLineTable = pgTable("cruise_line_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
});

export const shipTable = pgTable("ship_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
	cruiseLineId: uuid("cruise_line_id"),
}, (table) => [
	foreignKey({
			columns: [table.cruiseLineId],
			foreignColumns: [cruiseLineTable.id],
			name: "ship_table_cruise_line_id_cruise_line_table_id_fk"
		}).onDelete("cascade"),
]);

export const cruiseDestinationTable = pgTable("cruise_destination_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
});

export const portTable = pgTable("port_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cruiseDestinationId: uuid("cruise_destination_id"),
	name: varchar(),
}, (table) => [
	foreignKey({
			columns: [table.cruiseDestinationId],
			foreignColumns: [cruiseDestinationTable.id],
			name: "port_table_cruise_destination_id_cruise_destination_table_id_fk"
		}),
]);

export const enquiryBoardBasis = pgTable("enquiry_board_basis", {
	enquiryId: uuid("enquiry_id"),
	boardBasisId: uuid("board_basis_id"),
}, (table) => [
	foreignKey({
			columns: [table.enquiryId],
			foreignColumns: [enquiryTable.id],
			name: "enquiry_board_basis_enquiry_id_enquiry_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.boardBasisId],
			foreignColumns: [boardBasis.id],
			name: "enquiry_board_basis_board_basis_id_board_basis_id_fk"
		}),
]);

export const boardBasis = pgTable("board_basis", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: varchar(),
});

export const enquiryCruiseDestination = pgTable("enquiry_cruise_destination", {
	enquiryId: uuid("enquiry_id"),
	cruiseDestinationId: uuid("cruise_destination_id"),
}, (table) => [
	foreignKey({
			columns: [table.enquiryId],
			foreignColumns: [enquiryTable.id],
			name: "enquiry_cruise_destination_enquiry_id_enquiry_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.cruiseDestinationId],
			foreignColumns: [cruiseDestinationTable.id],
			name: "enquiry_cruise_destination_cruise_destination_id_cruise_destina"
		}),
]);

export const enquiryCruiseLine = pgTable("enquiry_cruise_line", {
	cruiseLineId: uuid("cruise_line_id"),
	enquiryId: uuid("enquiry_id"),
}, (table) => [
	foreignKey({
			columns: [table.cruiseLineId],
			foreignColumns: [cruiseLineTable.id],
			name: "enquiry_cruise_line_cruise_line_id_cruise_line_table_id_fk"
		}),
	foreignKey({
			columns: [table.enquiryId],
			foreignColumns: [enquiryTable.id],
			name: "enquiry_cruise_line_enquiry_id_enquiry_table_id_fk"
		}).onDelete("cascade"),
]);

export const airportTable = pgTable("airport_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	airportCode: varchar("airport_code"),
	airportName: varchar("airport_name"),
	countryId: uuid("country_id"),
}, (table) => [
	foreignKey({
			columns: [table.countryId],
			foreignColumns: [countryTable.id],
			name: "airport_table_country_id_country_table_id_fk"
		}),
]);

export const enquiryDepartureAirport = pgTable("enquiry_departure_airport", {
	airportId: uuid("airport_id"),
	enquiryId: uuid("enquiry_id"),
}, (table) => [
	foreignKey({
			columns: [table.airportId],
			foreignColumns: [airportTable.id],
			name: "enquiry_departure_airport_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.enquiryId],
			foreignColumns: [enquiryTable.id],
			name: "enquiry_departure_airport_enquiry_id_enquiry_table_id_fk"
		}).onDelete("cascade"),
]);

export const enquiryDeparturePort = pgTable("enquiry_departure_port", {
	portId: uuid("port_id"),
	enquiryId: uuid("enquiry_id"),
}, (table) => [
	foreignKey({
			columns: [table.portId],
			foreignColumns: [portTable.id],
			name: "enquiry_departure_port_port_id_port_table_id_fk"
		}),
	foreignKey({
			columns: [table.enquiryId],
			foreignColumns: [enquiryTable.id],
			name: "enquiry_departure_port_enquiry_id_enquiry_table_id_fk"
		}).onDelete("cascade"),
]);

export const destinationTable = pgTable("destination_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
	type: varchar(),
	countryId: uuid("country_id"),
}, (table) => [
	foreignKey({
			columns: [table.countryId],
			foreignColumns: [countryTable.id],
			name: "destination_table_country_id_country_table_id_fk"
		}),
]);

export const enquiryDestination = pgTable("enquiry_destination", {
	destinationId: uuid("destination_id"),
	enquiryId: uuid("enquiry_id"),
}, (table) => [
	foreignKey({
			columns: [table.destinationId],
			foreignColumns: [destinationTable.id],
			name: "enquiry_destination_destination_id_destination_table_id_fk"
		}),
	foreignKey({
			columns: [table.enquiryId],
			foreignColumns: [enquiryTable.id],
			name: "enquiry_destination_enquiry_id_enquiry_table_id_fk"
		}).onDelete("cascade"),
]);

export const clientTable = pgTable("client_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar(),
	firstName: varchar(),
	surename: varchar(),
	dob: date("DOB"),
	phoneNumber: varchar(),
	email: varchar(),
	emailIsAllowed: boolean(),
	vmb: varchar("VMB"),
	vmBfirstAccess: varchar("VMBfirstAccess"),
	whatsAppVerified: boolean().default(false),
	mailAllowed: boolean().default(false),
	houseNumber: varchar(),
	city: varchar(),
	street: varchar(),
	country: varchar(),
	postCode: varchar("post_code"),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const userTable = pgTable("user_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	role: varchar(),
	firstName: varchar(),
	lastName: varchar(),
	email: varchar(),
	phoneNumber: varchar(),
	accountId: varchar(),
}, (table) => [
	unique("user_table_accountId_unique").on(table.accountId),
]);

export const flightsTable = pgTable("flights_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	flightId: varchar("flight_id"),
	flightNumber: varchar("flight_number"),
	flightRoute: varchar("flight_route"),
	departureDate: date("departure_date"),
	departureTime: varchar("departure_time"),
	arrivalDate: date("arrival_date"),
	arrivalTime: varchar("arrival_time"),
	departureAirportId: uuid("departure_airport_id"),
	destinationAirportId: uuid("destination_airport_id"),
}, (table) => [
	foreignKey({
			columns: [table.departureAirportId],
			foreignColumns: [airportTable.id],
			name: "flights_table_departure_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.destinationAirportId],
			foreignColumns: [airportTable.id],
			name: "flights_table_destination_airport_id_airport_table_id_fk"
		}),
]);

export const accomodationType = pgTable("accomodation_type", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: varchar(),
});

export const accomodationListTable = pgTable("accomodation_list_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	typeId: uuid("type_id"),
	name: varchar(),
	resortsId: uuid("resorts_id"),
}, (table) => [
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [accomodationType.id],
			name: "accomodation_list_table_type_id_accomodation_type_id_fk"
		}),
	foreignKey({
			columns: [table.resortsId],
			foreignColumns: [resortsTable.id],
			name: "accomodation_list_table_resorts_id_resorts_table_id_fk"
		}),
]);

export const countryTable = pgTable("country_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	countryName: varchar("country_name"),
	countryCode: varchar("country_code"),
});

export const notesTable = pgTable("notes_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	description: varchar(),
	agentId: uuid("agent_id"),
	timestamp2: timestamp({ mode: 'string' }).defaultNow().notNull(),
	transactionId: uuid("transaction_id"),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [userTable.id],
			name: "notes_table_agent_id_user_table_id_fk"
		}),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transaction.id],
			name: "notes_table_transaction_id_transaction_id_fk"
		}).onDelete("cascade"),
]);

export const passengers = pgTable("passengers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: varchar(),
	age: numeric(),
	quoteId: uuid("quote_id"),
	loungePassId: uuid("lounge_pass_id"),
	bookingId: uuid("booking_id"),
}, (table) => [
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "passengers_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.loungePassId],
			foreignColumns: [quoteLoungePass.id],
			name: "passengers_lounge_pass_id_quote_lounge_pass_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "passengers_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
]);

export const enquiryTable = pgTable("enquiry_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	travelDate: date("travel_date"),
	adults: numeric(),
	children: numeric(),
	infants: numeric(),
	noOfNights: numeric("no_of_nights"),
	budget: numeric(),
	preCruiseStay: numeric("pre_cruise_stay"),
	postCruiseStay: numeric("post_cruise_stay"),
	accomodationTypeId: uuid("accomodation_type_id"),
	cabinType: varchar("cabin_type"),
	flexibleDate: varchar("flexible_date"),
	weekendLodge: varchar("weekend_lodge"),
	noOfGuests: numeric("no_of_guests"),
	noOfPets: numeric("no_of_pets"),
	accomMinStarRating: varchar("accom_min_star_rating"),
	flexibilityDate: varchar("flexibility_date"),
	transactionId: uuid("transaction_id"),
	dateCreated: timestamp("date_created", { withTimezone: true, mode: 'string' }).defaultNow(),
	email: varchar(),
	status: enquiryStatus().default('ACTIVE'),
	dateExpiry: timestamp("date_expiry", { withTimezone: true, mode: 'string' }),
	isFutureDeal: boolean("is_future_deal").default(false),
	futureDealDate: date("future_deal_date"),
}, (table) => [
	foreignKey({
			columns: [table.accomodationTypeId],
			foreignColumns: [accomodationType.id],
			name: "enquiry_table_accomodation_type_id_accomodation_type_id_fk"
		}),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transaction.id],
			name: "enquiry_table_transaction_id_transaction_id_fk"
		}).onDelete("cascade"),
	unique("enquiry_table_transaction_id_unique").on(table.transactionId),
]);

export const taskTable = pgTable("task_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id"),
	clientId: uuid("client_id"),
	assignedById: uuid("assigned_by_id"),
	title: varchar(),
	task: varchar(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	priority: varchar(),
	status: varchar(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	transactionId: uuid("transaction_id"),
	transactionType: varchar("transaction_type"),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [userTable.id],
			name: "task_table_agent_id_user_table_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clientTable.id],
			name: "task_table_client_id_client_table_id_fk"
		}),
	foreignKey({
			columns: [table.assignedById],
			foreignColumns: [userTable.id],
			name: "task_table_assigned_by_id_user_table_id_fk"
		}),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transaction.id],
			name: "task_table_transaction_id_transaction_id_fk"
		}).onDelete("cascade"),
]);

export const quoteLoungePass = pgTable("quote_lounge_pass", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id"),
	terminal: varchar(),
	tourOperatorId: uuid("tour_operator_id"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	isIncludedInPackage: boolean("is_included_in_package"),
	note: varchar(),
	airportId: uuid("airport_id"),
	dateOfUsage: timestamp("date_of_usage", { mode: 'string' }),
	bookingRef: varchar("booking_ref"),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_lounge_pass_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "quote_lounge_pass_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.airportId],
			foreignColumns: [airportTable.id],
			name: "quote_lounge_pass_airport_id_airport_table_id_fk"
		}),
]);

export const enquiryAccomodation = pgTable("enquiry_accomodation", {
	accomodationId: uuid("accomodation_id"),
	enquiryId: uuid("enquiry_id"),
}, (table) => [
	foreignKey({
			columns: [table.accomodationId],
			foreignColumns: [accomodationListTable.id],
			name: "enquiry_accomodation_accomodation_id_accomodation_list_table_id"
		}),
	foreignKey({
			columns: [table.enquiryId],
			foreignColumns: [enquiryTable.id],
			name: "enquiry_accomodation_enquiry_id_enquiry_table_id_fk"
		}).onDelete("cascade"),
]);

export const quoteAttractionTicket = pgTable("quote_attraction_ticket", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id"),
	tourOperatorId: uuid("tour_operator_id"),
	ticketType: varchar("ticket_type"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	numberOfTickets: numeric("number_of_tickets"),
	isIncludedInPackage: boolean("is_included_in_package"),
	dateOfVisit: timestamp("date_of_visit", { mode: 'string' }),
	bookingRef: varchar("booking_ref"),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_attraction_ticket_tour_operator_id_tour_operator_table_id"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "quote_attraction_ticket_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
]);

export const resortsTable = pgTable("resorts_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
	destinationId: uuid("destination_id"),
}, (table) => [
	foreignKey({
			columns: [table.destinationId],
			foreignColumns: [destinationTable.id],
			name: "resorts_table_destination_id_destination_table_id_fk"
		}),
]);

export const quoteFlights = pgTable("quote_flights", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id"),
	departingAirportId: uuid("departing_airport_id"),
	arrivalAirportId: uuid("arrival_airport_id"),
	tourOperatorId: uuid("tour_operator_id"),
	flightType: varchar("flight_type"),
	departureDateTime: timestamp("departure_date_time", { mode: 'string' }),
	arrivalDateTime: timestamp("arrival_date_time", { mode: 'string' }),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	flightNumber: varchar("flight_number"),
	flightRef: varchar("flight_ref"),
}, (table) => [
	foreignKey({
			columns: [table.departingAirportId],
			foreignColumns: [airportTable.id],
			name: "quote_flights_departing_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.arrivalAirportId],
			foreignColumns: [airportTable.id],
			name: "quote_flights_arrival_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_flights_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "quote_flights_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
]);

export const quoteAirportParking = pgTable("quote_airport_parking", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id"),
	airportId: uuid("airport_id"),
	parkingType: varchar("parking_type"),
	carMake: varchar("car_make"),
	colour: varchar(),
	carRegNumber: varchar("car_reg_number"),
	duration: varchar(),
	tourOperatorId: uuid("tour_operator_id"),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	carModel: varchar("car_model"),
	parkingDate: timestamp("parking_date", { mode: 'string' }),
	bookingRef: varchar("booking_ref"),
}, (table) => [
	foreignKey({
			columns: [table.airportId],
			foreignColumns: [airportTable.id],
			name: "quote_airport_parking_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_airport_parking_tour_operator_id_tour_operator_table_id_f"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "quote_airport_parking_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
]);

export const quoteCarHire = pgTable("quote_car_hire", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id"),
	tourOperatorId: uuid("tour_operator_id"),
	pickUpLocation: varchar("pick_up_location"),
	dropOffLocation: varchar("drop_off_location"),
	pickUpTime: timestamp("pick_up_time", { mode: 'string' }),
	dropOffTime: timestamp("drop_off_time", { mode: 'string' }),
	noOfDays: numeric("no_of_days"),
	driverAge: numeric("driver_age"),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	bookingRef: varchar("booking_ref"),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_car_hire_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "quote_car_hire_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
]);

export const quoteTransfers = pgTable("quote_transfers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tourOperatorId: uuid("tour_operator_id"),
	pickUpLocation: varchar("pick_up_location"),
	dropOffLocation: varchar("drop_off_location"),
	pickUpTime: timestamp("pick_up_time", { mode: 'string' }),
	dropOffTime: timestamp("drop_off_time", { mode: 'string' }),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	quoteId: uuid("quote_id"),
	note: varchar(),
	bookingRef: varchar("booking_ref"),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_transfers_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "quote_transfers_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
]);

export const packageTypeTable = pgTable("package_type_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
});

export const tourOperatorTable = pgTable("tour_operator_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
});

export const cottagesTable = pgTable("cottages_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cottageName: varchar("cottage_name"),
	location: varchar(),
	cottageCode: varchar("cottage_code"),
	bedrooms: numeric(),
	bathrooms: integer(),
	sleeps: integer(),
	pets: integer(),
	image1: varchar("image_1"),
	image2: varchar("image_2"),
	detailsUrl: varchar("details_url"),
});

export const parkTable = pgTable("park_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
	city: varchar(),
	image1: varchar("image_1"),
	image2: varchar("image_2"),
	location: varchar(),
	county: varchar(),
	code: varchar(),
	description: varchar(),
});

export const lodgesTable = pgTable("lodges_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	parkId: uuid("park_id"),
	lodgeCode: varchar("lodge_code"),
	lodgeName: varchar("lodge_name"),
	adults: integer(),
	children: integer(),
	bedrooms: integer(),
	bathrooms: integer(),
	pets: integer(),
	sleeps: integer(),
	infants: integer(),
	image: varchar(),
}, (table) => [
	index("lodge_code_idx").using("btree", table.lodgeCode.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.parkId],
			foreignColumns: [parkTable.id],
			name: "lodges_table_park_id_park_table_id_fk"
		}),
]);

export const cruiseVoyageTable = pgTable("cruise_voyage_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	itineraryId: uuid("itinerary_id"),
	dayNumber: numeric("day_number"),
	description: varchar(),
}, (table) => [
	foreignKey({
			columns: [table.itineraryId],
			foreignColumns: [cruiseItenaryTable.id],
			name: "cruise_voyage_table_itinerary_id_cruise_itenary_table_id_fk"
		}).onDelete("cascade"),
]);

export const quoteTable = pgTable("quote_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	transactionId: uuid("transaction_id"),
	travelDate: date("travel_date"),
	discounts: numeric({ precision: 10, scale:  2 }),
	serviceCharge: numeric("service_charge", { precision: 10, scale:  2 }),
	salesPrice: numeric("sales_price", { precision: 10, scale:  2 }),
	packageCommission: numeric("package_commission", { precision: 10, scale:  2 }),
	numOfNights: varchar("num_of_nights"),
	pets: varchar(),
	cottageId: uuid("cottage_id"),
	lodgeId: uuid("lodge_id"),
	quoteType: varchar("quote_type"),
	transferType: varchar("transfer_type").default('none').notNull(),
	quoteStatus: quoteStatus("quote_status"),
	mainTourOperatorId: uuid("main_tour_operator_id"),
	lodgeType: varchar("lodge_type"),
	infant: integer(),
	child: integer(),
	adult: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true, mode: 'string' }).defaultNow(),
	dateExpiry: timestamp("date_expiry", { withTimezone: true, mode: 'string' }),
	isFutureDeal: boolean("is_future_deal").default(false),
	futureDealDate: date("future_deal_date"),
}, (table) => [
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transaction.id],
			name: "quote_table_transaction_id_transaction_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.cottageId],
			foreignColumns: [cottagesTable.id],
			name: "quote_table_cottage_id_cottages_table_id_fk"
		}),
	foreignKey({
			columns: [table.lodgeId],
			foreignColumns: [lodgesTable.id],
			name: "quote_table_lodge_id_lodges_table_id_fk"
		}),
	foreignKey({
			columns: [table.mainTourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_table_main_tour_operator_id_tour_operator_table_id_fk"
		}),
]);

export const cruiseExtraItemTable = pgTable("cruise_extra_item_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
});

export const quoteCruiseItemExtra = pgTable("quote_cruise_item_extra", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cruiseExtraId: uuid("cruise_extra_id"),
	quoteCruiseId: uuid("quote_cruise_id"),
}, (table) => [
	foreignKey({
			columns: [table.cruiseExtraId],
			foreignColumns: [cruiseExtraItemTable.id],
			name: "quote_cruise_item_extra_cruise_extra_id_cruise_extra_item_table"
		}),
	foreignKey({
			columns: [table.quoteCruiseId],
			foreignColumns: [quoteCruise.id],
			name: "quote_cruise_item_extra_quote_cruise_id_quote_cruise_id_fk"
		}).onDelete("cascade"),
]);

export const cruiseItenaryTable = pgTable("cruise_itenary_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shipId: uuid("ship_id"),
	itenary: varchar(),
	departurePort: varchar("departure_port"),
	date: date(),
}, (table) => [
	foreignKey({
			columns: [table.shipId],
			foreignColumns: [shipTable.id],
			name: "cruise_itenary_table_ship_id_ship_table_id_fk"
		}).onDelete("cascade"),
]);

export const quoteCruiseItinerary = pgTable("quote_cruise_itinerary", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteCruiseId: uuid("quote_cruise_id"),
	dayNumber: numeric("day_number"),
	description: varchar(),
}, (table) => [
	foreignKey({
			columns: [table.quoteCruiseId],
			foreignColumns: [quoteCruise.id],
			name: "quote_cruise_itinerary_quote_cruise_id_quote_cruise_id_fk"
		}).onDelete("cascade"),
]);

export const quoteAccomodation = pgTable("quote_accomodation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tourOperatorId: uuid("tour_operator_id"),
	noOfNights: varchar("no_of_nights"),
	roomType: varchar("room_type"),
	isPrimary: boolean("is_primary").default(false),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	accomodationId: uuid("accomodation_id"),
	quoteId: uuid("quote_id"),
	checkInDateTime: timestamp("check_in_date_time", { mode: 'string' }),
	stayType: varchar("stay_type"),
	boardBasisId: uuid("board_basis_id"),
	bookingRef: varchar("booking_ref"),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_accomodation_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.accomodationId],
			foreignColumns: [accomodationListTable.id],
			name: "quote_accomodation_accomodation_id_accomodation_list_table_id_f"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "quote_accomodation_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.boardBasisId],
			foreignColumns: [boardBasis.id],
			name: "quote_accomodation_board_basis_id_board_basis_id_fk"
		}),
]);

export const enquiryResorts = pgTable("enquiry_resorts", {
	resortsId: uuid("resorts_id"),
	enquiryId: uuid("enquiry_id"),
}, (table) => [
	foreignKey({
			columns: [table.resortsId],
			foreignColumns: [resortsTable.id],
			name: "enquiry_resorts_resorts_id_resorts_table_id_fk"
		}),
	foreignKey({
			columns: [table.enquiryId],
			foreignColumns: [enquiryTable.id],
			name: "enquiry_resorts_enquiry_id_enquiry_table_id_fk"
		}).onDelete("cascade"),
]);

export const quoteCruise = pgTable("quote_cruise", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cruiseLine: varchar("cruise_line"),
	ship: varchar(),
	cruiseDate: date("cruise_date"),
	cabinType: varchar("cabin_type"),
	cruiseName: varchar("cruise_name"),
	preCruiseStay: numeric("pre_cruise_stay"),
	postCruiseStay: numeric("post_cruise_stay"),
	tourOperatorId: uuid("tour_operator_id"),
	quoteId: uuid("quote_id"),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "quote_cruise_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quoteTable.id],
			name: "quote_cruise_quote_id_quote_table_id_fk"
		}).onDelete("cascade"),
	unique("quote_cruise_quote_id_unique").on(table.quoteId),
]);

export const bookingCruise = pgTable("booking_cruise", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tourOperatorId: uuid("tour_operator_id"),
	cruiseLine: varchar("cruise_line"),
	ship: varchar(),
	cruiseDate: date("cruise_date"),
	cabinType: varchar("cabin_type"),
	cruiseName: varchar("cruise_name"),
	preCruiseStay: numeric("pre_cruise_stay"),
	postCruiseStay: numeric("post_cruise_stay"),
	bookingId: uuid("booking_id"),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_cruise_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "booking_cruise_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
]);

export const transaction = pgTable("transaction", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	status: transactionStatus(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	holidayTypeId: uuid("holiday_type_id"),
	clientId: uuid("client_id"),
	agentId: uuid("agent_id"),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clientTable.id],
			name: "transaction_client_id_client_table_id_fk"
		}),
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [userTable.id],
			name: "transaction_agent_id_user_table_id_fk"
		}),
	foreignKey({
			columns: [table.holidayTypeId],
			foreignColumns: [packageTypeTable.id],
			name: "transaction_holiday_type_id_package_type_table_id_fk"
		}),
]);

export const bookingAccomodation = pgTable("booking_accomodation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingRef: varchar("booking_ref"),
	tourOperatorId: uuid("tour_operator_id"),
	noOfNights: varchar("no_of_nights"),
	roomType: varchar("room_type"),
	boardBasisId: uuid("board_basis_id"),
	checkInDateTime: timestamp("check_in_date_time", { mode: 'string' }),
	stayType: varchar("stay_type"),
	isPrimary: boolean("is_primary").default(false),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	accomodationId: uuid("accomodation_id"),
	bookingId: uuid("booking_id"),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_accomodation_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.boardBasisId],
			foreignColumns: [boardBasis.id],
			name: "booking_accomodation_board_basis_id_board_basis_id_fk"
		}),
	foreignKey({
			columns: [table.accomodationId],
			foreignColumns: [accomodationListTable.id],
			name: "booking_accomodation_accomodation_id_accomodation_list_table_id"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "booking_accomodation_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
]);

export const bookingAirportParking = pgTable("booking_airport_parking", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingRef: varchar("booking_ref"),
	bookingId: uuid("booking_id"),
	airportId: uuid("airport_id"),
	parkingType: varchar("parking_type"),
	parkingDate: timestamp("parking_date", { mode: 'string' }),
	carMake: varchar("car_make"),
	carModel: varchar("car_model"),
	colour: varchar(),
	carRegNumber: varchar("car_reg_number"),
	duration: varchar(),
	tourOperatorId: uuid("tour_operator_id"),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "booking_airport_parking_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.airportId],
			foreignColumns: [airportTable.id],
			name: "booking_airport_parking_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_airport_parking_tour_operator_id_tour_operator_table_id"
		}),
]);

export const bookingAttractionTicket = pgTable("booking_attraction_ticket", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id"),
	bookingRef: varchar("booking_ref"),
	tourOperatorId: uuid("tour_operator_id"),
	ticketType: varchar("ticket_type"),
	dateOfVisit: timestamp("date_of_visit", { mode: 'string' }),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	numberOfTickets: numeric("number_of_tickets"),
	isIncludedInPackage: boolean("is_included_in_package"),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "booking_attraction_ticket_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_attraction_ticket_tour_operator_id_tour_operator_table_"
		}),
]);

export const bookingCarHire = pgTable("booking_car_hire", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id"),
	bookingRef: varchar("booking_ref"),
	tourOperatorId: uuid("tour_operator_id"),
	pickUpLocation: varchar("pick_up_location"),
	dropOffLocation: varchar("drop_off_location"),
	pickUpTime: timestamp("pick_up_time", { mode: 'string' }),
	dropOffTime: timestamp("drop_off_time", { mode: 'string' }),
	noOfDays: numeric("no_of_days"),
	driverAge: numeric("driver_age"),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "booking_car_hire_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_car_hire_tour_operator_id_tour_operator_table_id_fk"
		}),
]);

export const bookingCruiseItemExtra = pgTable("booking_cruise_item_extra", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cruiseExtraId: uuid("cruise_extra_id"),
	bookingCruiseId: uuid("booking_cruise_id"),
}, (table) => [
	foreignKey({
			columns: [table.cruiseExtraId],
			foreignColumns: [cruiseExtraItemTable.id],
			name: "booking_cruise_item_extra_cruise_extra_id_cruise_extra_item_tab"
		}),
	foreignKey({
			columns: [table.bookingCruiseId],
			foreignColumns: [bookingCruise.id],
			name: "booking_cruise_item_extra_booking_cruise_id_booking_cruise_id_f"
		}).onDelete("cascade"),
]);

export const bookingCruiseItinerary = pgTable("booking_cruise_itinerary", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingCruiseId: uuid("booking_cruise_id"),
	dayNumber: numeric("day_number"),
	description: varchar(),
}, (table) => [
	foreignKey({
			columns: [table.bookingCruiseId],
			foreignColumns: [bookingCruise.id],
			name: "booking_cruise_itinerary_booking_cruise_id_booking_cruise_id_fk"
		}).onDelete("cascade"),
]);

export const bookingFlights = pgTable("booking_flights", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id"),
	flightNumber: varchar("flight_number"),
	flightRef: varchar("flight_ref"),
	departingAirportId: uuid("departing_airport_id"),
	arrivalAirportId: uuid("arrival_airport_id"),
	tourOperatorId: uuid("tour_operator_id"),
	flightType: varchar("flight_type"),
	departureDateTime: timestamp("departure_date_time", { mode: 'string' }),
	arrivalDateTime: timestamp("arrival_date_time", { mode: 'string' }),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "booking_flights_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.departingAirportId],
			foreignColumns: [airportTable.id],
			name: "booking_flights_departing_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.arrivalAirportId],
			foreignColumns: [airportTable.id],
			name: "booking_flights_arrival_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_flights_tour_operator_id_tour_operator_table_id_fk"
		}),
]);

export const bookingLoungePass = pgTable("booking_lounge_pass", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id"),
	bookingRef: varchar("booking_ref"),
	terminal: varchar(),
	airportId: uuid("airport_id"),
	dateOfUsage: timestamp("date_of_usage", { mode: 'string' }),
	tourOperatorId: uuid("tour_operator_id"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	isIncludedInPackage: boolean("is_included_in_package"),
	note: varchar(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "booking_lounge_pass_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.airportId],
			foreignColumns: [airportTable.id],
			name: "booking_lounge_pass_airport_id_airport_table_id_fk"
		}),
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_lounge_pass_tour_operator_id_tour_operator_table_id_fk"
		}),
]);

export const bookingTransfers = pgTable("booking_transfers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingRef: varchar("booking_ref"),
	tourOperatorId: uuid("tour_operator_id"),
	pickUpLocation: varchar("pick_up_location"),
	dropOffLocation: varchar("drop_off_location"),
	pickUpTime: timestamp("pick_up_time", { mode: 'string' }),
	dropOffTime: timestamp("drop_off_time", { mode: 'string' }),
	isIncludedInPackage: boolean("is_included_in_package"),
	cost: numeric({ precision: 10, scale:  2 }),
	commission: numeric({ precision: 10, scale:  2 }),
	bookingId: uuid("booking_id"),
	note: varchar(),
}, (table) => [
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_transfers_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookingTable.id],
			name: "booking_transfers_booking_id_booking_table_id_fk"
		}).onDelete("cascade"),
]);

export const bookingTable = pgTable("booking_table", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	haysRef: varchar("hays_ref"),
	supplierRef: varchar("supplier_ref"),
	salesPrice: numeric("sales_price", { precision: 10, scale:  2 }),
	packageCommission: numeric("package_commission", { precision: 10, scale:  2 }),
	travelDate: date("travel_date"),
	discounts: numeric({ precision: 10, scale:  2 }),
	serviceCharge: numeric("service_charge", { precision: 10, scale:  2 }),
	numOfNights: varchar("num_of_nights"),
	pets: varchar(),
	cottageId: uuid("cottage_id"),
	lodgeId: uuid("lodge_id"),
	lodgeType: varchar("lodge_type"),
	transferType: varchar("transfer_type"),
	bookingStatus: bookingStatus("booking_status"),
	mainTourOperatorId: uuid("main_tour_operator_id"),
	transactionId: uuid("transaction_id"),
	infant: integer(),
	child: integer(),
	adult: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.cottageId],
			foreignColumns: [cottagesTable.id],
			name: "booking_table_cottage_id_cottages_table_id_fk"
		}),
	foreignKey({
			columns: [table.lodgeId],
			foreignColumns: [lodgesTable.id],
			name: "booking_table_lodge_id_lodges_table_id_fk"
		}),
	foreignKey({
			columns: [table.mainTourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "booking_table_main_tour_operator_id_tour_operator_table_id_fk"
		}),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transaction.id],
			name: "booking_table_transaction_id_transaction_id_fk"
		}).onDelete("cascade"),
	unique("booking_table_transaction_id_unique").on(table.transactionId),
]);

export const notificationToken = pgTable("notification_token", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	token: varchar().notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userTable.id],
			name: "notification_token_user_id_user_table_id_fk"
		}).onDelete("cascade"),
	unique("notification_token_token_unique").on(table.token),
]);

export const notification = pgTable("notification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	message: varchar().notNull(),
	dateCreated: timestamp("date_created", { mode: 'string' }).defaultNow().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	dateRead: timestamp("date_read", { mode: 'string' }),
	dueDate: timestamp("due_date", { mode: 'string' }),
	type: varchar(),
	referenceId: varchar("reference_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userTable.id],
			name: "notification_user_id_user_table_id_fk"
		}).onDelete("cascade"),
]);

export const tourPackageCommissionTable = pgTable("tour_package_commission_table", {
	packageTypeId: uuid("package_type_id").notNull(),
	tourOperatorId: uuid("tour_operator_id").notNull(),
	percentageCommission: numeric("percentage_commission", { precision: 5, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.packageTypeId],
			foreignColumns: [packageTypeTable.id],
			name: "tour_package_commission_table_package_type_id_package_type_tabl"
		}),
	foreignKey({
			columns: [table.tourOperatorId],
			foreignColumns: [tourOperatorTable.id],
			name: "tour_package_commission_table_tour_operator_id_tour_operator_ta"
		}),
	primaryKey({ columns: [table.packageTypeId, table.tourOperatorId], name: "id"}),
]);
