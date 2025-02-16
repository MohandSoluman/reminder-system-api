import { Injectable } from '@nestjs/common';
import { FcmProvider } from './providers/fcm.provider';
import { EmailProvider } from './providers/email.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { Repository } from 'typeorm';
import { UpdatePreferencesDto } from './dto/update-prefrances.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly emailProvider: EmailProvider,
    @InjectRepository(NotificationPreference)
    private readonly preferencesRepository: Repository<NotificationPreference>,
  ) {}

  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
  ): Promise<void> {
    await this.fcmProvider.sendPushNotification(deviceToken, title, body);
  }

  sendEmail(to: string, subject: string, text: string, html?: string): void {
    this.emailProvider.sendEmail(to, subject, text, html);
  }

  sendNotificationEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): void {
    this.emailProvider.sendNotificationEmail(to, subject, text, html);
  }

  async updatePreferences(userId: string, preferences: UpdatePreferencesDto) {
    let userPreferences = await this.getPreferences(userId);

    if (!userPreferences) {
      userPreferences = this.preferencesRepository.create({
        user: { id: userId },
        push_enabled: preferences.pushEnabled,
        email_enabled: preferences.emailEnabled,
        reminder_time: preferences.reminderTime,
      });
    } else {
      userPreferences.push_enabled = preferences.pushEnabled;
      userPreferences.email_enabled = preferences.emailEnabled;
      userPreferences.reminder_time = preferences.reminderTime;
    }

    await this.preferencesRepository.save(userPreferences);
    return userPreferences;
  }
  async getPreferences(userId: string) {
    return await this.preferencesRepository.findOne({
      where: { user: { id: userId } },
    });
  }
}
