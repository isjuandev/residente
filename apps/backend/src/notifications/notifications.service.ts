import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { DevicePlatform, Prisma } from "@prisma/client";
import { Messaging } from "firebase-admin/messaging";
import { PrismaService } from "../prisma/prisma.service";
import { FCM_MESSAGING } from "./firebase-admin.provider";

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FCM_MESSAGING) private readonly messaging: Messaging | null
  ) {}

  async registerDevice(input: {
    userId: string;
    token: string;
    platform: DevicePlatform;
    userAgent?: string;
  }) {
    const device = await this.prisma.userDevice.upsert({
      where: { token: input.token },
      update: {
        userId: input.userId,
        platform: input.platform,
        userAgent: input.userAgent,
        isActive: true
      },
      create: {
        userId: input.userId,
        token: input.token,
        platform: input.platform,
        userAgent: input.userAgent
      }
    });

    return { id: device.id, registered: true };
  }

  async sendToUser(userId: string, payload: NotificationPayload) {
    const devices = await this.prisma.userDevice.findMany({
      where: { userId, isActive: true },
      select: { token: true }
    });

    return this.sendToTokens(devices.map((device) => device.token), payload);
  }

  async broadcast(payload: NotificationPayload) {
    const devices = await this.prisma.userDevice.findMany({
      where: { isActive: true },
      select: { token: true }
    });

    return this.sendToTokens(devices.map((device) => device.token), payload);
  }

  async notifyDiseasePublished(disease: { name: string; slug: string }) {
    return this.broadcast({
      title: "Nuevo algoritmo publicado",
      body: `${disease.name} ya está disponible en Residente.`,
      data: {
        type: "DISEASE_PUBLISHED",
        slug: disease.slug,
        url: `/app/diseases/${disease.slug}`
      }
    });
  }

  private async sendToTokens(tokens: string[], payload: NotificationPayload) {
    if (!tokens.length) {
      return { sent: 0, failed: 0 };
    }

    if (!this.messaging) {
      throw new ServiceUnavailableException("Firebase Cloud Messaging is not configured");
    }

    const response = await this.messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data,
      webpush: {
        fcmOptions: {
          link: payload.data?.url ?? "/app"
        }
      }
    });

    const invalidTokens = response.responses
      .map((result, index) => ({ result, token: tokens[index] }))
      .filter(({ result }) => {
        const code = result.error?.code;
        return (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        );
      })
      .map(({ token }) => token)
      .filter((token): token is string => Boolean(token));

    if (invalidTokens.length) {
      await this.prisma.userDevice.updateMany({
        where: { token: { in: invalidTokens } },
        data: { isActive: false }
      });
    }

    return {
      sent: response.successCount,
      failed: response.failureCount
    };
  }
}
