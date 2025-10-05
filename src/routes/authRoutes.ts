import { authController } from '../controllers/auth.controller';
import { Router } from 'express';

const router = Router();


router.post('/invitation', authController.createInvitation);
router.post('/accept-invitation/:invitationId', authController.acceptInvitation);


export default router;
