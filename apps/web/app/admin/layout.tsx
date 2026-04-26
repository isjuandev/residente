import { redirect } from "next/navigation";
import { API_BASE_URL, getAccessToken, type AuthUser } from "../_lib/auth";
import { AdminShell } from "./_components/admin-shell";

async function getCurrentUser(): Promise<AuthUser | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<AuthUser>;
}

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin/dashboard");
  }

  if (user.role !== "ADMIN") {
    redirect("/app");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
