import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { DiseasesController } from "./diseases.controller";
import { DiseasesService } from "./diseases.service";

@Module({
  imports: [NotificationsModule],
  controllers: [DiseasesController],
  providers: [DiseasesService]
})
export class DiseasesModule {}
