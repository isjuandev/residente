"use client";

import { EmptyState } from "./_components/empty-state";

export default function GlobalError({
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Algo salió mal"
          description="No pudimos cargar esta sección. Intenta nuevamente en unos segundos."
        />
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Reintentar
          </button>
        </div>
      </div>
    </main>
  );
}
