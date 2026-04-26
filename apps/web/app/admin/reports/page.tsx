import { AdminPageCard } from "../_components/admin-page-card";
import { API_BASE_URL, getAccessToken } from "../../_lib/auth";

interface PendingReport {
  id: string;
  reason: string;
  comment: string;
  createdAt: string;
  user?: { email: string } | null;
  algorithm: {
    version: string;
    disease: {
      name: string;
      slug: string;
      specialty: { name: string; icon: string };
    };
  };
}

async function getPendingReports() {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/diseases/reports/pending`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return [];
  }

  const body = (await response.json()) as { data: PendingReport[] };
  return body.data;
}

export default async function AdminReportsPage() {
  const reports = await getPendingReports();

  return (
    <AdminPageCard
      title="Reportes pendientes"
      description="Errores reportados por usuarios en algoritmos médicos."
    >
      {reports.length === 0 ? (
        <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
          No hay reportes pendientes.
        </p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1A5276]">
                    {report.algorithm.disease.specialty.icon}{" "}
                    {report.algorithm.disease.specialty.name}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">
                    {report.algorithm.disease.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Algoritmo v{report.algorithm.version}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Pendiente
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-900">Razón</dt>
                  <dd className="mt-1 text-slate-700">{report.reason}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Usuario</dt>
                  <dd className="mt-1 text-slate-700">
                    {report.user?.email ?? "Anónimo"}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="font-semibold text-slate-900">Comentario</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-slate-700">
                    {report.comment}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                Recibido: {new Date(report.createdAt).toLocaleString("es")}
              </p>
            </article>
          ))}
        </div>
      )}
    </AdminPageCard>
  );
}
