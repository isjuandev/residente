"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import useSWR from "swr";
import type { DiseaseDetail, DiseaseSpecialty } from "../_lib/diseases";
import { EmptyState } from "../_components/empty-state";

interface DiseaseSearchPage {
  data: DiseaseDetail[];
  meta: {
    total: number;
  };
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "No se pudo cargar la información");
  }

  return response.json() as Promise<T>;
};

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

export function DiseaseSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const comboboxId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQuery = searchParams.get("q") ?? "";
  const initialSpecialty = searchParams.get("specialty") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const { data: specialties, isLoading: isLoadingSpecialties } = useSWR<
    DiseaseSpecialty[]
  >("/api/specialties", fetcher);

  const searchKey = useMemo(() => {
    if (!debouncedQuery && !specialty) {
      return null;
    }

    const params = new URLSearchParams();
    params.set("q", debouncedQuery || " ");
    params.set("limit", "8");
    if (specialty) params.set("specialtySlug", specialty);

    return `/api/diseases/search?${params.toString()}`;
  }, [debouncedQuery, specialty]);

  const {
    data: results,
    error,
    isLoading
  } = useSWR<DiseaseSearchPage>(searchKey, fetcher, {
    keepPreviousData: true
  });

  const diseases = results?.data ?? [];
  const hasSearch = Boolean(debouncedQuery || specialty);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    if (specialty) {
      params.set("specialty", specialty);
    } else {
      params.delete("specialty");
    }

    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams, specialty]);

  useEffect(() => {
    setIsOpen(hasSearch);
    setActiveIndex(diseases.length ? 0 : -1);
  }, [diseases.length, hasSearch]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      setIsOpen(true);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        diseases.length ? Math.min(current + 1, diseases.length - 1) : -1
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (diseases.length ? Math.max(current - 1, 0) : -1));
    }

    if (event.key === "Enter" && activeIndex >= 0 && diseases[activeIndex]) {
      event.preventDefault();
      const activeDisease = diseases[activeIndex];
      if (activeDisease) {
        router.push(`/app/diseases/${activeDisease.slug}`);
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#1A5276]">
          Búsqueda clínica
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Encuentra enfermedades y algoritmos
        </h2>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="relative">
          <label className="sr-only" htmlFor={comboboxId}>
            Buscar enfermedades
          </label>
          <input
            ref={inputRef}
            id={comboboxId}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
            }
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(hasSearch)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre, descripción o presentación clínica"
            className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-[#1A5276] focus:ring-2 focus:ring-[#1A5276]/20"
          />

          {isOpen ? (
            <div className="absolute z-20 mt-2 max-h-96 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              <div id={listboxId} role="listbox" aria-label="Resultados">
                {!hasSearch ? (
                  <DropdownState text="Escribe una búsqueda o elige una especialidad." />
                ) : isLoading ? (
                  <DropdownState text="Buscando..." />
                ) : error ? (
                  <DropdownState text={error.message} tone="error" />
                ) : diseases.length === 0 ? (
              <div className="p-3">
                <EmptyState
                  title="Sin resultados"
                  description="Prueba con otro diagnóstico, síntoma o especialidad."
                />
              </div>
                ) : (
                  diseases.map((disease, index) => (
                    <Link
                      key={disease.id}
                      id={`${listboxId}-${index}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      href={`/app/diseases/${disease.slug}`}
                      className={`block border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                        activeIndex === index
                          ? "bg-[#1A5276]/10"
                          : "bg-white hover:bg-slate-50"
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {disease.name}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                            {disease.description}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-[#1A5276]">
                          {disease.specialty.icon} {disease.specialty.name}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="specialty-filter"
          >
            Especialidad
          </label>
          <select
            id="specialty-filter"
            value={specialty}
            onChange={(event) => {
              setSpecialty(event.target.value);
              setIsOpen(true);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none transition focus:border-[#1A5276] focus:ring-2 focus:ring-[#1A5276]/20"
          >
            <option value="">
              {isLoadingSpecialties ? "Cargando..." : "Todas"}
            </option>
            {specialties?.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.icon} {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hasSearch ? (
        <p className="mt-4 text-sm text-slate-500">
          Busca por diagnóstico, síntoma o presentación clínica.
        </p>
      ) : null}
    </section>
  );
}

function DropdownState({
  text,
  tone = "muted"
}: Readonly<{
  text: string;
  tone?: "muted" | "error";
}>) {
  return (
    <p
      className={`px-4 py-5 text-sm ${
        tone === "error" ? "text-red-700" : "text-slate-500"
      }`}
    >
      {text}
    </p>
  );
}
