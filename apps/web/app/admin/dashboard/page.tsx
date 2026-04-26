import { AdminPageCard } from "../_components/admin-page-card";

export default function AdminDashboardPage() {
  return (
    <AdminPageCard
      title="Dashboard"
      description="Resumen operativo de contenido médico, usuarios y archivos de Residente."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {["Enfermedades", "Especialidades", "Usuarios"].map((label) => (
          <div
            key={label}
            className="rounded-md border border-slate-200 bg-[#F8F9FA] p-4"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">--</p>
          </div>
        ))}
      </div>
    </AdminPageCard>
  );
}
