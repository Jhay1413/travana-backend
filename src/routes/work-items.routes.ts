import { Router } from 'express';
import { workItemsController } from '../controllers/work-items.controller';

const router = Router();

// Combined work items endpoints
router.get('/', workItemsController.fetchWorkItems);
router.get('/stats', workItemsController.fetchWorkItemsStats);

export default router;
