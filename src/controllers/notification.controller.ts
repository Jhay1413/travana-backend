import { notificationRepo } from "../repository/notification.repo";
import { notificationService } from "../service/notification.service";


const service = notificationService(notificationRepo);


export const notificationController = {
    fetchNotifications: async (req: any, res: any) => {
        try {
            const { user_id } = req.params;
            const { isRead } = req.query;
            const isReadBool = isRead === 'true' ? true : isRead === 'false' ? false : undefined;

            if (!user_id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const notifications = await service.fetchNotifications(user_id, isReadBool);
            return res.status(200).json(notifications);
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    countUnreadNotifications: async (req: any, res: any) => {
        try {
            const { user_id } = req.params;
            if (!user_id) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            const count = await service.countUnreadNotifications(user_id);
            return res.status(200).json({ count });
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    markAsRead: async (req: any, res: any) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'Notification ID is required' });
            }
            await service.readNotification(id);
            return res.status(200).json({ message: 'Notification marked as read' });
        }
        catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    clearAllNotifications: async (req: any, res: any) => {
        try {
            const { user_id } = req.params;
            if (!user_id) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            await service.clearAllNotifications(user_id);
            return res.status(200).json({ message: 'All notifications cleared' });
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    }
}