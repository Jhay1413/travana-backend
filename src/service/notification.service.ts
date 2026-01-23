import { NotificationRepo } from "@/repository/notification.repo";

export const notificationService = (repo: NotificationRepo) => {

    return {
        fetchNotifications: async (user_id: string,isRead?: boolean) => {
            return await repo.fetchNotifications(user_id, isRead);
        },
        countUnreadNotifications: async (user_id: string) => {
            return await repo.countUnreadNotifications(user_id);
        },
        readNotification: async (notification_id: string) => {
        return await repo.readNotification(notification_id);
        },
        clearAllNotifications: async (user_id: string) => {
            return await repo.clearAllNotifications(user_id);
        }
    }
}