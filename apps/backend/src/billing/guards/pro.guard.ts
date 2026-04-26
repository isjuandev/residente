import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser } from "../../auth/types/authenticated-user";

@Injectable()
export class ProGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) throw new ForbiddenException("Sesión requerida");

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { plan: true, status: true, currentPeriodEnd: true }
    });

    const active =
      subscription?.plan === "PRO" &&
      subscription.status === "ACTIVE" &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date());

    if (!active) throw new ForbiddenException("Esta función requiere Residente PRO");
    return true;
  }
}
