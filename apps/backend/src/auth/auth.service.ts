import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (exists) throw new ConflictException('Email ou username déjà utilisé');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        promotion: dto.promotion,
        passwordHash,
      },
    });

    return this.signTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Identifiants invalides');
    if (user.isBanned) throw new UnauthorizedException('Compte suspendu');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    return this.signTokens(user);
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }] },
    });

    if (!user) {
      const username = googleUser.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      const uniqueUsername = await this.ensureUniqueUsername(username);
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          username: uniqueUsername,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          promotion: 'ISE',
          googleId: googleUser.googleId,
          avatarUrl: googleUser.avatarUrl,
          emailVerified: true,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId, avatarUrl: googleUser.avatarUrl },
      });
    }

    if (user.isBanned) throw new UnauthorizedException('Compte suspendu');
    return this.signTokens(user);
  }

  private async ensureUniqueUsername(base: string): Promise<string> {
    let username = base;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${base}${counter++}`;
    }
    return username;
  }

  private signTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '1d',
    });
    const { passwordHash, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }
}
