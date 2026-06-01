import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const code = this.generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        verificationCode: code,
        verificationCodeExpires: expires,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        createdAt: true,
      },
    });

    await this.mail.sendVerificationCode(dto.email, code);

    return {
      message: 'Account created. Check your email for verification code.',
      user,
    };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new NotFoundException('User not found');

    if (
      user.verificationCode !== dto.code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return { message: 'Account verified successfully. You can now log in.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your account before logging in');
    }

    const token = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '7d'),
      },
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
