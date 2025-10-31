import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { uploadClientFile, uploadSingle } from '../middleware/upload';
import { authMiddleware } from '../middleware/authChecker';

const router = Router();

// ✅ All client routesrequire authentication
router.use(authMiddleware);

/* ===============================
   CLIENT CRUD OPERATIONS
   =============================== */
router.get('/', clientController.fetchClients);
router.get('/:id', clientController.fetchClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

/* ===============================
   CLIENT SPECIFIC ROUTES
   =============================== */
router.get('/:id/inquiry-summary', clientController.fetchInquirySummary);
router.get('/:id/transactions', clientController.fetchClientTransactions);
router.get('/:id/for-update', clientController.fetchClientForUpdate);

/* ===============================
   CLIENT FILE ROUTES
   =============================== */
router.get('/:id/files/count', clientController.getClientFileCount);
router.get('/:id/files', clientController.fetchClientFiles);
router.get('/:id/files/:fileId', clientController.fetchClientFile);
router.post('/:id/files', uploadClientFile, clientController.uploadClientFile);
router.delete('/files/:id', clientController.deleteClientFile);


// Upload client avatar
router.post('/:id/avatar', uploadSingle, clientController.uploadClientAvatar);

// File utility route (not tied to specific client)
router.get('/files/:fileKey/signed-url', clientController.getSignedUrl);

export default router;
