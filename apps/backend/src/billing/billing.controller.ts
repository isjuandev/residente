import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user";
import { BillingService } from "./billing.service";
import { CheckoutDto, VerifyReceiptDto } from "./dto/checkout.dto";

type RequestWithUser = Request & { user: AuthenticatedUser };

@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get("status")
  @UseGuards(JwtAuthGuard)
  status(@Req() request: RequestWithUser) {
    return this.billing.status(request.user.id);
  }

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  checkout(@Req() request: RequestWithUser, @Body() dto: CheckoutDto) {
    return this.billing.checkout(request.user.id, dto);
  }

  @Post("webhook/mercadopago")
  webhook(@Body() payload: Record<string, unknown>) {
    return this.billing.webhook(payload);
  }

  @Get("portal")
  @UseGuards(JwtAuthGuard)
  portal(@Req() request: RequestWithUser) {
    return this.billing.portal(request.user.id);
  }

  @Post("iap/verify")
  @UseGuards(JwtAuthGuard)
  verifyReceipt(@Req() request: RequestWithUser, @Body() dto: VerifyReceiptDto) {
    return this.billing.verifyReceipt(request.user.id, dto);
  }
}
