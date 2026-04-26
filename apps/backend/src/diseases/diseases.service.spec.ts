import { NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { DiseasesService } from "./diseases.service";

const now = new Date("2026-01-01T00:00:00.000Z");
const specialty = {
  id: "spec-1",
  name: "Cardiología",
  slug: "cardiologia",
  icon: "heart",
  order: 1
};
const disease = {
  id: "dis-1",
  name: "Síndrome coronario agudo",
  slug: "sindrome-coronario-agudo",
  description: "Dolor torácico sugestivo de isquemia miocárdica.",
  specialtyId: specialty.id,
  specialty,
  clinicalPresentations: ["dolor torácico"],
  isPublished: true,
  createdAt: now,
  updatedAt: now,
  algorithms: []
};

function createService() {
  const prisma = {
    $transaction: jest.fn(async (operations: unknown[]) => Promise.all(operations)),
    disease: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUniqueOrThrow: jest.fn()
    },
    specialty: {
      findUnique: jest.fn()
    },
    algorithm: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    }
  };
  const notifications = {
    notifyDiseasePublished: jest.fn()
  };

  return {
    service: new DiseasesService(prisma as never, notifications as never),
    prisma,
    notifications
  };
}

describe("DiseasesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists only published diseases for anonymous/student users with metadata", async () => {
    const { service, prisma } = createService();
    prisma.disease.findMany.mockResolvedValue([disease]);
    prisma.disease.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 }, null);

    expect(prisma.disease.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: true },
        skip: 0,
        take: 10
      })
    );
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.slug).toBe(disease.slug);
  });

  it("allows admins to filter unpublished diseases", async () => {
    const { service, prisma } = createService();
    prisma.disease.findMany.mockResolvedValue([]);
    prisma.disease.count.mockResolvedValue(0);

    await service.findAll(
      { page: 2, limit: 5, isPublished: false },
      { id: "admin-1", email: "admin@residente.app", role: Role.ADMIN }
    );

    expect(prisma.disease.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: false },
        skip: 5,
        take: 5
      })
    );
  });

  it("searches case-insensitively by name/description and clinical presentations", async () => {
    const { service, prisma } = createService();
    prisma.disease.findMany.mockResolvedValue([disease]);
    prisma.disease.count.mockResolvedValue(1);

    await service.search({ q: "Dolor", page: 1, limit: 20 }, null);

    expect(prisma.disease.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublished: true,
          OR: expect.arrayContaining([
            { name: { contains: "Dolor", mode: "insensitive" } },
            { description: { contains: "Dolor", mode: "insensitive" } },
            { clinicalPresentations: { has: "dolor" } }
          ])
        })
      })
    );
  });

  it("throws NotFoundException when slug is not visible/found", async () => {
    const { service, prisma } = createService();
    prisma.disease.findFirst.mockResolvedValue(null);

    await expect(service.findBySlug("missing", null)).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("creates a disease with normalized clinical presentations and algorithm", async () => {
    const { service, prisma } = createService();
    prisma.disease.findUnique.mockResolvedValue({ isPublished: true });
    prisma.specialty.findUnique.mockResolvedValue({ id: specialty.id });
    prisma.disease.create.mockResolvedValue({
      ...disease,
      algorithms: [
        {
          id: "alg-1",
          diseaseId: disease.id,
          flowchartUrl: "https://cdn/flow.svg",
          steps: [{ title: "Evaluar" }],
          tables: [{ title: "Labs", headers: ["A"], rows: [["B"]] }],
          references: ["Guía"],
          version: "1.0.0",
          updatedAt: now
        }
      ]
    });

    const result = await service.create({
      name: disease.name,
      slug: disease.slug,
      description: disease.description,
      specialtyId: specialty.id,
      clinicalPresentations: ["Dolor Torácico"],
      isPublished: false,
      algorithm: {
        flowchartUrl: "https://cdn/flow.svg",
        steps: [{ title: "Evaluar" }],
        tables: { labs: ["troponina"] },
        references: ["Guía"],
        version: "1.0.0"
      }
    });

    expect(prisma.disease.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clinicalPresentations: ["dolor torácico"],
          algorithms: {
            create: expect.objectContaining({
              flowchartUrl: "https://cdn/flow.svg",
              version: "1.0.0"
            })
          }
        })
      })
    );
    expect(result.algorithm?.flowchartUrl).toBe("https://cdn/flow.svg");
  });

  it("updates an existing algorithm when disease update includes algorithm", async () => {
    const { service, prisma } = createService();
    prisma.disease.findUnique.mockResolvedValue({ isPublished: true });
    prisma.specialty.findUnique.mockResolvedValue({ id: specialty.id });
    prisma.disease.update.mockResolvedValue(disease);
    prisma.algorithm.findFirst.mockResolvedValue({ id: "alg-1" });
    prisma.disease.findUniqueOrThrow.mockResolvedValue({
      ...disease,
      algorithms: [
        {
          id: "alg-1",
          diseaseId: disease.id,
          flowchartUrl: "new.svg",
          steps: [],
          tables: {},
          references: [],
          version: "2.0.0",
          updatedAt: now
        }
      ]
    });

    await service.update(disease.id, {
      specialtyId: specialty.id,
      algorithm: {
        flowchartUrl: "new.svg",
        version: "2.0.0"
      }
    });

    expect(prisma.algorithm.update).toHaveBeenCalledWith({
      where: { id: "alg-1" },
      data: expect.objectContaining({
        flowchartUrl: "new.svg",
        version: "2.0.0"
      })
    });
  });

  it("deletes a disease", async () => {
    const { service, prisma } = createService();
    prisma.disease.delete.mockResolvedValue(disease);

    await expect(service.remove(disease.id)).resolves.toEqual({ deleted: true });
    expect(prisma.disease.delete).toHaveBeenCalledWith({
      where: { id: disease.id }
    });
  });
});
