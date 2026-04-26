import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Role, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

const PASSWORD_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type PublicUser = Pick<User, "id" | "email" | "role" | "createdAt" | "updatedAt">;

interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  type: "refresh";
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.STUDENT
      }
    });

    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.createAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.getRefreshTokenSecret()
        }
      );
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: {
        user: true
      }
    });

    if (
      !storedToken ||
      storedToken.userId !== payload.sub ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      storedToken.tokenHash
    );

    if (!tokenMatches) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return {
      accessToken: await this.signAccessToken(storedToken.user)
    };
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }

  private async createAuthResponse(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user),
      this.createRefreshToken(user)
    ]);

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user)
    };
  }

  private async signAccessToken(user: Pick<User, "id" | "email" | "role">) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      {
        secret: this.getAccessTokenSecret(),
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
      }
    );
  }

  private async createRefreshToken(user: Pick<User, "id" | "email">) {
    const tokenId = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        tokenId,
        type: "refresh"
      },
      {
        secret: this.getRefreshTokenSecret(),
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
      }
    );

    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, PASSWORD_ROUNDS),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
      }
    });

    return refreshToken;
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private getAccessTokenSecret() {
    return (
      this.configService.get<string>("JWT_ACCESS_SECRET") ??
      this.configService.get<string>("JWT_SECRET") ??
      "change-me-access"
    );
  }

  private getRefreshTokenSecret() {
    return (
      this.configService.get<string>("JWT_REFRESH_SECRET") ??
      this.configService.get<string>("JWT_SECRET") ??
      "change-me-refresh"
    );
  }
}
