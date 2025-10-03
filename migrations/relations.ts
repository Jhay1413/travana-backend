import { relations } from "drizzle-orm/relations";
import { cruiseLineTable, shipTable, cruiseDestinationTable, portTable, enquiryTable, enquiryBoardBasis, boardBasis, enquiryCruiseDestination, enquiryCruiseLine, countryTable, airportTable, enquiryDepartureAirport, enquiryDeparturePort, destinationTable, enquiryDestination, flightsTable, accomodationType, accomodationListTable, resortsTable, userTable, notesTable, transaction, quoteTable, passengers, quoteLoungePass, bookingTable, taskTable, clientTable, tourOperatorTable, enquiryAccomodation, quoteAttractionTicket, quoteFlights, quoteAirportParking, quoteCarHire, quoteTransfers, parkTable, lodgesTable, cruiseItenaryTable, cruiseVoyageTable, cottagesTable, cruiseExtraItemTable, quoteCruiseItemExtra, quoteCruise, quoteCruiseItinerary, quoteAccomodation, enquiryResorts, bookingCruise, packageTypeTable, bookingAccomodation, bookingAirportParking, bookingAttractionTicket, bookingCarHire, bookingCruiseItemExtra, bookingCruiseItinerary, bookingFlights, bookingLoungePass, bookingTransfers, notificationToken, notification, tourPackageCommissionTable } from "./schema";

export const shipTableRelations = relations(shipTable, ({one, many}) => ({
	cruiseLineTable: one(cruiseLineTable, {
		fields: [shipTable.cruiseLineId],
		references: [cruiseLineTable.id]
	}),
	cruiseItenaryTables: many(cruiseItenaryTable),
}));

export const cruiseLineTableRelations = relations(cruiseLineTable, ({many}) => ({
	shipTables: many(shipTable),
	enquiryCruiseLines: many(enquiryCruiseLine),
}));

export const portTableRelations = relations(portTable, ({one, many}) => ({
	cruiseDestinationTable: one(cruiseDestinationTable, {
		fields: [portTable.cruiseDestinationId],
		references: [cruiseDestinationTable.id]
	}),
	enquiryDeparturePorts: many(enquiryDeparturePort),
}));

export const cruiseDestinationTableRelations = relations(cruiseDestinationTable, ({many}) => ({
	portTables: many(portTable),
	enquiryCruiseDestinations: many(enquiryCruiseDestination),
}));

export const enquiryBoardBasisRelations = relations(enquiryBoardBasis, ({one}) => ({
	enquiryTable: one(enquiryTable, {
		fields: [enquiryBoardBasis.enquiryId],
		references: [enquiryTable.id]
	}),
	boardBasi: one(boardBasis, {
		fields: [enquiryBoardBasis.boardBasisId],
		references: [boardBasis.id]
	}),
}));

export const enquiryTableRelations = relations(enquiryTable, ({one, many}) => ({
	enquiryBoardBases: many(enquiryBoardBasis),
	enquiryCruiseDestinations: many(enquiryCruiseDestination),
	enquiryCruiseLines: many(enquiryCruiseLine),
	enquiryDepartureAirports: many(enquiryDepartureAirport),
	enquiryDeparturePorts: many(enquiryDeparturePort),
	enquiryDestinations: many(enquiryDestination),
	accomodationType: one(accomodationType, {
		fields: [enquiryTable.accomodationTypeId],
		references: [accomodationType.id]
	}),
	transaction: one(transaction, {
		fields: [enquiryTable.transactionId],
		references: [transaction.id]
	}),
	enquiryAccomodations: many(enquiryAccomodation),
	enquiryResorts: many(enquiryResorts),
}));

export const boardBasisRelations = relations(boardBasis, ({many}) => ({
	enquiryBoardBases: many(enquiryBoardBasis),
	quoteAccomodations: many(quoteAccomodation),
	bookingAccomodations: many(bookingAccomodation),
}));

export const enquiryCruiseDestinationRelations = relations(enquiryCruiseDestination, ({one}) => ({
	enquiryTable: one(enquiryTable, {
		fields: [enquiryCruiseDestination.enquiryId],
		references: [enquiryTable.id]
	}),
	cruiseDestinationTable: one(cruiseDestinationTable, {
		fields: [enquiryCruiseDestination.cruiseDestinationId],
		references: [cruiseDestinationTable.id]
	}),
}));

