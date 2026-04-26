import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAlgorithmFeedbackDto } from "./dto/create-algorithm-feedback.dto";
import { CreateAlgorithmReportDto } from "./dto/create-algorithm-report.dto";
import { CreateDiseaseDto } from "./dto/create-disease.dto";
import { ListDiseasesDto } from "./dto/list-diseases.dto";
import { SearchDiseasesDto } from "./dto/search-diseases.dto";
import { UpdateDiseaseDto } from "./dto/update-disease.dto";
import { serializeDisease, serializeDiseasePage } from "./disease.presenter";

const diseaseInclude = {
  specialty: {
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      order: true
    }
  },
  algorithms: {
    orderBy: { updatedAt: "desc" },
    take: 1
  }
} satisfies Prisma.DiseaseInclude;

@Injectable()
export class DiseasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async findAll(query: ListDiseasesDto, user?: AuthenticatedUser | null) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.DiseaseWhereInput = {
      ...this.visibilityFilter(user)
    };

    if (query.specialtySlug) {
      where.specialty = {
        slug: query.specialtySlug
      };
    }

    if (user?.role === Role.ADMIN && query.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }

    const [diseases, total] = await this.prisma.$transaction([
      this.prisma.disease.findMany({
        where,
        include: diseaseInclude,
        orderBy: [{ specialty: { order: "asc" } }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.disease.count({ where })
    ]);

    return serializeDiseasePage(diseases, total, page, limit);
  }

  async findBySlug(slug: string, user?: AuthenticatedUser | null) {
    const disease = await this.prisma.disease.findFirst({
      where: {
        slug,
        ...this.visibilityFilter(user)
      },
      include: diseaseInclude
    });

    if (!disease) {
      throw new NotFoundException("Disease not found");
    }

    return serializeDisease(disease);
  }

  async search(query: SearchDiseasesDto, user?: AuthenticatedUser | null) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const term = query.q.trim();

    const where: Prisma.DiseaseWhereInput = {
      ...this.visibilityFilter(user),
      OR: [
        {
          name: {
            contains: term,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: term,
            mode: "insensitive"
          }
        },
        {
          clinicalPresentations: {
            has: term.toLowerCase()
          }
        },
        {
          clinicalPresentations: {
            has: term
          }
        }
      ]
    };

    if (query.specialtySlug) {
      where.specialty = {
        slug: query.specialtySlug
      };
    }

    const [diseases, total] = await this.prisma.$transaction([
      this.prisma.disease.findMany({
        where,
        include: diseaseInclude,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.disease.count({ where })
    ]);

    return serializeDiseasePage(diseases, total, page, limit);
  }

  async submitFeedback(
    slug: string,
    dto: CreateAlgorithmFeedbackDto,
    user?: AuthenticatedUser | null
  ) {
    const algorithm = await this.findCurrentAlgorithm(slug, user);

    await this.prisma.algorithmFeedback.create({
      data: {
        algorithmId: algorithm.id,
        userId: user?.id,
        rating: dto.rating,
        reasons: dto.reasons,
        comment: dto.comment?.trim() || undefined
      }
    });

    return { submitted: true };
  }

  async submitReport(
    slug: string,
    dto: CreateAlgorithmReportDto,
    user?: AuthenticatedUser | null
  ) {
    const algorithm = await this.findCurrentAlgorithm(slug, user);

    await this.prisma.algorithmReport.create({
      data: {
        algorithmId: algorithm.id,
        userId: user?.id,
        reason: dto.reason,
        comment: dto.comment.trim()
      }
    });

    return { submitted: true };
  }

  async pendingReports() {
    const reports = await this.prisma.algorithmReport.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, email: true, role: true } },
        algorithm: {
          select: {
            id: true,
            version: true,
            disease: {
              select: {
                id: true,
                name: true,
                slug: true,
                specialty: { select: { name: true, icon: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return {
      data: reports.map((report) => ({
        id: report.id,
        reason: report.reason,
        comment: report.comment,
        status: report.status,
        createdAt: report.createdAt,
        user: report.user,
        algorithm: {
          id: report.algorithm.id,
          version: report.algorithm.version,
          disease: report.algorithm.disease
        }
      }))
    };
  }

  async create(dto: CreateDiseaseDto) {
    await this.ensureSpecialtyExists(dto.specialtyId);

    try {
      const disease = await this.prisma.disease.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          specialtyId: dto.specialtyId,
          clinicalPresentations: dto.clinicalPresentations.map((value) =>
            value.toLowerCase()
          ),
          isPublished: dto.isPublished ?? false,
          algorithms: dto.algorithm
            ? {
                create: this.toAlgorithmCreateInput(dto.algorithm)
              }
            : undefined
        },
        include: diseaseInclude
      });

      if (disease.isPublished) {
        await this.notificationsService.notifyDiseasePublished(disease);
      }

      return serializeDisease(disease);
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateDiseaseDto) {
    const previous = await this.prisma.disease.findUnique({
      where: { id },
      select: { isPublished: true }
    });

    if (!previous) {
      throw new NotFoundException("Disease not found");
    }

    if (dto.specialtyId) {
      await this.ensureSpecialtyExists(dto.specialtyId);
    }

    try {
      const { algorithm, ...diseaseData } = dto;
      const disease = await this.prisma.disease.update({
        where: { id },
        data: {
          ...diseaseData,
          clinicalPresentations: dto.clinicalPresentations?.map((value) =>
            value.toLowerCase()
          )
        },
        include: diseaseInclude
      });

      if (algorithm) {
        await this.upsertAlgorithm(id, algorithm);
        const updatedDisease = await this.prisma.disease.findUniqueOrThrow({
          where: { id },
          include: diseaseInclude
        });
        await this.notifyIfPublished(previous.isPublished, updatedDisease);
        return serializeDisease(updatedDisease);
      }

      await this.notifyIfPublished(previous.isPublished, disease);
      return serializeDisease(disease);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Disease not found");
      }

      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.disease.delete({
        where: { id }
      });

      return { deleted: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Disease not found");
      }

      throw error;
    }
  }

  private visibilityFilter(user?: AuthenticatedUser | null) {
    if (user?.role === Role.ADMIN) {
      return {};
    }

    return { isPublished: true };
  }

  private async findCurrentAlgorithm(
    slug: string,
    user?: AuthenticatedUser | null
  ) {
    const disease = await this.prisma.disease.findFirst({
      where: {
        slug,
        ...this.visibilityFilter(user)
      },
      select: {
        algorithms: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { id: true }
        }
      }
    });

    const algorithm = disease?.algorithms[0];
    if (!algorithm) {
      throw new NotFoundException("Algorithm not found");
    }

    return algorithm;
  }

  private async ensureSpecialtyExists(specialtyId: string) {
    const specialty = await this.prisma.specialty.findUnique({
      where: { id: specialtyId },
      select: { id: true }
    });

    if (!specialty) {
      throw new NotFoundException("Specialty not found");
    }
  }

  private handleUniqueConstraint(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException("Disease slug already exists");
    }
  }

  private toAlgorithmCreateInput(
    algorithm: NonNullable<CreateDiseaseDto["algorithm"]>
  ): Prisma.AlgorithmUncheckedCreateWithoutDiseaseInput {
    return {
      flowchartUrl: algorithm.flowchartUrl ?? "",
      steps: (algorithm.steps ?? []) as Prisma.InputJsonValue,
      tables: (algorithm.tables ?? {}) as Prisma.InputJsonValue,
      references: algorithm.references ?? [],
      version: algorithm.version ?? "1.0.0"
    };
  }

  private async upsertAlgorithm(
    diseaseId: string,
    algorithm: NonNullable<UpdateDiseaseDto["algorithm"]>
  ) {
    const existing = await this.prisma.algorithm.findFirst({
      where: { diseaseId },
      orderBy: { updatedAt: "desc" },
      select: { id: true }
    });

    const data = this.toAlgorithmCreateInput(algorithm);

    if (existing) {
      await this.prisma.algorithm.update({
        where: { id: existing.id },
        data
      });
      return;
    }

    await this.prisma.algorithm.create({
      data: {
        ...data,
        diseaseId
      }
    });
  }

  private async notifyIfPublished(
    wasPublished: boolean,
    disease: { isPublished: boolean; name: string; slug: string }
  ) {
    if (!wasPublished && disease.isPublished) {
      await this.notificationsService.notifyDiseasePublished(disease);
    }
  }
}
