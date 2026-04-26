"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-6">
          <section className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1A5276]">
              Residente
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-950">
              Algo salió mal
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Registramos el error para revisarlo. Puedes intentar cargar la
              pantalla nuevamente.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-md bg-[#1A5276] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#154360]"
            >
              Reintentar
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
