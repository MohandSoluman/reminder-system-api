import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FcmProvider {
  constructor() {
    const serviceAccountPath = path.resolve(
      __dirname,
      'serviceAccountKey.json',
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
    const serviceAccount = require(serviceAccountPath);

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
