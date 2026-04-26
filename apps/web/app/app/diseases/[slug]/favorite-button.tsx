"use client";

import { useState } from "react";

export function FavoriteButton({ diseaseId }: Readonly<{ diseaseId: string }>) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleFavorite() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ diseaseId })
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar favorito");
      }

      setIsFavorite((current) => !current);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo actualizar favorito"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={isLoading}
        className="rounded-md border border-[#1A5276] bg-white px-4 py-2 text-sm font-semibold text-[#1A5276] transition hover:bg-[#1A5276] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isFavorite ? "Quitar favorito" : "Guardar favorito"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
