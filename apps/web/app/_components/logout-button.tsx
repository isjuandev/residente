"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "../_providers/user-provider";

export function LogoutButton() {
  const router = useRouter();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await fetch("/api/auth/logout", {
      method: "POST"
    });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-md bg-[#1A5276] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#164763] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
