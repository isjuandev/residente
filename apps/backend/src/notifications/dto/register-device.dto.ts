import { DevicePlatform } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDeviceDto {
  @IsString()
  @MinLength(20)
  token!: string;

  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;
}