export const enquiryCruiseLineRelations = relations(enquiryCruiseLine, ({one}) => ({
	cruiseLineTable: one(cruiseLineTable, {
		fields: [enquiryCruiseLine.cruiseLineId],
		references: [cruiseLineTable.id]
	}),
	enquiryTable: one(enquiryTable, {
		fields: [enquiryCruiseLine.enquiryId],
		references: [enquiryTable.id]
	}),
}));

export const airportTableRelations = relations(airportTable, ({one, many}) => ({
	countryTable: one(countryTable, {
		fields: [airportTable.countryId],
		references: [countryTable.id]
	}),
	enquiryDepartureAirports: many(enquiryDepartureAirport),
	flightsTables_departureAirportId: many(flightsTable, {
		relationName: "flightsTable_departureAirportId_airportTable_id"
	}),
	flightsTables_destinationAirportId: many(flightsTable, {
		relationName: "flightsTable_destinationAirportId_airportTable_id"
	}),
	quoteLoungePasses: many(quoteLoungePass),
	quoteFlights_departingAirportId: many(quoteFlights, {
		relationName: "quoteFlights_departingAirportId_airportTable_id"
	}),
	quoteFlights_arrivalAirportId: many(quoteFlights, {
		relationName: "quoteFlights_arrivalAirportId_airportTable_id"
	}),
	quoteAirportParkings: many(quoteAirportParking),
	bookingAirportParkings: many(bookingAirportParking),
	bookingFlights_departingAirportId: many(bookingFlights, {
		relationName: "bookingFlights_departingAirportId_airportTable_id"
	}),
	bookingFlights_arrivalAirportId: many(bookingFlights, {
		relationName: "bookingFlights_arrivalAirportId_airportTable_id"
	}),
	bookingLoungePasses: many(bookingLoungePass),
}));

export const countryTableRelations = relations(countryTable, ({many}) => ({
	airportTables: many(airportTable),
	destinationTables: many(destinationTable),
}));

export const enquiryDepartureAirportRelations = relations(enquiryDepartureAirport, ({one}) => ({
	airportTable: one(airportTable, {
		fields: [enquiryDepartureAirport.airportId],
		references: [airportTable.id]
	}),
	enquiryTable: one(enquiryTable, {
		fields: [enquiryDepartureAirport.enquiryId],
		references: [enquiryTable.id]
	}),
}));

export const enquiryDeparturePortRelations = relations(enquiryDeparturePort, ({one}) => ({
	portTable: one(portTable, {
		fields: [enquiryDeparturePort.portId],
		references: [portTable.id]
	}),
	enquiryTable: one(enquiryTable, {
		fields: [enquiryDeparturePort.enquiryId],
		references: [enquiryTable.id]
	}),
}));

export const destinationTableRelations = relations(destinationTable, ({one, many}) => ({
	countryTable: one(countryTable, {
		fields: [destinationTable.countryId],
		references: [countryTable.id]
	}),
	enquiryDestinations: many(enquiryDestination),
	resortsTables: many(resortsTable),
}));

export const enquiryDestinationRelations = relations(enquiryDestination, ({one}) => ({
	destinationTable: one(destinationTable, {
		fields: [enquiryDestination.destinationId],
		references: [destinationTable.id]
	}),
	enquiryTable: one(enquiryTable, {
		fields: [enquiryDestination.enquiryId],
		references: [enquiryTable.id]
	}),
}));

export const flightsTableRelations = relations(flightsTable, ({one}) => ({
	airportTable_departureAirportId: one(airportTable, {
		fields: [flightsTable.departureAirportId],
		references: [airportTable.id],
		relationName: "flightsTable_departureAirportId_airportTable_id"
	}),
	airportTable_destinationAirportId: one(airportTable, {
		fields: [flightsTable.destinationAirportId],
		references: [airportTable.id],
		relationName: "flightsTable_destinationAirportId_airportTable_id"
	}),
}));

export const accomodationListTableRelations = relations(accomodationListTable, ({one, many}) => ({
	accomodationType: one(accomodationType, {
		fields: [accomodationListTable.typeId],
		references: [accomodationType.id]
	}),
	resortsTable: one(resortsTable, {
		fields: [accomodationListTable.resortsId],
		references: [resortsTable.id]
	}),
	enquiryAccomodations: many(enquiryAccomodation),
	quoteAccomodations: many(quoteAccomodation),
	bookingAccomodations: many(bookingAccomodation),
}));

