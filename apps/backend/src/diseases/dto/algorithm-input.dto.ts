import { IsArray, IsObject, IsOptional, IsString } from "class-validator";

export class AlgorithmInputDto {
  @IsOptional()
  @IsString()
  flowchartUrl?: string;

  @IsOptional()
  @IsArray()
  steps?: unknown[];

  @IsOptional()
  @IsObject()
  tables?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];

  @IsOptional()
  @IsString()
  version?: string;
}
