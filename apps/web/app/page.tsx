import type { HealthStatus } from "@residente/shared";
import Link from "next/link";

const status: HealthStatus = {
  ok: true,
  service: "web"
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#1A5276]">
          {status.ok ? "Online" : "Offline"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Residente</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700">
          Algoritmos médicos organizados para consulta clínica rápida.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            className="rounded-md bg-[#1A5276] px-4 py-2 font-medium text-white transition hover:bg-[#164763]"
            href="/login"
          >
            Ingresar
          </Link>
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 transition hover:border-[#1A5276]"
            href="/register"
          >
            Crear cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}