export const accomodationTypeRelations = relations(accomodationType, ({many}) => ({
	accomodationListTables: many(accomodationListTable),
	enquiryTables: many(enquiryTable),
}));

export const resortsTableRelations = relations(resortsTable, ({one, many}) => ({
	accomodationListTables: many(accomodationListTable),
	destinationTable: one(destinationTable, {
		fields: [resortsTable.destinationId],
		references: [destinationTable.id]
	}),
	enquiryResorts: many(enquiryResorts),
}));

export const notesTableRelations = relations(notesTable, ({one}) => ({
	userTable: one(userTable, {
		fields: [notesTable.agentId],
		references: [userTable.id]
	}),
	transaction: one(transaction, {
		fields: [notesTable.transactionId],
		references: [transaction.id]
	}),
}));

export const userTableRelations = relations(userTable, ({many}) => ({
	notesTables: many(notesTable),
	taskTables_agentId: many(taskTable, {
		relationName: "taskTable_agentId_userTable_id"
	}),
	taskTables_assignedById: many(taskTable, {
		relationName: "taskTable_assignedById_userTable_id"
	}),
	transactions: many(transaction),
	notificationTokens: many(notificationToken),
	notifications: many(notification),
}));

export const transactionRelations = relations(transaction, ({one, many}) => ({
	notesTables: many(notesTable),
	enquiryTables: many(enquiryTable),
	taskTables: many(taskTable),
	quoteTables: many(quoteTable),
	clientTable: one(clientTable, {
		fields: [transaction.clientId],
		references: [clientTable.id]
	}),
	userTable: one(userTable, {
		fields: [transaction.agentId],
		references: [userTable.id]
	}),
	packageTypeTable: one(packageTypeTable, {
		fields: [transaction.holidayTypeId],
		references: [packageTypeTable.id]
	}),
	bookingTables: many(bookingTable),
}));

export const passengersRelations = relations(passengers, ({one}) => ({
	quoteTable: one(quoteTable, {
		fields: [passengers.quoteId],
		references: [quoteTable.id]
	}),
	quoteLoungePass: one(quoteLoungePass, {
		fields: [passengers.loungePassId],
		references: [quoteLoungePass.id]
	}),
	bookingTable: one(bookingTable, {
		fields: [passengers.bookingId],
		references: [bookingTable.id]
	}),
}));

export const quoteTableRelations = relations(quoteTable, ({one, many}) => ({
	passengers: many(passengers),
	quoteLoungePasses: many(quoteLoungePass),
	quoteAttractionTickets: many(quoteAttractionTicket),
	quoteFlights: many(quoteFlights),
	quoteAirportParkings: many(quoteAirportParking),
	quoteCarHires: many(quoteCarHire),
	quoteTransfers: many(quoteTransfers),
	transaction: one(transaction, {
		fields: [quoteTable.transactionId],
		references: [transaction.id]
	}),
	cottagesTable: one(cottagesTable, {
		fields: [quoteTable.cottageId],
		references: [cottagesTable.id]
	}),
	lodgesTable: one(lodgesTable, {
		fields: [quoteTable.lodgeId],
		references: [lodgesTable.id]
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteTable.mainTourOperatorId],
		references: [tourOperatorTable.id]
	}),
	quoteAccomodations: many(quoteAccomodation),
	quoteCruises: many(quoteCruise),
}));

export const quoteLoungePassRelations = relations(quoteLoungePass, ({one, many}) => ({
	passengers: many(passengers),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteLoungePass.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	quoteTable: one(quoteTable, {
		fields: [quoteLoungePass.quoteId],
		references: [quoteTable.id]
	}),
	airportTable: one(airportTable, {
		fields: [quoteLoungePass.airportId],
		references: [airportTable.id]
	}),
}));

