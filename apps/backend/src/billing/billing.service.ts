import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Plan, SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CheckoutDto, VerifyReceiptDto } from "./dto/checkout.dto";

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async status(userId: string) {
    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {},
      create: { userId, plan: Plan.FREE, status: SubscriptionStatus.INACTIVE }
    });

    const isPro =
      subscription.plan === Plan.PRO &&
      subscription.status === SubscriptionStatus.ACTIVE &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date());

    return {
      plan: isPro ? Plan.PRO : Plan.FREE,
      status: subscription.status,
      isPro,
      currentPeriodEnd: subscription.currentPeriodEnd
    };
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const accessToken = this.config.get<string>("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) throw new BadRequestException("MercadoPago no configurado");

    const webUrl = this.config.get<string>("WEB_URL") ?? "http://localhost:3000";
    const body = {
      items: [
        {
          title: "Residente PRO",
          quantity: 1,
          currency_id: this.config.get<string>("MERCADOPAGO_CURRENCY") ?? "USD",
          unit_price: Number(this.config.get<string>("PRO_PRICE") ?? 9)
        }
      ],
      external_reference: userId,
      back_urls: {
        success: dto.successUrl ?? `${webUrl}/upgrade/success`,
        failure: dto.cancelUrl ?? `${webUrl}/upgrade/cancel`,
        pending: dto.cancelUrl ?? `${webUrl}/upgrade/cancel`
      },
      notification_url: this.config.get<string>("MERCADOPAGO_WEBHOOK_URL"),
      metadata: { userId, plan: "PRO" }
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new BadRequestException("No se pudo crear checkout");
    const preference = await response.json() as { id: string; init_point?: string; sandbox_init_point?: string };
    return {
      preferenceId: preference.id,
      checkoutUrl: preference.init_point ?? preference.sandbox_init_point
    };
  }

  async webhook(payload: Record<string, unknown>) {
    const type = String(payload.type ?? payload.topic ?? "");
    const data = payload.data as { id?: string } | undefined;
    const paymentId = data?.id ?? String(payload.id ?? "");
    if (!paymentId || !type.includes("payment")) return { ok: true };

    const payment = await this.fetchMercadoPagoPayment(paymentId);
    const userId = String(payment.external_reference ?? payment.metadata?.user_id ?? payment.metadata?.userId ?? "");
    if (!userId) return { ok: true };

    await this.prisma.payment.upsert({
      where: { providerId: String(payment.id) },
      update: { status: payment.status, raw: payment },
      create: {
        userId,
        provider: "mercadopago",
        providerId: String(payment.id),
        status: payment.status,
        amountCents: Math.round(Number(payment.transaction_amount ?? 0) * 100),
        currency: payment.currency_id,
        raw: payment
      }
    });

    if (payment.status === "approved") {
      await this.activatePro(userId, "mercadopago", String(payment.id));
    }

    return { ok: true };
  }

  async portal(userId: string) {
    const status = await this.status(userId);
    return {
      ...status,
      message: "Gestiona tu plan desde MercadoPago o desde la tienda móvil donde realizaste la compra."
    };
  }

  async verifyReceipt(userId: string, dto: VerifyReceiptDto) {
    if (!dto.productId.includes("pro") || dto.receipt.length < 10) {
      throw new UnauthorizedException("Recibo inválido");
    }

    await this.activatePro(userId, dto.platform, dto.productId);
    return this.status(userId);
  }

  private async activatePro(userId: string, provider: string, providerId: string) {
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: Plan.PRO,
        status: SubscriptionStatus.ACTIVE,
        provider,
        providerSubscriptionId: providerId,
        currentPeriodEnd
      },
      create: {
        userId,
        plan: Plan.PRO,
        status: SubscriptionStatus.ACTIVE,
        provider,
        providerSubscriptionId: providerId,
        currentPeriodEnd
      }
    });
  }

  private async fetchMercadoPagoPayment(paymentId: string): Promise<Record<string, any>> {
    const accessToken = this.config.get<string>("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) throw new BadRequestException("MercadoPago no configurado");
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new BadRequestException("No se pudo validar pago");
    return response.json() as Promise<Record<string, any>>;
  }
}
