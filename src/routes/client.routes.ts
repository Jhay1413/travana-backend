import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { uploadSingle } from '../middleware/upload';
import { authMiddleware } from '../middleware/authChecker';

const router = Router();

// All client routes require authentication
router.use(authMiddleware);

// Client CRUD operations
router.get('/:id', clientController.fetchClientById);
router.get('/', clientController.fetchClients);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Client specific routes

router.get('/:id/inquiry-summary', clientController.fetchInquirySummary);
router.get('/:id/transactions', clientController.fetchClientTransactions);
router.get('/:id/for-update', clientController.fetchClientForUpdate);
router.get('/:fileKey/signed-url', clientController.getSignedUrl);

// File upload route with multer middleware
router.post('/:id/avatar', uploadSingle, clientController.uploadClientAvatar);

export default router;