export const bookingTableRelations = relations(bookingTable, ({one, many}) => ({
	passengers: many(passengers),
	bookingCruises: many(bookingCruise),
	bookingAccomodations: many(bookingAccomodation),
	bookingAirportParkings: many(bookingAirportParking),
	bookingAttractionTickets: many(bookingAttractionTicket),
	bookingCarHires: many(bookingCarHire),
	bookingFlights: many(bookingFlights),
	bookingLoungePasses: many(bookingLoungePass),
	bookingTransfers: many(bookingTransfers),
	cottagesTable: one(cottagesTable, {
		fields: [bookingTable.cottageId],
		references: [cottagesTable.id]
	}),
	lodgesTable: one(lodgesTable, {
		fields: [bookingTable.lodgeId],
		references: [lodgesTable.id]
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingTable.mainTourOperatorId],
		references: [tourOperatorTable.id]
	}),
	transaction: one(transaction, {
		fields: [bookingTable.transactionId],
		references: [transaction.id]
	}),
}));

export const taskTableRelations = relations(taskTable, ({one}) => ({
	userTable_agentId: one(userTable, {
		fields: [taskTable.agentId],
		references: [userTable.id],
		relationName: "taskTable_agentId_userTable_id"
	}),
	clientTable: one(clientTable, {
		fields: [taskTable.clientId],
		references: [clientTable.id]
	}),
	userTable_assignedById: one(userTable, {
		fields: [taskTable.assignedById],
		references: [userTable.id],
		relationName: "taskTable_assignedById_userTable_id"
	}),
	transaction: one(transaction, {
		fields: [taskTable.transactionId],
		references: [transaction.id]
	}),
}));

export const clientTableRelations = relations(clientTable, ({many}) => ({
	taskTables: many(taskTable),
	transactions: many(transaction),
}));

export const tourOperatorTableRelations = relations(tourOperatorTable, ({many}) => ({
	quoteLoungePasses: many(quoteLoungePass),
	quoteAttractionTickets: many(quoteAttractionTicket),
	quoteFlights: many(quoteFlights),
	quoteAirportParkings: many(quoteAirportParking),
	quoteCarHires: many(quoteCarHire),
	quoteTransfers: many(quoteTransfers),
	quoteTables: many(quoteTable),
	quoteAccomodations: many(quoteAccomodation),
	quoteCruises: many(quoteCruise),
	bookingCruises: many(bookingCruise),
	bookingAccomodations: many(bookingAccomodation),
	bookingAirportParkings: many(bookingAirportParking),
	bookingAttractionTickets: many(bookingAttractionTicket),
	bookingCarHires: many(bookingCarHire),
	bookingFlights: many(bookingFlights),
	bookingLoungePasses: many(bookingLoungePass),
	bookingTransfers: many(bookingTransfers),
	bookingTables: many(bookingTable),
	tourPackageCommissionTables: many(tourPackageCommissionTable),
}));

export const enquiryAccomodationRelations = relations(enquiryAccomodation, ({one}) => ({
	accomodationListTable: one(accomodationListTable, {
		fields: [enquiryAccomodation.accomodationId],
		references: [accomodationListTable.id]
	}),
	enquiryTable: one(enquiryTable, {
		fields: [enquiryAccomodation.enquiryId],
		references: [enquiryTable.id]
	}),
}));

export const quoteAttractionTicketRelations = relations(quoteAttractionTicket, ({one}) => ({
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteAttractionTicket.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	quoteTable: one(quoteTable, {
		fields: [quoteAttractionTicket.quoteId],
		references: [quoteTable.id]
	}),
}));

