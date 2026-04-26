"use client";

import { useState } from "react";

export function FlowchartViewer({
  diseaseName,
  flowchartUrl
}: Readonly<{
  diseaseName: string;
  flowchartUrl?: string;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  if (!flowchartUrl) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Flujograma pendiente
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="block w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm"
      >
        <img
          src={flowchartUrl}
          alt={`Flujograma de ${diseaseName}`}
          className="max-h-[520px] w-full object-contain p-4"
        />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-full w-full max-w-6xl overflow-auto rounded-lg bg-white p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-[#1A5276] px-4 py-2 text-sm font-semibold text-white"
              >
                Cerrar
              </button>
            </div>
            <img
              src={flowchartUrl}
              alt={`Flujograma ampliado de ${diseaseName}`}
              className="mx-auto min-w-[720px] object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
