import { IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class SendNotificationDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(500)
  body!: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
