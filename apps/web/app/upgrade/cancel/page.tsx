import Link from "next/link";

export default function UpgradeCancelPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-2xl rounded-lg border bg-white p-8 text-center">
        <h1 className="text-3xl font-semibold">Pago cancelado</h1>
        <p className="mt-3 text-slate-600">No se realizó ningún cargo. Puedes intentar nuevamente cuando quieras.</p>
        <Link className="mt-6 inline-flex rounded-md bg-[#1A5276] px-4 py-2 text-white" href="/pricing">Volver a planes</Link>
      </section>
    </main>
  );
}
