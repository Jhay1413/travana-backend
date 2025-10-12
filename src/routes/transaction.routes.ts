import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';

const router = Router();

// Quote-related endpoints
router.get('/quotes/expired', transactionController.fetchExpiredQuotes);
router.get('/quotes/status', transactionController.fetchQuotesByStatus);

// Note management endpoints
router.post('/notes', transactionController.insertNote);
router.put('/notes/:note_id', transactionController.updateNote);
router.get('/notes/:transaction_id', transactionController.fetchNotes);
router.get('/note/:id', transactionController.fetchNoteById);
router.delete('/note/:note_id', transactionController.deleteNote);

// Transaction management endpoints
router.put('/reassign/:transaction_id', transactionController.reassignTransaction);
router.patch('/lead-source/:transaction_id', transactionController.updateLeadSource);

// Data fetching endpoints
router.get('/destinations', transactionController.fetchDestination);
router.get('/ports', transactionController.fetchPort);
router.get('/airports', transactionController.fetchAirport);
router.get('/board-basis', transactionController.fetchBoardBasis);
router.get('/cruise-lines', transactionController.fetchCruiseLine);
router.get('/countries', transactionController.fetchCountry);
router.get('/accommodations', transactionController.fetchAccomodation);
router.get('/resorts', transactionController.fetchResorts);
router.get('/accommodation-types', transactionController.fetchAccomodationType);
router.get('/cruise-destinations', transactionController.fetchCruiseDestination);
router.get('/tour-operators', transactionController.fetchTourOperator);
router.get('/package-types', transactionController.fetchPackageType);
router.get('/room-types', transactionController.fetchRoomTypes);
// Lodge management endpoints
router.get('/lodges', transactionController.fetchLodges);
router.post('/lodges', transactionController.insertLodge);
router.put('/lodges/:lodge_id', transactionController.updateLodge);
router.delete('/lodges/:lodge_id', transactionController.deleteLodge);

// Cruise-related endpoints
router.get('/cruise-dates', transactionController.fetchCruiseDate);
router.get('/cruises', transactionController.fetchCruises);
router.get('/ships', transactionController.fetchShips);
router.get('/cruise-extras', transactionController.fetchCruiseExtras);

// Kanban and dashboard endpointsp
router.get('/kanban/inquiries', transactionController.fetchKanbanInquries);
router.get('/bookings', transactionController.fetchBookings);
router.get('/summary/agent/:agent_id', transactionController.fetchTransactionSummaryByAgent);
router.get('/future-deals/kanban', transactionController.fetchFutureDealsKanban);
router.get('/future-deals/:client_id', transactionController.fetchFutureDeal);
router.get('/all-deals/:client_id', transactionController.fetchAllDeals);
router.get('/dashboard/summary', transactionController.fetchDashboardSummary);
router.post('/destinations', transactionController.insertDestination);
router.post('/resorts', transactionController.insertResort);
router.post('/accommodations', transactionController.insertAccomodation);
router.post('/countries', transactionController.insertCountry);

// Data Management endpoints
// Headlines
router.post('/data-management/headlines', transactionController.insertHeadline);
router.get('/data-management/headlines', transactionController.fetchAllHeadlines);
router.get('/data-management/headlines/:id', transactionController.fetchHeadlineById);
router.put('/data-management/headlines/:id', transactionController.updateHeadline);
router.delete('/data-management/headlines/:id', transactionController.deleteHeadline);

// Tour Operators
router.get('/data-management/tour-operators', transactionController.fetchTourOperators);
router.get('/data-management/tour-operators/:id', transactionController.fetchTourOperatorById);
router.post('/data-management/tour-operators', transactionController.insertTourOperator);
router.put('/data-management/tour-operators/:id', transactionController.updateTourOperator);

// Accommodations
router.get('/data-management/accommodations/:id', transactionController.fetchAccomodationById);
router.put('/data-management/accommodations/:id', transactionController.updateAccomodation);

// Cruise Itineraries
router.post('/data-management/cruise-itineraries', transactionController.insertCruiseItinerary);
router.put('/data-management/cruise-itineraries/:id', transactionController.updateCruiseItinerary);
router.get('/data-management/cruise-itineraries', transactionController.fetchAllCruiseItineraries);
router.get('/data-management/cruise-itineraries/:id', transactionController.fetchCruiseItineraryById);
router.delete('/data-management/cruise-itineraries/:id', transactionController.deleteCruiseItinerary);

