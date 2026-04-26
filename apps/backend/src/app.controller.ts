import { Controller, Get } from "@nestjs/common";
import type { HealthStatus } from "@residente/shared";

@Controller("health")
export class AppController {
  @Get()
  health(): HealthStatus {
    return {
      ok: true,
      service: "backend"
    };
  }
}
