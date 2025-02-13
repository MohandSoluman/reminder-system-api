import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import * as dotenv from 'dotenv';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env['DB_HOST'] || '127.0.0.1',
      username: process.env['MYSQL_USER'] || 'root',
      port: Number(process.env['DB_PORT']) || 3306,
      password: process.env['MYSQL_ROOT_PASSWORD'] || 'password',
      database: process.env['MYSQL_DATABASE'] || 'reminder_system_api',
      entities: [User, Task],
      synchronize:
        process.env['NODE_ENV'] === 'development' ||
        process.env['NODE_ENV'] !== 'production', // Auto-sync in dev
    }),
    UsersModule,
    AuthModule,
    TasksModule,
    NotificationsModule,
  ],
})
export class AppModule {}
