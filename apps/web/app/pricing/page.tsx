import { UpgradeButton } from "./upgrade-button";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#1A5276]">Planes</p>
        <h1 className="mt-3 text-4xl font-semibold">Residente FREE y PRO</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-2xl font-semibold">FREE</h2>
            <p className="mt-2 text-slate-600">Acceso básico para explorar algoritmos publicados.</p>
            <p className="mt-6 text-3xl font-bold">$0</p>
          </div>
          <div className="rounded-lg border-2 border-[#1A5276] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#1A5276]">PRO</h2>
            <p className="mt-2 text-slate-600">Acceso completo, favoritos avanzados y contenido premium.</p>
            <p className="mt-6 text-3xl font-bold">$9/mes</p>
            <div className="mt-6"><UpgradeButton /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