export const quoteFlightsRelations = relations(quoteFlights, ({one}) => ({
	airportTable_departingAirportId: one(airportTable, {
		fields: [quoteFlights.departingAirportId],
		references: [airportTable.id],
		relationName: "quoteFlights_departingAirportId_airportTable_id"
	}),
	airportTable_arrivalAirportId: one(airportTable, {
		fields: [quoteFlights.arrivalAirportId],
		references: [airportTable.id],
		relationName: "quoteFlights_arrivalAirportId_airportTable_id"
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteFlights.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	quoteTable: one(quoteTable, {
		fields: [quoteFlights.quoteId],
		references: [quoteTable.id]
	}),
}));

export const quoteAirportParkingRelations = relations(quoteAirportParking, ({one}) => ({
	airportTable: one(airportTable, {
		fields: [quoteAirportParking.airportId],
		references: [airportTable.id]
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteAirportParking.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	quoteTable: one(quoteTable, {
		fields: [quoteAirportParking.quoteId],
		references: [quoteTable.id]
	}),
}));

export const quoteCarHireRelations = relations(quoteCarHire, ({one}) => ({
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteCarHire.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	quoteTable: one(quoteTable, {
		fields: [quoteCarHire.quoteId],
		references: [quoteTable.id]
	}),
}));

export const quoteTransfersRelations = relations(quoteTransfers, ({one}) => ({
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteTransfers.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	quoteTable: one(quoteTable, {
		fields: [quoteTransfers.quoteId],
		references: [quoteTable.id]
	}),
}));

export const lodgesTableRelations = relations(lodgesTable, ({one, many}) => ({
	parkTable: one(parkTable, {
		fields: [lodgesTable.parkId],
		references: [parkTable.id]
	}),
	quoteTables: many(quoteTable),
	bookingTables: many(bookingTable),
}));

export const parkTableRelations = relations(parkTable, ({many}) => ({
	lodgesTables: many(lodgesTable),
}));

export const cruiseVoyageTableRelations = relations(cruiseVoyageTable, ({one}) => ({
	cruiseItenaryTable: one(cruiseItenaryTable, {
		fields: [cruiseVoyageTable.itineraryId],
		references: [cruiseItenaryTable.id]
	}),
}));

export const cruiseItenaryTableRelations = relations(cruiseItenaryTable, ({one, many}) => ({
	cruiseVoyageTables: many(cruiseVoyageTable),
	shipTable: one(shipTable, {
		fields: [cruiseItenaryTable.shipId],
		references: [shipTable.id]
	}),
}));

export const cottagesTableRelations = relations(cottagesTable, ({many}) => ({
	quoteTables: many(quoteTable),
	bookingTables: many(bookingTable),
}));

export const quoteCruiseItemExtraRelations = relations(quoteCruiseItemExtra, ({one}) => ({
	cruiseExtraItemTable: one(cruiseExtraItemTable, {
		fields: [quoteCruiseItemExtra.cruiseExtraId],
		references: [cruiseExtraItemTable.id]
	}),
	quoteCruise: one(quoteCruise, {
		fields: [quoteCruiseItemExtra.quoteCruiseId],
		references: [quoteCruise.id]
	}),
}));

export const cruiseExtraItemTableRelations = relations(cruiseExtraItemTable, ({many}) => ({
	quoteCruiseItemExtras: many(quoteCruiseItemExtra),
	bookingCruiseItemExtras: many(bookingCruiseItemExtra),
}));

export const quoteCruiseRelations = relations(quoteCruise, ({one, many}) => ({
	quoteCruiseItemExtras: many(quoteCruiseItemExtra),
	quoteCruiseItineraries: many(quoteCruiseItinerary),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteCruise.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	quoteTable: one(quoteTable, {
		fields: [quoteCruise.quoteId],
		references: [quoteTable.id]
	}),
}));

export const quoteCruiseItineraryRelations = relations(quoteCruiseItinerary, ({one}) => ({
	quoteCruise: one(quoteCruise, {
		fields: [quoteCruiseItinerary.quoteCruiseId],
		references: [quoteCruise.id]
	}),
}));

export const quoteAccomodationRelations = relations(quoteAccomodation, ({one}) => ({
	tourOperatorTable: one(tourOperatorTable, {
		fields: [quoteAccomodation.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	accomodationListTable: one(accomodationListTable, {
		fields: [quoteAccomodation.accomodationId],
		references: [accomodationListTable.id]
	}),
	quoteTable: one(quoteTable, {
		fields: [quoteAccomodation.quoteId],
		references: [quoteTable.id]
	}),
	boardBasi: one(boardBasis, {
		fields: [quoteAccomodation.boardBasisId],
		references: [boardBasis.id]
	}),
}));

export const enquiryResortsRelations = relations(enquiryResorts, ({one}) => ({
	resortsTable: one(resortsTable, {
		fields: [enquiryResorts.resortsId],
		references: [resortsTable.id]
	}),
	enquiryTable: one(enquiryTable, {
		fields: [enquiryResorts.enquiryId],
		references: [enquiryTable.id]
	}),
}));

export const bookingCruiseRelations = relations(bookingCruise, ({one, many}) => ({
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingCruise.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	bookingTable: one(bookingTable, {
		fields: [bookingCruise.bookingId],
		references: [bookingTable.id]
	}),
	bookingCruiseItemExtras: many(bookingCruiseItemExtra),
	bookingCruiseItineraries: many(bookingCruiseItinerary),
}));

export const packageTypeTableRelations = relations(packageTypeTable, ({many}) => ({
	transactions: many(transaction),
	tourPackageCommissionTables: many(tourPackageCommissionTable),
}));

export const bookingAccomodationRelations = relations(bookingAccomodation, ({one}) => ({
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingAccomodation.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	boardBasi: one(boardBasis, {
		fields: [bookingAccomodation.boardBasisId],
		references: [boardBasis.id]
	}),
	accomodationListTable: one(accomodationListTable, {
		fields: [bookingAccomodation.accomodationId],
		references: [accomodationListTable.id]
	}),
	bookingTable: one(bookingTable, {
		fields: [bookingAccomodation.bookingId],
		references: [bookingTable.id]
	}),
}));

export const bookingAirportParkingRelations = relations(bookingAirportParking, ({one}) => ({
	bookingTable: one(bookingTable, {
		fields: [bookingAirportParking.bookingId],
		references: [bookingTable.id]
	}),
	airportTable: one(airportTable, {
		fields: [bookingAirportParking.airportId],
		references: [airportTable.id]
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingAirportParking.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
}));

export const bookingAttractionTicketRelations = relations(bookingAttractionTicket, ({one}) => ({
	bookingTable: one(bookingTable, {
		fields: [bookingAttractionTicket.bookingId],
		references: [bookingTable.id]
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingAttractionTicket.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
}));

export const bookingCarHireRelations = relations(bookingCarHire, ({one}) => ({
	bookingTable: one(bookingTable, {
		fields: [bookingCarHire.bookingId],
		references: [bookingTable.id]
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingCarHire.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
}));

export const bookingCruiseItemExtraRelations = relations(bookingCruiseItemExtra, ({one}) => ({
	cruiseExtraItemTable: one(cruiseExtraItemTable, {
		fields: [bookingCruiseItemExtra.cruiseExtraId],
		references: [cruiseExtraItemTable.id]
	}),
	bookingCruise: one(bookingCruise, {
		fields: [bookingCruiseItemExtra.bookingCruiseId],
		references: [bookingCruise.id]
	}),
}));

export const bookingCruiseItineraryRelations = relations(bookingCruiseItinerary, ({one}) => ({
	bookingCruise: one(bookingCruise, {
		fields: [bookingCruiseItinerary.bookingCruiseId],
		references: [bookingCruise.id]
	}),
}));

export const bookingFlightsRelations = relations(bookingFlights, ({one}) => ({
	bookingTable: one(bookingTable, {
		fields: [bookingFlights.bookingId],
		references: [bookingTable.id]
	}),
	airportTable_departingAirportId: one(airportTable, {
		fields: [bookingFlights.departingAirportId],
		references: [airportTable.id],
		relationName: "bookingFlights_departingAirportId_airportTable_id"
	}),
	airportTable_arrivalAirportId: one(airportTable, {
		fields: [bookingFlights.arrivalAirportId],
		references: [airportTable.id],
		relationName: "bookingFlights_arrivalAirportId_airportTable_id"
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingFlights.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
}));

export const bookingLoungePassRelations = relations(bookingLoungePass, ({one}) => ({
	bookingTable: one(bookingTable, {
		fields: [bookingLoungePass.bookingId],
		references: [bookingTable.id]
	}),
	airportTable: one(airportTable, {
		fields: [bookingLoungePass.airportId],
		references: [airportTable.id]
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingLoungePass.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
}));

export const bookingTransfersRelations = relations(bookingTransfers, ({one}) => ({
	tourOperatorTable: one(tourOperatorTable, {
		fields: [bookingTransfers.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
	bookingTable: one(bookingTable, {
		fields: [bookingTransfers.bookingId],
		references: [bookingTable.id]
	}),
}));

export const notificationTokenRelations = relations(notificationToken, ({one}) => ({
	userTable: one(userTable, {
		fields: [notificationToken.userId],
		references: [userTable.id]
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	userTable: one(userTable, {
		fields: [notification.userId],
		references: [userTable.id]
	}),
}));

export const tourPackageCommissionTableRelations = relations(tourPackageCommissionTable, ({one}) => ({
	packageTypeTable: one(packageTypeTable, {
		fields: [tourPackageCommissionTable.packageTypeId],
		references: [packageTypeTable.id]
	}),
	tourOperatorTable: one(tourOperatorTable, {
		fields: [tourPackageCommissionTable.tourOperatorId],
		references: [tourOperatorTable.id]
	}),
}));