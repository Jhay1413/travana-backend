import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';

const router = Router();

// Basic CRUD operations
router.get('/', bookingController.fetchBookings);
router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.fetchBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

// Specialized fetch operations
router.get('/report', bookingController.fetchBookingReport);
router.get('/summary/agent/:agent_id', bookingController.fetchBookingSummaryByAgent);
router.get('/:id/for-update', bookingController.fetchBookingToUpdate);
router.get('/deleted', bookingController.fetchDeletedBookings);
router.get('/forward-commission', bookingController.fetchForwardCommission);

// Historical operations
router.get('/:id/historical', bookingController.fetchHistoricalBookings);
router.get('/historical/:id', bookingController.fetchHistoricalBookingById);

// Conversion and restoration
router.post('/convert/:transaction_id', bookingController.convertBooking);
router.patch('/:id/restore', bookingController.restoreBooking);

export default router;
