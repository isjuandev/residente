export const users = {
  student: {
    id: "student-1",
    email: "student@residente.test",
    role: "STUDENT",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  admin: {
    id: "admin-1",
    email: "admin@residente.test",
    role: "ADMIN",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }
};

export const specialties = [
  {
    id: "spec-cardio",
    name: "Cardiología",
    slug: "cardiologia",
    icon: "❤️",
    order: 1
  },
  {
    id: "spec-neuro",
    name: "Neurología",
    slug: "neurologia",
    icon: "🧠",
    order: 2
  }
];

export const diseases = [
  {
    id: "disease-sca",
    name: "Síndrome coronario agudo",
    slug: "sindrome-coronario-agudo",
    description: "Algoritmo inicial para dolor torácico sugestivo de isquemia.",
    specialty: specialties[0],
    clinicalPresentations: ["dolor torácico", "disnea"],
    isPublished: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    algorithm: {
      flowchartUrl:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23F8F9FA'/%3E%3Ctext x='30' y='100' fill='%231A5276' font-size='28'%3EECG - Troponina%3C/text%3E%3C/svg%3E",
      steps: [
        {
          order: 1,
          title: "Evaluación inicial",
          description: "ECG y signos vitales.",
          actions: ["ECG en 10 minutos", "Troponina"]
        }
      ],
      tables: [
        {
          title: "Laboratorios",
          headers: ["Prueba", "Uso"],
          rows: [["Troponina", "Daño miocárdico"]]
        }
      ],
      references: ["Guía ESC ACS"],
      version: "1.0.0"
    }
  }
] as const;

export const primaryDisease = diseases[0];

export function diseasePage(data = diseases) {
  return {
    data,
    meta: {
      page: 1,
      limit: 10,
      total: data.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    }
  };
}
