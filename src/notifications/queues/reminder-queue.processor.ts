import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../notifications.service';
import { TasksService } from '../../tasks/tasks.service';
import { forwardRef, Inject } from '@nestjs/common';

@Processor('reminders')
export class ReminderQueueProcessor {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  @Process('send-reminder')
  async handleReminder(job: Job<{ taskId: string; type: string }>) {
    const { taskId, type } = job.data;
    const task = await this.tasksService.getTaskDetails(taskId);

    if (!task) {
      // Task has been deleted, do not send notification
      return;
    }
    const { user, title } = task;
    const { push_enabled, email_enabled, reminder_time } =
      user.notificationPreferences;

    const reminderMessage =
      type === 'first'
        ? `Your task "${title}" is due in ${reminder_time} minutes.`
        : `Your task "${title}" is due now.`;

    if (push_enabled && user.device_token) {
      await this.notificationsService.sendPushNotification(
        user.device_token,
        'Task Reminder',
        reminderMessage,
      );
    }

    if (email_enabled) {
      this.notificationsService.sendNotificationEmail(
        user.email,
        'Task Reminder',
        reminderMessage,
      );
    }

    if (email_enabled) {
      this.notificationsService.sendEmail(
        user.email,
        'Task Reminder',
        reminderMessage,
      );
    }
  }
}
