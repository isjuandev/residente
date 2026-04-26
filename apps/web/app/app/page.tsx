import { Suspense } from "react";
import { LogoutButton } from "../_components/logout-button";
import { FreePlanBanner } from "../_components/free-plan-banner";
import { DiseaseSearch } from "./disease-search";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <FreePlanBanner />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1A5276]">
              Residente
            </p>
            <h1 className="text-xl font-semibold">Panel clínico</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <Suspense fallback={<SearchFallback />}>
          <DiseaseSearch />
        </Suspense>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#1A5276]">
            Algoritmos médicos
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Tu sesión está activa. Desde aquí se conectarán especialidades,
            enfermedades, favoritos y algoritmos clínicos.
          </p>
        </div>
      </section>
    </main>
  );
}

function SearchFallback() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-8 w-80 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="h-12 animate-pulse rounded bg-slate-200" />
        <div className="h-12 animate-pulse rounded bg-slate-200" />
      </div>
    </section>
  );
}
