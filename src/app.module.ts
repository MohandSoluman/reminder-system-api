import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import * as dotenv from 'dotenv';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { NotificationPreference } from './notifications/entities/notification-preference.entity';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

dotenv.config();

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: Number(process.env['REDIS_PORT']),
        maxRetriesPerRequest: 100,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env['DB_HOST'] || '127.0.0.1',
      username: process.env['MYSQL_USER'] || 'root',
      port: Number(process.env['DB_PORT']) || 3306,
      password: process.env['MYSQL_ROOT_PASSWORD'] || 'password',
      database: process.env['MYSQL_DATABASE'] || 'reminderDB',
      entities: [User, Task, NotificationPreference],
      synchronize: process.env['NODE_ENV'] !== 'production',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    TasksModule,
    NotificationsModule,
  ],
})
export class AppModule {}
