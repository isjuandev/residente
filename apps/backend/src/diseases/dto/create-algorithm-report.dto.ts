import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateAlgorithmReportDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  reason!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1500)
  comment!: string;
}
