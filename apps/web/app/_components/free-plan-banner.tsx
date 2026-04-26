"use client";

import Link from "next/link";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json() as Promise<{ isPro: boolean; plan: string }>;
};

export function FreePlanBanner() {
  const { data } = useSWR("/api/billing/status", fetcher);
  if (!data || data.isPro) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <span>Estás usando Residente FREE. Desbloquea PRO para acceso completo.</span>
        <Link href="/pricing" className="font-semibold text-[#1A5276]">
          Ver planes
        </Link>
      </div>
    </div>
  );
}
