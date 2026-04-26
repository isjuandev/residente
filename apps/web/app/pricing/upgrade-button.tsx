"use client";

import { useState } from "react";

export function UpgradeButton() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    setError(null);
    const origin = window.location.origin;
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        successUrl: `${origin}/upgrade/success`,
        cancelUrl: `${origin}/upgrade/cancel`
      })
    });
    setLoading(false);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "No se pudo iniciar el pago");
      return;
    }
    window.location.href = data.checkoutUrl;
  }

  return (
    <div>
      <button
        type="button"
        onClick={upgrade}
        disabled={loading}
        className="rounded-md bg-[#1A5276] px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Abriendo pago..." : "Actualizar a PRO"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
