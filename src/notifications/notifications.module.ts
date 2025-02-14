import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { FcmProvider } from './providers/fcm.provider';
import { EmailProvider } from './providers/email.provider';
import { ReminderQueueProcessor } from './queues/reminder-queue.processor';
import { BullModule } from '@nestjs/bull';
import { TasksModule } from 'src/tasks/tasks.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationPreference]),
    BullModule.registerQueue({
      name: 'reminders',
    }),
    forwardRef(() => TasksModule),
  ],
  controllers: [NotificationsController],
  providers: [
    ReminderQueueProcessor,
    NotificationsService,
    FcmProvider,
    EmailProvider,
  ],
  exports: [ReminderQueueProcessor, NotificationsService],
})
export class NotificationsModule {}
