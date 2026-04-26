"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/diseases", label: "Enfermedades" },
  { href: "/admin/specialties", label: "Especialidades" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/reports", label: "Reportes" },
  { href: "/admin/users", label: "Usuarios" }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="px-6 py-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1A5276]">
            Residente
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Admin</h1>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#1A5276] text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-[#1A5276]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
