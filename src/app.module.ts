import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
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
      entities: [User],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
