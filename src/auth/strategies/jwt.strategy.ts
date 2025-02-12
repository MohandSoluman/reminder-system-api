/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserPayload } from '../interfaces/user-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env['JWT_ACCESS_SECRET'],
    });
  }

  validate(payload: UserPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { email, sub } = payload;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { email: email, sub: sub };
  }
}
