//src/modules/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../../database/entities/users.entity';
import { AuthProvider } from '../../common/enums/auth-provider.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload, RefreshTokenPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingByEmail = await this.usersService.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException('Email is already in use');
    }

    const existingByLogin = await this.usersService.findByLogin(dto.login);
    if (existingByLogin) {
      throw new ConflictException('Login is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      login: dto.login,
      passwordHash,
      authProvider: AuthProvider.LOCAL,
      role: UserRole.USER,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailOrLogin(dto.loginOrEmail);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account does not support password login',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        dto.refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  async loginWithGoogle(googleUser: {
    email?: string;
    googleId: string;
    displayName?: string;
  }) {
    if (!googleUser.email) {
      throw new BadRequestException('Google account email is required');
    }

    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(googleUser.email);

      if (user) {
        user.googleId = googleUser.googleId;

        if (user.authProvider === AuthProvider.LOCAL) {
          user.authProvider = AuthProvider.LOCAL_GOOGLE;
        }

        user = await this.usersService.save(user);
      } else {
        const generatedLogin = await this.generateUniqueLogin(
          googleUser.email,
          googleUser.displayName,
        );

        user = await this.usersService.create({
          email: googleUser.email,
          login: generatedLogin,
          passwordHash: null,
          googleId: googleUser.googleId,
          authProvider: AuthProvider.GOOGLE,
          role: UserRole.USER,
        });
      }
    }

    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      login: user.login,
      role: user.role,
      authProvider: user.authProvider,
    };

    const refreshPayload: RefreshTokenPayload = {
      ...payload,
      tokenType: 'refresh',
    };

    const accessToken = await this.jwtService.signAsync(
      payload as Record<string, unknown>,
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      refreshPayload as Record<string, unknown>,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
      },
    );

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      login: user.login,
      authProvider: user.authProvider,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async generateUniqueLogin(
    email: string,
    displayName?: string,
  ): Promise<string> {
    const baseFromName =
      displayName
        ?.toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '') || '';

    const baseFromEmail = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    const base = (baseFromName || baseFromEmail || 'user').slice(0, 20);

    let candidate = base;
    let counter = 1;

    while (await this.usersService.findByLogin(candidate)) {
      candidate = `${base}_${counter}`;
      counter += 1;
    }

    return candidate;
  }
}
