export function AuthCard({
  title,
  subtitle,
  children
}: Readonly<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1A5276]">
            Residente
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950">
            Algoritmos médicos para decisiones clínicas más claras.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Accede a flujogramas, tablas y referencias organizadas por
            especialidad.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#1A5276]">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
