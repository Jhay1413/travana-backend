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
router.post('/accomodations', transactionController.insertAccomodation);
router.post('/countries', transactionController.insertCountry);


export default router;
