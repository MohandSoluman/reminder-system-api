/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

import { UserPayload } from './interfaces/user-payload.interface';
import { SignupDto } from './dto/signup';
import { LoginDto } from './dto/login';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   * @param registerDto - User registration data (email, password, name).
   * @returns A success message and the created user.
   */
  async signup(signupDto: SignupDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = await this.usersService.create({
      ...signupDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hashedPassword,
    });
    return {
      message: 'User registered successfully',
      user: instanceToPlain(user),
    };
  }

  /**
   * Validate user credentials.
   * @param email - User's email.
   * @param password - User's password.
   * @returns The user object without the password if credentials are valid.
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Log in a user and generate a JWT token.
   * @param loginDto - User login data (email, password).
   * @returns A JWT token.
   */
  async login(loginDto: LoginDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const payload: UserPayload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
