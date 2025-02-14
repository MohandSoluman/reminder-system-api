import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { NotificationsService } from '../notifications.service';
import { TasksService } from '../../tasks/tasks.service';
import { forwardRef, Inject } from '@nestjs/common';

@Processor('reminders')
export class ReminderQueueProcessor {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    @InjectQueue('reminders') private readonly reminderQueue: Queue,
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
      await this.notificationsService.sendEmail(
        user.email,
        'Task Reminder',
        reminderMessage,
      );
    }
  }

  async removeJobsByTaskId(taskId: string): Promise<void> {
    const jobs = await this.reminderQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);
    for (const job of jobs) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (job.data.taskId === taskId) {
        await job.remove();
      }
    }
  }
}
