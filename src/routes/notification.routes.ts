import { notificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/authChecker";
import { Router } from "express";





const router = Router();

router.use(authMiddleware);


router.get('/:user_id', notificationController.fetchNotifications);
router.get('/unread/count/:user_id', notificationController.countUnreadNotifications);
router.patch('/read/:id', notificationController.markAsRead);
router.delete('/clear/:user_id', notificationController.clearAllNotifications);

export default router;