import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmProvider {
  private readonly logger = new Logger(FcmProvider.name);
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const serviceAccount = JSON.parse(
      process.env['FIREBASE_SERVICE_ACCOUNT_KEY'] as string,
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
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
      this.logger.log(`Push notification sent to ${deviceToken}`);
    } catch (error) {
      this.logger.error('Error sending push notification:', error);
    }
  }
}
