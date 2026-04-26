import { IsOptional, IsString, Matches } from "class-validator";

export class UploadMediaDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9/_-]+$/)
  folder?: string;
}
