import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { BillingModule } from "./billing/billing.module";
import { DiseasesModule } from "./diseases/diseases.module";
import { MediaModule } from "./media/media.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 10
      }
    ]),
    PrismaModule,
    AuthModule,
    BillingModule,
    DiseasesModule,
    MediaModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
