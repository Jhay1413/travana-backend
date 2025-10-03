
import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';


const router = Router();


router.get('/:agentId', agentController.fetchEnquirySummaryByAgent);



export default router;

