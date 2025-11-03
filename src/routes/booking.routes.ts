import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';

const router = Router();

// Basic CRUD operations
router.get('/', bookingController.fetchBookings);
router.post('/', bookingController.createBooking);



router.put('/:id/adjust-forward', bookingController.updateForwardAdjustment);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

// Specialized fetch operations
router.get('/report', bookingController.fetchBookingReport);
router.get('/summary/agent/:agent_id', bookingController.fetchBookingSummaryByAgent);
router.get('/forwards/data', bookingController.fetchForwardCommission);
router.get('/deleted', bookingController.fetchDeletedBookings);
router.get('/historical/:id', bookingController.fetchHistoricalBookingById);
router.get('/period/:periodId', bookingController.getBookingByPeriod);
// Parameterized routes (most specific to least specific)
router.get('/:id/historical', bookingController.fetchHistoricalBookings);
router.get('/:id/for-update', bookingController.fetchBookingToUpdate);
router.get('/:id', bookingController.fetchBookingById);

// Conversion and restoration
router.post('/convert/:transaction_id', bookingController.convertBooking);
router.post('/generate-forwards-report', bookingController.generateForwardsReport);
router.patch('/:id/restore', bookingController.restoreBooking);

export default router;
