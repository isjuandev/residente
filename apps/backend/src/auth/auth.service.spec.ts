import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const now = new Date("2026-01-01T00:00:00.000Z");
const user = {
  id: "user-1",
  email: "student@residente.app",
  passwordHash: "hash",
  role: Role.STUDENT,
  createdAt: now,
  updatedAt: now
};

function createService() {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn()
    }
  };
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  };
  const configService = {
    get: jest.fn((key: string) => {
      if (key === "JWT_ACCESS_SECRET") return "access-secret";
      if (key === "JWT_REFRESH_SECRET") return "refresh-secret";
      return undefined;
    })
  };

  return {
    service: new AuthService(prisma as never, jwtService as never, configService as never),
    prisma,
    jwtService,
    configService
  };
}

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(bcrypt.hash).mockResolvedValue("hashed-value" as never);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
  });

  it("registers a new user and returns tokens with public user", async () => {
    const { service, prisma, jwtService } = createService();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);
    jwtService.signAsync
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const result = await service.register({
      email: " Student@Residente.App ",
      password: "password123"
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "student@residente.app" }
    });
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "student@residente.app",
        passwordHash: "hashed-value",
        role: Role.STUDENT
      }
    });
    expect(prisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: user.id,
          tokenHash: "hashed-value"
        })
      })
    );
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  });

  it("rejects duplicate registration", async () => {
    const { service, prisma } = createService();
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.register({ email: user.email, password: "password123" })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("logs in with valid credentials", async () => {
    const { service, prisma, jwtService } = createService();
    prisma.user.findUnique.mockResolvedValue(user);
    jwtService.signAsync
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const result = await service.login({
      email: user.email,
      password: "password123"
    });

    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hash");
    expect(result.accessToken).toBe("access-token");
  });

  it("rejects login with invalid password", async () => {
    const { service, prisma } = createService();
    prisma.user.findUnique.mockResolvedValue(user);
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({ email: user.email, password: "wrongpass" })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("refreshes a valid refresh token", async () => {
    const { service, prisma, jwtService } = createService();
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      tokenId: "token-1",
      type: "refresh"
    });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: "token-1",
      userId: user.id,
      tokenHash: "refresh-hash",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user
    });
    jwtService.signAsync.mockResolvedValue("new-access-token");

    await expect(service.refresh("refresh-token")).resolves.toEqual({
      accessToken: "new-access-token"
    });
  });

  it("rejects an expired refresh token", async () => {
    const { service, prisma, jwtService } = createService();
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      tokenId: "token-1",
      type: "refresh"
    });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: "token-1",
      userId: user.id,
      tokenHash: "refresh-hash",
      revokedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
      user
    });

    await expect(service.refresh("refresh-token")).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it("returns current user without password hash", async () => {
    const { service, prisma } = createService();
    prisma.user.findUnique.mockResolvedValue({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

    await expect(service.getMe(user.id)).resolves.toEqual({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  });
});
