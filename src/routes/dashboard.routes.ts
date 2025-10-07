import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/authChecker';

const router = Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// Dashboard stats routes
router.get('/client/:clientId', dashboardController.fetchClientStats);
router.get('/agent/:agentId', dashboardController.fetchAgentStats);

// Todo routes
router.post('/todo/:agentId', dashboardController.insertTodo);
router.get('/todo/:agentId', dashboardController.fetchTodos);
router.put('/todo/:id', dashboardController.updateTodo);
router.delete('/todo/:id', dashboardController.deleteTodo);

export default router;
