import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { ProGuard } from "./guards/pro.guard";

@Module({
  controllers: [BillingController],
  providers: [BillingService, ProGuard],
  exports: [BillingService, ProGuard]
})
export class BillingModule {}
