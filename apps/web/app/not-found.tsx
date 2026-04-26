import { EmptyState } from "./_components/empty-state";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Página no encontrada"
          description="La página que buscas no existe o fue movida."
          actionHref="/app"
          actionLabel="Volver al inicio"
        />
      </div>
    </main>
  );
}
