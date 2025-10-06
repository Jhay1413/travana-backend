import { Router } from 'express';
import { taskController } from '../controllers/task.controller';

const router = Router();

// Basic CRUD operations
router.post('/', taskController.insertTask);
router.put('/:id', taskController.updateTask);
router.get('/:id', taskController.fetchTaskById);
router.delete('/:id', taskController.deleteTaskById);

// Task status operations
router.patch('/:id/status', taskController.updateTaskStatus);

// Fetch operations by different criteria
router.get('/agent/:agent_id', taskController.fetchTaskByAgent);
router.get('/client/:client_id', taskController.fetchTaskByClient);
router.get('/transaction/:transaction_id', taskController.fetchTaskByTransaction);
router.get('/scheduled/:id', taskController.fetchScheduledTasks);

// Task management operations
router.get('/created/list', taskController.fetchCreatedTasks);
router.get('/created/infinite', taskController.fetchCreatedTaskInfinite);
router.get('/pending/count/:agent_id', taskController.fetchNumberOfPendingTasks);

export default router;
