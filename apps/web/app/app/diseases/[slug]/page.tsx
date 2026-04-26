import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlgorithm, getDisease, getDiseaseSlugs } from "../../../_lib/diseases";
import { absoluteUrl, siteMetadata } from "../../../_lib/seo";
import { FavoriteButton } from "./favorite-button";
import { FlowchartViewer } from "./flowchart-viewer";
import { AlgorithmFeedback } from "./algorithm-feedback";

interface DiseasePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return getDiseaseSlugs();
}

export async function generateMetadata({
  params
}: DiseasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const disease = await getDisease(slug);

  if (!disease) {
    return {
      title: "Enfermedad no encontrada"
    };
  }

  const path = `/app/diseases/${disease.slug}`;

  return {
    title: disease.name,
    description: disease.description,
    alternates: {
      canonical: path
    },
    openGraph: {
      type: "article",
      siteName: siteMetadata.name,
      title: disease.name,
      description: disease.description,
      url: path,
      locale: siteMetadata.locale,
      images: [
        {
          url: `${path}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: disease.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: disease.name,
      description: disease.description,
      images: [`${path}/opengraph-image`]
    }
  };
}

export default async function DiseasePage({ params }: DiseasePageProps) {
  const { slug } = await params;
  const disease = await getDisease(slug);

  if (!disease) {
    notFound();
  }

  const algorithm = getAlgorithm(disease);
  const diseaseUrl = absoluteUrl(`/app/diseases/${disease.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      name: disease.name,
      description: disease.description,
      url: diseaseUrl,
      relevantSpecialty: {
        "@type": "MedicalSpecialty",
        name: disease.specialty.name
      },
      signOrSymptom: disease.clinicalPresentations.map((presentation) => ({
        "@type": "MedicalSignOrSymptom",
        name: presentation
      })),
      guideline: algorithm.references.map((reference) => ({
        "@type": "MedicalGuideline",
        name: reference
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Residente",
          item: absoluteUrl("/")
        },
        {
          "@type": "ListItem",
          position: 2,
          name: disease.specialty.name,
          item: absoluteUrl(`/app?specialty=${disease.specialty.slug}`)
        },
        {
          "@type": "ListItem",
          position: 3,
          name: disease.name,
          item: diseaseUrl
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1A5276]">
            {disease.specialty.icon} {disease.specialty.name}
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-slate-950">
                {disease.name}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                {disease.description}
              </p>
              {algorithm.version ? (
                <p className="mt-3 text-sm text-slate-500">
                  Versión del algoritmo: {algorithm.version}
                </p>
              ) : null}
            </div>
            <FavoriteButton diseaseId={disease.id} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <Panel title="Flujograma">
            <FlowchartViewer
              diseaseName={disease.name}
              flowchartUrl={algorithm.flowchartUrl}
            />
          </Panel>

          <Panel title="Pasos del algoritmo">
            {algorithm.steps.length > 0 ? (
              <ol className="space-y-4">
                {algorithm.steps.map((step, index) => (
                  <li
                    key={`${step.title}-${index}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A5276] text-sm font-semibold text-white">
                        {step.order ?? index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {step.title}
                        </h3>
                        {step.description ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {step.description}
                          </p>
                        ) : null}
                        {step.actions?.length ? (
                          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {step.actions.map((action) => (
                              <li key={action}>{action}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyText>Pasos pendientes para este algoritmo.</EmptyText>
            )}
          </Panel>
        </section>

        <aside className="space-y-6">
          <Panel title="Presentaciones clínicas">
            <div className="flex flex-wrap gap-2">
              {disease.clinicalPresentations.map((presentation) => (
                <span
                  key={presentation}
                  className="rounded-full bg-[#1A5276]/10 px-3 py-1 text-sm font-medium text-[#1A5276]"
                >
                  {presentation}
                </span>
              ))}
            </div>
          </Panel>

          <Panel title="Tablas clínicas">
            <ClinicalTables tables={algorithm.tables} />
          </Panel>

          <Panel title="Referencias">
            {algorithm.references.length > 0 ? (
              <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
                {algorithm.references.map((reference) => (
                  <li key={reference}>{reference}</li>
                ))}
              </ol>
            ) : (
              <EmptyText>Referencias pendientes.</EmptyText>
            )}
          </Panel>

          <Panel title="Feedback del algoritmo">
            <AlgorithmFeedback slug={disease.slug} />
          </Panel>
        </aside>
      </div>
    </main>
  );
}

function Panel({
  title,
  children
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#1A5276]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyText({ children }: Readonly<{ children: React.ReactNode }>) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function ClinicalTables({
  tables
}: Readonly<{
  tables: ReturnType<typeof getAlgorithm>["tables"];
}>) {
  if (!tables) {
    return <EmptyText>Tablas pendientes.</EmptyText>;
  }

  if (Array.isArray(tables)) {
    return (
      <div className="space-y-4">
        {tables.map((table, index) => (
          <div key={table.title ?? index}>
            {table.title ? (
              <h3 className="mb-2 font-semibold text-slate-900">
                {table.title}
              </h3>
            ) : null}
            {table.headers?.length && table.rows?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {table.headers.map((header) => (
                        <th
                          key={header}
                          className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${rowIndex}-${cellIndex}`}
                            className="border border-slate-200 px-3 py-2"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {table.items?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {table.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className="space-y-4">
      {Object.entries(tables).map(([key, value]) => (
        <div key={key}>
          <dt className="font-semibold capitalize text-slate-900">{key}</dt>
          <dd className="mt-1 text-sm leading-6 text-slate-700">
            {Array.isArray(value) ? value.join(", ") : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
