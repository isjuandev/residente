import { API_BASE_URL } from "./auth";

export interface DiseaseSpecialty {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

export interface ClinicalTable {
  title?: string;
  headers?: string[];
  rows?: Array<Array<string | number>>;
  items?: string[];
}

export interface AlgorithmStep {
  order?: number;
  title: string;
  description?: string;
  actions?: string[];
}

export interface DiseaseDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  specialty: DiseaseSpecialty;
  clinicalPresentations: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  algorithm?: {
    flowchartUrl?: string;
    steps?: AlgorithmStep[];
    tables?: ClinicalTable[] | Record<string, unknown>;
    references?: string[];
    version?: string;
  };
  flowchartUrl?: string;
  steps?: AlgorithmStep[];
  tables?: ClinicalTable[] | Record<string, unknown>;
  references?: string[];
}

interface DiseasePageResponse {
  data: Array<Pick<DiseaseDetail, "slug" | "updatedAt">>;
}

export async function getDisease(slug: string): Promise<DiseaseDetail | null> {
  const response = await fetch(`${API_BASE_URL}/api/diseases/${slug}`, {
    next: {
      revalidate: 300
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load disease");
  }

  return response.json() as Promise<DiseaseDetail>;
}

export async function getDiseasesForSitemap() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/diseases?limit=100`, {
      next: {
        revalidate: 300
      }
    });

    if (!response.ok) {
      return [];
    }

    const page = (await response.json()) as DiseasePageResponse;
    return page.data.map((disease) => ({
      slug: disease.slug,
      updatedAt: disease.updatedAt
    }));
  } catch {
    return [];
  }
}

export async function getDiseaseSlugs() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/diseases?limit=100`, {
      next: {
        revalidate: 300
      }
    });

    if (!response.ok) {
      return [];
    }

    const page = (await response.json()) as DiseasePageResponse;
    return page.data.map((disease) => ({
      slug: disease.slug
    }));
  } catch {
    return [];
  }
}

export function getAlgorithm(disease: DiseaseDetail) {
  return {
    flowchartUrl: disease.algorithm?.flowchartUrl ?? disease.flowchartUrl,
    steps: disease.algorithm?.steps ?? disease.steps ?? [],
    tables: disease.algorithm?.tables ?? disease.tables,
    references: disease.algorithm?.references ?? disease.references ?? [],
    version: disease.algorithm?.version
  };
}