// Cruise Voyages
router.post('/data-management/cruise-voyages', transactionController.insertCruiseVoyage);
router.put('/data-management/cruise-voyages/:id', transactionController.updateCruiseVoyage);
router.get('/data-management/cruise-voyages', transactionController.fetchAllCruiseVoyages);
router.get('/data-management/cruise-voyages/:id', transactionController.fetchCruiseVoyageById);
router.delete('/data-management/cruise-voyages/:id', transactionController.deleteCruiseVoyage);

// Room Types
router.get('/data-management/room-types', transactionController.fetchAllRoomTypes);
router.post('/data-management/room-types', transactionController.insertRoomType);
router.put('/data-management/room-types/:id', transactionController.updateRoomType);
router.delete('/data-management/room-types/:id', transactionController.deleteRoomType);

// Airports
router.get('/data-management/airports', transactionController.fetchAllAirports);
router.post('/data-management/airports', transactionController.insertAirport);
router.put('/data-management/airports/:id', transactionController.updateAirport);
router.get('/data-management/airports/:id', transactionController.fetchAirportById);
router.delete('/data-management/airports/:id', transactionController.deleteAirport);

// Countries
router.get('/data-management/countries/:id', transactionController.fetchCountryById);
router.put('/data-management/countries/:id', transactionController.updateCountry);
router.delete('/data-management/countries/:id', transactionController.deleteCountry);

// Lodges
router.get('/data-management/lodges', transactionController.fetchAllLodges);
router.get('/data-management/lodges/:id', transactionController.fetchLodgeById);

// Parks
router.get('/data-management/parks', transactionController.fetchAllParks);

// Deletion Codes
router.post('/data-management/deletion-codes/generate', transactionController.generateDeletionCodes);
router.post('/data-management/deletion-codes', transactionController.insertDeletionCode);
router.put('/data-management/deletion-codes/:id', transactionController.updateDeletionCode);
router.delete('/data-management/deletion-codes/:id', transactionController.deleteDeletionCode);
router.get('/data-management/deletion-codes', transactionController.fetchAllDeletionCodes);
router.get('/data-management/deletion-codes/:id', transactionController.fetchDeletionCodeById);

// Cruise Lines
router.post('/data-management/cruise-lines', transactionController.insertCruiseLine);
router.put('/data-management/cruise-lines/:id', transactionController.updateCruiseLine);
router.get('/data-management/cruise-lines', transactionController.fetchAllCruiseLines);
router.get('/data-management/cruise-lines/:id', transactionController.fetchCruiseLineById);
router.delete('/data-management/cruise-lines/:id', transactionController.deleteCruiseLine);

// Cruise Ships
router.post('/data-management/cruise-ships', transactionController.insertCruiseShip);
router.put('/data-management/cruise-ships/:id', transactionController.updateCruiseShip);
router.get('/data-management/cruise-ships', transactionController.fetchAllCruiseShips);
router.get('/data-management/cruise-ships/:id', transactionController.fetchCruiseShipById);
router.delete('/data-management/cruise-ships/:id', transactionController.deleteCruiseShip);

// Cruise Destinations
router.post('/data-management/cruise-destinations', transactionController.insertCruiseDestination);
router.put('/data-management/cruise-destinations/:id', transactionController.updateCruiseDestination);
router.get('/data-management/cruise-destinations', transactionController.fetchAllCruiseDestinations);
router.get('/data-management/cruise-destinations/:id', transactionController.fetchCruiseDestinationById);
router.delete('/data-management/cruise-destinations/:id', transactionController.deleteCruiseDestination);

// Ports
router.post('/data-management/ports', transactionController.insertPort);
router.put('/data-management/ports/:id', transactionController.updatePort);
router.get('/data-management/ports', transactionController.fetchAllPorts);
router.get('/data-management/ports/:id', transactionController.fetchPortById);
router.delete('/data-management/ports/:id', transactionController.deletePort);

// Destinations
router.put('/data-management/destinations/:id', transactionController.updateDestination);
router.get('/data-management/destinations/:id', transactionController.fetchDestinationById);

// Resorts
router.put('/data-management/resorts/:id', transactionController.updateResort);
router.get('/data-management/resorts/:id', transactionController.fetchResortById);

export default router;
