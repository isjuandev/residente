import { Algorithm, Disease, Specialty } from "@prisma/client";

type DiseaseWithSpecialty = Disease & {
  specialty: Pick<Specialty, "id" | "name" | "slug" | "icon" | "order">;
  algorithms?: Algorithm[];
};

export function serializeDisease(disease: DiseaseWithSpecialty) {
  return {
    id: disease.id,
    name: disease.name,
    slug: disease.slug,
    description: disease.description,
    specialty: disease.specialty,
    clinicalPresentations: disease.clinicalPresentations,
    isPublished: disease.isPublished,
    algorithm: disease.algorithms?.[0]
      ? {
          id: disease.algorithms[0].id,
          flowchartUrl: disease.algorithms[0].flowchartUrl,
          steps: disease.algorithms[0].steps,
          tables: disease.algorithms[0].tables,
          references: disease.algorithms[0].references,
          version: disease.algorithms[0].version,
          updatedAt: disease.algorithms[0].updatedAt
        }
      : null,
    createdAt: disease.createdAt,
    updatedAt: disease.updatedAt
  };
}

export function serializeDiseasePage(
  diseases: DiseaseWithSpecialty[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data: diseases.map(serializeDisease),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1
    }
  };
}
