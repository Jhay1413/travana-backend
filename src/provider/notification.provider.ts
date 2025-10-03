import { FirebaseService } from '../infra/firebase/firebase';

export type NotificationProvider = {
  notifyUser: (message: string, tokens: string[], unread_notif: number) => Promise<void>;
};
const firebaseService = new FirebaseService();
export const notificationProvider: NotificationProvider = {
  notifyUser: async (message, tokens, unread_notif) => {
    if (!tokens || tokens.length == 0) return;

    await firebaseService.sendMessage(tokens, 'You have new Notification', message, unread_notif);
  },
};
