"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  diseases: "Enfermedades",
  specialties: "Especialidades",
  media: "Media",
  users: "Usuarios"
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <li key={href} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {isLast ? (
                <span className="font-medium text-slate-700">
                  {labels[segment] ?? segment}
                </span>
              ) : (
                <Link className="hover:text-[#1A5276]" href={href}>
                  {labels[segment] ?? segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
