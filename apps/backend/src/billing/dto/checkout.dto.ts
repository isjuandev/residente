import { IsOptional, IsString, IsUrl } from "class-validator";

export class CheckoutDto {
  @IsOptional()
  @IsUrl({ require_tld: false })
  successUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;
}

export class VerifyReceiptDto {
  @IsString()
  platform!: "ios" | "android";

  @IsString()
  productId!: string;

  @IsString()
  receipt!: string;
}
