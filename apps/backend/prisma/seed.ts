import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const adminPassword = "password123";

const specialties = [
  { name: "Cardiología", slug: "cardiologia", icon: "❤️", order: 1 },
  { name: "Neurología", slug: "neurologia", icon: "🧠", order: 2 },
  { name: "Neumología", slug: "neumologia", icon: "🫁", order: 3 },
  { name: "Gastroenterología", slug: "gastroenterologia", icon: "🩺", order: 4 },
  { name: "Infectología", slug: "infectologia", icon: "🦠", order: 5 }
];

const diseases = [
  {
    name: "Síndrome coronario agudo",
    slug: "sindrome-coronario-agudo",
    specialtySlug: "cardiologia",
    description:
      "Algoritmo inicial para dolor torácico sugestivo de isquemia miocárdica.",
    clinicalPresentations: [
      "dolor torácico",
      "disnea",
      "diaforesis",
      "náuseas"
    ],
    flowchartUrl: "s3://residente/algorithms/sindrome-coronario-agudo.svg",
    version: "1.0.0",
    references: [
      "ESC Guidelines for the management of acute coronary syndromes",
      "AHA/ACC Guideline for the Management of Acute Coronary Syndromes"
    ],
    steps: [
      {
        order: 1,
        title: "Evaluación inmediata",
        actions: ["ECG en menos de 10 minutos", "Signos vitales", "Troponina"]
      },
      {
        order: 2,
        title: "Estratificación",
        actions: ["Identificar elevación del ST", "Calcular riesgo clínico"]
      }
    ],
    tables: {
      redFlags: ["Hipotensión", "Arritmias malignas", "Edema pulmonar"],
      initialLabs: ["Troponina", "Hemograma", "Creatinina", "Electrolitos"]
    }
  },
  {
    name: "Accidente cerebrovascular isquémico",
    slug: "accidente-cerebrovascular-isquemico",
    specialtySlug: "neurologia",
    description:
      "Ruta de evaluación y manejo temprano del déficit neurológico focal agudo.",
    clinicalPresentations: [
      "hemiparesia",
      "afasia",
      "desviación facial",
      "alteración visual"
    ],
    flowchartUrl:
      "s3://residente/algorithms/accidente-cerebrovascular-isquemico.svg",
    version: "1.0.0",
    references: [
      "AHA/ASA Guideline for the Early Management of Acute Ischemic Stroke"
    ],
    steps: [
      {
        order: 1,
        title: "Código ACV",
        actions: ["Hora de inicio", "NIHSS", "Glucemia capilar"]
      },
      {
        order: 2,
        title: "Imagen",
        actions: ["TAC simple de cráneo", "AngioTAC si sospecha de gran vaso"]
      }
    ],
    tables: {
      thrombolysisWindowHours: 4.5,
      exclusions: ["Hemorragia intracraneal", "Cirugía mayor reciente"]
    }
  },
  {
    name: "Neumonía adquirida en la comunidad",
    slug: "neumonia-adquirida-en-la-comunidad",
    specialtySlug: "neumologia",
    description:
      "Algoritmo para diagnóstico, severidad y tratamiento empírico inicial.",
    clinicalPresentations: [
      "fiebre",
      "tos",
      "disnea",
      "dolor pleurítico",
      "expectoración"
    ],
    flowchartUrl:
      "s3://residente/algorithms/neumonia-adquirida-en-la-comunidad.svg",
    version: "1.0.0",
    references: [
      "ATS/IDSA Clinical Practice Guideline for Community-Acquired Pneumonia"
    ],
    steps: [
      {
        order: 1,
        title: "Confirmación clínica",
        actions: ["Radiografía de tórax", "Oximetría", "Evaluar sepsis"]
      },
      {
        order: 2,
        title: "Definir sitio de manejo",
        actions: ["CURB-65", "Comorbilidades", "Tolerancia oral"]
      }
    ],
    tables: {
      severityScores: ["CURB-65", "PSI"],
      empiricTherapy: ["Betalactámico", "Macrólido", "Doxiciclina"]
    }
  }
];

async function main() {
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: "admin@residente.app" },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    },
    create: {
      email: "admin@residente.app",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  for (const specialty of specialties) {
    await prisma.specialty.upsert({
      where: { slug: specialty.slug },
      update: specialty,
      create: specialty
    });
  }

  for (const disease of diseases) {
    const specialty = await prisma.specialty.findUniqueOrThrow({
      where: { slug: disease.specialtySlug }
    });

    const savedDisease = await prisma.disease.upsert({
      where: { slug: disease.slug },
      update: {
        name: disease.name,
        description: disease.description,
        specialtyId: specialty.id,
        clinicalPresentations: disease.clinicalPresentations,
        isPublished: true
      },
      create: {
        name: disease.name,
        slug: disease.slug,
        description: disease.description,
        specialtyId: specialty.id,
        clinicalPresentations: disease.clinicalPresentations,
        isPublished: true
      }
    });

    await prisma.algorithm.upsert({
      where: {
        diseaseId_version: {
          diseaseId: savedDisease.id,
          version: disease.version
        }
      },
      update: {
        flowchartUrl: disease.flowchartUrl,
        steps: disease.steps,
        tables: disease.tables,
        references: disease.references
      },
      create: {
        diseaseId: savedDisease.id,
        flowchartUrl: disease.flowchartUrl,
        steps: disease.steps,
        tables: disease.tables,
        references: disease.references,
        version: disease.version
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
