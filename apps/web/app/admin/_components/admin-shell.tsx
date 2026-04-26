import { LogoutButton } from "../../_components/logout-button";
import type { AuthUser } from "../../_lib/auth";
import { AdminBreadcrumbs } from "./admin-breadcrumbs";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({
  user,
  children
}: Readonly<{
  user: AuthUser;
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-950">
      <AdminSidebar />
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <AdminBreadcrumbs />
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#1A5276]">
                {user.email}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
