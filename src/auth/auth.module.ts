import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtStrategy } from './strategies/jwt.strategy';

import * as dotenv from 'dotenv';
import { LocalStrategy } from './strategies/local.strategy';

dotenv.config();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'any secret',
      signOptions: { expiresIn: process.env['JWT_EXPIRES'] || '1d' },
    }),
    UsersModule,
  ],

  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
