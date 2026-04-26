export default function LoadingDiseasePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <div className="h-10 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 h-5 w-48 rounded bg-slate-200" />
          <div className="mt-6 h-20 rounded bg-slate-200" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-96 rounded-lg bg-slate-200" />
          <div className="h-96 rounded-lg bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
