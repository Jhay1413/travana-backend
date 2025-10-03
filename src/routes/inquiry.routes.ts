import { Router } from 'express';
import { inquiryController } from '../controllers/inquiry.controller';


const router = Router();


// Basic CRUD operations
router.get('/', inquiryController.fetchInquiries);
router.post('/', inquiryController.createInquiry);
router.get('/:id', inquiryController.fetchInquiryById);
router.put('/:id', inquiryController.updateInquiry);
router.delete('/:id', inquiryController.deleteInquiry);

// Specialized fetch operations with query parameters
router.get('/:id/for-update', inquiryController.fetchInquiryForUpdate);
router.get('/:id/to-convert', inquiryController.fetchInquiryToConvert);
router.get('/deleted', inquiryController.getDeletedInquiries);

// Partial update operations using PATCH
router.patch('/:id/expiry', inquiryController.updateInquiryExpiry);
router.patch('/:id/future-deal-date', inquiryController.updateFutureDealDate);
router.patch('/:id/status', inquiryController.updateInquiryStatus);
// Restore operation
router.patch('/:id/restore', inquiryController.restoreInquiry);


export default router;