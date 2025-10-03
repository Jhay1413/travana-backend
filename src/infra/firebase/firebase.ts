// filepath: /my-express-firebase-app/src/services/firebase.service.ts
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(require('../../../service_key.json')),
});

export class FirebaseService {
  public async sendMessage(tokens: string[], title: string, body: string, unread_notif: number): Promise<void> {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        unread_notif: unread_notif.toString(),
      },
      tokens,
    };

    const messages = await admin.messaging().sendEachForMulticast(message);

    console.log('Successfully sent message:', messages);
  }
}
