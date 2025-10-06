// filepath: /my-express-firebase-app/src/services/firebase.service.ts
import * as admin from 'firebase-admin';

// Initialize Firebase Admin with environment variables
const firebaseConfig = {
  type: process.env.FIREBASE_TYPE!,
  project_id: process.env.FIREBASE_PROJECT_ID!,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
  private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL!,
  client_id: process.env.FIREBASE_CLIENT_ID!,
  auth_uri: process.env.FIREBASE_AUTH_URI!,
  token_uri: process.env.FIREBASE_TOKEN_URI!,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL!,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN!,
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
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
