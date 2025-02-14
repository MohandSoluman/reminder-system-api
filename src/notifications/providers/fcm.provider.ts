import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmProvider {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const serviceAccount = JSON.parse(
      process.env['FIREBASE_SERVICE_ACCOUNT_KEY'] as string,
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
  ): Promise<void> {
    const message = {
      notification: { title, body },
      token: deviceToken,
    };

    try {
      await admin.messaging().send(message);
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
