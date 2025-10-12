import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

router.get('/rooms/:userId', chatController.getRooms);

router.get('/rooms/room/:id', chatController.getRoom);

router.get('/rooms/:id/messages', chatController.getMessages);

router.post('/rooms/:id/messages', chatController.sendMessage);

router.post('/rooms', chatController.createRoom);

router.post('/rooms/:roomId/join', chatController.joinRoom);

router.delete('/rooms/:roomId/leave', chatController.leaveRoom);

router.put('/messages/:messageId/read', chatController.markMessageAsRead);

router.put('/rooms/:roomId', chatController.updateRoom);
router.put('/rooms/:roomId/mark-all-read', chatController.markAllMessageAsRead);

router.delete('/rooms/:roomId', chatController.deleteRoom);

router.get('/unread-count/:userId', chatController.countUnreadMessages);

export default router;