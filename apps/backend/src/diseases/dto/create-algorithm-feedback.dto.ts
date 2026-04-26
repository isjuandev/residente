import { FeedbackRating } from "@prisma/client";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength
} from "class-validator";

export class CreateAlgorithmFeedbackDto {
  @IsEnum(FeedbackRating)
  rating!: FeedbackRating;

  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  reasons!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
