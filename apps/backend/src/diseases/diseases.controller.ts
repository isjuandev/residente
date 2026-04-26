import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user";
import { CreateDiseaseDto } from "./dto/create-disease.dto";
import { CreateAlgorithmFeedbackDto } from "./dto/create-algorithm-feedback.dto";
import { CreateAlgorithmReportDto } from "./dto/create-algorithm-report.dto";
import { ListDiseasesDto } from "./dto/list-diseases.dto";
import { SearchDiseasesDto } from "./dto/search-diseases.dto";
import { UpdateDiseaseDto } from "./dto/update-disease.dto";
import { OptionalJwtAuthGuard } from "./guards/optional-jwt-auth.guard";
import { DiseasesService } from "./diseases.service";

type RequestWithUser = Request & {
  user?: AuthenticatedUser | null;
};

@Controller("diseases")
@Throttle({ default: { limit: 10, ttl: 1000 } })
@UseGuards(ThrottlerGuard)
export class DiseasesController {
  constructor(private readonly diseasesService: DiseasesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() query: ListDiseasesDto, @Req() request: RequestWithUser) {
    return this.diseasesService.findAll(query, request.user);
  }

  @Get("search")
  @UseGuards(OptionalJwtAuthGuard)
  search(@Query() query: SearchDiseasesDto, @Req() request: RequestWithUser) {
    return this.diseasesService.search(query, request.user);
  }

  @Get("reports/pending")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  pendingReports() {
    return this.diseasesService.pendingReports();
  }

  @Post(":slug/feedback")
  @UseGuards(OptionalJwtAuthGuard)
  submitFeedback(
    @Param("slug") slug: string,
    @Body() dto: CreateAlgorithmFeedbackDto,
    @Req() request: RequestWithUser
  ) {
    return this.diseasesService.submitFeedback(slug, dto, request.user);
  }

  @Post(":slug/reports")
  @UseGuards(OptionalJwtAuthGuard)
  submitReport(
    @Param("slug") slug: string,
    @Body() dto: CreateAlgorithmReportDto,
    @Req() request: RequestWithUser
  ) {
    return this.diseasesService.submitReport(slug, dto, request.user);
  }

  @Get(":slug")
  @UseGuards(OptionalJwtAuthGuard)
  findBySlug(@Param("slug") slug: string, @Req() request: RequestWithUser) {
    return this.diseasesService.findBySlug(slug, request.user);
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() dto: CreateDiseaseDto) {
    return this.diseasesService.create(dto);
  }

  @Put(":id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param("id") id: string, @Body() dto: UpdateDiseaseDto) {
    return this.diseasesService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param("id") id: string) {
    return this.diseasesService.remove(id);
  }
}
