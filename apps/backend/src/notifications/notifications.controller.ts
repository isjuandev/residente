import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user";
import { RegisterDeviceDto } from "./dto/register-device.dto";
import { SendNotificationDto } from "./dto/send-notification.dto";
import { NotificationsService } from "./notifications.service";

type RequestWithUser = Request & { user: AuthenticatedUser };

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("devices")
  @UseGuards(JwtAuthGuard)
  registerDevice(@Body() dto: RegisterDeviceDto, @Req() request: RequestWithUser) {
    return this.notificationsService.registerDevice({
      userId: request.user.id,
      token: dto.token,
      platform: dto.platform,
      userAgent: dto.userAgent
    });
  }

  @Post("users/:userId")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  sendToUser(@Param("userId") userId: string, @Body() dto: SendNotificationDto) {
    return this.notificationsService.sendToUser(userId, dto);
  }

  @Post("broadcast")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  broadcast(@Body() dto: SendNotificationDto) {
    return this.notificationsService.broadcast(dto);
  }
}
