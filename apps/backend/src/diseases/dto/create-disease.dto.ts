import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  MinLength
} from "class-validator";
import { Type } from "class-transformer";
import { AlgorithmInputDto } from "./algorithm-input.dto";

export class CreateDiseaseDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  specialtyId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  clinicalPresentations!: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => AlgorithmInputDto)
  algorithm?: AlgorithmInputDto;
}
