"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import type { DiseaseDetail, DiseaseSpecialty } from "../../_lib/diseases";
import { FlowchartUploader } from "./flowchart-uploader";
import { TableBuilder, type ClinicalTableValue } from "./table-builder";

const stepSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  description: z.string().optional(),
  actionsText: z.string().optional()
});

const diseaseSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().min(10, "Descripción muy corta"),
  specialtyId: z.string().min(1, "Selecciona una especialidad"),
  clinicalPresentationsText: z.string().min(2, "Agrega presentaciones"),
  isPublished: z.boolean(),
  flowchartUrl: z.string().optional(),
  algorithmVersion: z.string().min(1),
  tables: z.array(
    z.object({
      title: z.string(),
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string()))
    })
  ),
  referencesText: z.string().optional(),
  steps: z.array(stepSchema).min(1)
});

type DiseaseFormValues = z.infer<typeof diseaseSchema>;

interface DiseasePage {
  data: DiseaseDetail[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Error de API");
  }
  return response.json() as Promise<T>;
};

const emptyValues: DiseaseFormValues = {
  name: "",
  slug: "",
  description: "",
  specialtyId: "",
  clinicalPresentationsText: "",
  isPublished: false,
  flowchartUrl: "",
  algorithmVersion: "1.0.0",
  tables: [],
  referencesText: "",
  steps: [{ title: "", description: "", actionsText: "" }]
};

export function DiseasesAdmin() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [specialtySlug, setSpecialtySlug] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<DiseaseDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const diseaseKey = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      status
    });
    if (query.trim()) params.set("q", query.trim());
    if (specialtySlug) params.set("specialtySlug", specialtySlug);
    return `/api/admin/diseases?${params}`;
  }, [page, query, specialtySlug, status]);

  const { data, error, isLoading, mutate } = useSWR<DiseasePage>(diseaseKey, fetcher);
  const { data: specialties = [] } = useSWR<DiseaseSpecialty[]>("/api/specialties", fetcher);

  const form = useForm<DiseaseFormValues>({
    resolver: zodResolver(diseaseSchema),
    defaultValues: emptyValues
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps"
  });
  const values = form.watch();

  useEffect(() => {
    if (!selectedDisease) {
      form.reset(emptyValues);
      return;
    }

    const algorithm = selectedDisease.algorithm;
    form.reset({
      name: selectedDisease.name,
      slug: selectedDisease.slug,
      description: selectedDisease.description,
      specialtyId: selectedDisease.specialty.id,
      clinicalPresentationsText: selectedDisease.clinicalPresentations.join(", "),
      isPublished: selectedDisease.isPublished,
      flowchartUrl: algorithm?.flowchartUrl ?? "",
      algorithmVersion: algorithm?.version ?? "1.0.0",
      tables: normalizeTables(algorithm?.tables),
      referencesText: algorithm?.references?.join("\n") ?? "",
      steps:
        algorithm?.steps?.length
          ? algorithm.steps.map((step) => ({
              title: step.title,
              description: step.description ?? "",
              actionsText: step.actions?.join("\n") ?? ""
            }))
          : [{ title: "", description: "", actionsText: "" }]
    });
  }, [form, selectedDisease]);

  async function submit(values: DiseaseFormValues, publish?: boolean) {
    setMessage(null);
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      specialtyId: values.specialtyId,
      clinicalPresentations: values.clinicalPresentationsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      isPublished: publish ?? values.isPublished,
      algorithm: {
        flowchartUrl: values.flowchartUrl,
        version: values.algorithmVersion,
        tables: values.tables,
        references: values.referencesText?.split("\n").map((item) => item.trim()).filter(Boolean) ?? [],
        steps: values.steps.map((step, index) => ({
          order: index + 1,
          title: step.title,
          description: step.description,
          actions: step.actionsText?.split("\n").map((item) => item.trim()).filter(Boolean) ?? []
        }))
      }
    };

    const response = await fetch(
      selectedDisease ? `/api/admin/diseases/${selectedDisease.id}` : "/api/admin/diseases",
      {
        method: selectedDisease ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "No se pudo guardar");
      return;
    }

    setMessage(publish ? "Publicado" : "Guardado");
    setSelectedDisease(await response.json());
    await mutate();
  }

  async function removeDisease(disease: DiseaseDetail) {
    if (!window.confirm(`Eliminar ${disease.name}?`)) return;
    await fetch(`/api/admin/diseases/${disease.id}`, { method: "DELETE" });
    if (selectedDisease?.id === disease.id) setSelectedDisease(null);
    await mutate();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_480px]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#1A5276]">Enfermedades</h2>
            <p className="mt-1 text-sm text-slate-600">Busca, filtra y edita contenido clínico.</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDisease(null)}
            className="rounded-md bg-[#1A5276] px-4 py-2 text-sm font-semibold text-white"
          >
            Nueva enfermedad
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre o presentación"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#1A5276]"
          />
          <select
            value={specialtySlug}
            onChange={(event) => {
              setSpecialtySlug(event.target.value);
              setPage(1);
            }}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Todas</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.slug}>{specialty.name}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="published">Publicadas</option>
            <option value="draft">Borradores</option>
          </select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-[#F8F9FA] text-left">
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Especialidad</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td className="px-3 py-6 text-slate-500" colSpan={4}>Cargando...</td></tr>
              ) : error ? (
                <tr><td className="px-3 py-6 text-red-700" colSpan={4}>{error.message}</td></tr>
              ) : data?.data.length ? (
                data.data.map((disease) => (
                  <tr key={disease.id} className="border-b last:border-b-0">
                    <td className="px-3 py-3 font-medium">{disease.name}</td>
                    <td className="px-3 py-3">{disease.specialty.icon} {disease.specialty.name}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        disease.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {disease.isPublished ? "Publicada" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button className="text-[#1A5276]" onClick={() => setSelectedDisease(disease)}>Editar</button>
                        <button className="text-red-700" onClick={() => removeDisease(disease)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-3 py-6 text-slate-500" colSpan={4}>Sin resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span>Total: {data?.meta.total ?? 0}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-50">Anterior</button>
            <span className="px-2 py-1">Página {page} de {data?.meta.totalPages ?? 1}</span>
            <button disabled={page >= (data?.meta.totalPages ?? 1)} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1A5276]">
          {selectedDisease ? "Editar enfermedad" : "Crear enfermedad"}
        </h2>
        {message ? <p className="mt-3 rounded-md bg-slate-100 px-3 py-2 text-sm">{message}</p> : null}
        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => submit(values))}>
          <Input label="Nombre" registration={form.register("name")} error={form.formState.errors.name?.message} />
          <Input label="Slug" registration={form.register("slug")} error={form.formState.errors.slug?.message} />
          <Textarea label="Descripción" registration={form.register("description")} error={form.formState.errors.description?.message} />
          <label className="block text-sm font-medium">
            Especialidad
            <select className="mt-1 w-full rounded-md border px-3 py-2" {...form.register("specialtyId")}>
              <option value="">Selecciona</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>{specialty.icon} {specialty.name}</option>
              ))}
            </select>
          </label>
          <Textarea label="Presentaciones clínicas (separadas por coma)" registration={form.register("clinicalPresentationsText")} error={form.formState.errors.clinicalPresentationsText?.message} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("isPublished")} />
            Publicada
          </label>

          <div className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-4">
            <h3 className="font-semibold text-[#1A5276]">Algoritmo</h3>
            <div className="mt-4 space-y-4">
              <Input label="Versión" registration={form.register("algorithmVersion")} error={form.formState.errors.algorithmVersion?.message} />
              <Input label="URL flujograma" registration={form.register("flowchartUrl")} error={form.formState.errors.flowchartUrl?.message} />
              <FlowchartUploader
                value={values.flowchartUrl}
                onChange={(url) =>
                  form.setValue("flowchartUrl", url, {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Pasos</h4>
                  <button type="button" onClick={() => append({ title: "", description: "", actionsText: "" })} className="text-sm text-[#1A5276]">Agregar paso</button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-md border bg-white p-3">
                    <Input label={`Paso ${index + 1}`} registration={form.register(`steps.${index}.title`)} error={form.formState.errors.steps?.[index]?.title?.message} />
                    <Textarea label="Descripción" registration={form.register(`steps.${index}.description`)} />
                    <Textarea label="Acciones (una por línea)" registration={form.register(`steps.${index}.actionsText`)} />
                    <button type="button" onClick={() => remove(index)} className="mt-2 text-sm text-red-700">Eliminar paso</button>
                  </div>
                ))}
              </div>

              <TableBuilder
                value={values.tables}
                onChange={(tables) =>
                  form.setValue("tables", tables, {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              />
              <Textarea label="Referencias (una por línea)" registration={form.register("referencesText")} rows={4} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded-md bg-[#1A5276] px-4 py-2 text-sm font-semibold text-white">Guardar</button>
            <button type="button" onClick={form.handleSubmit((values) => submit(values, true))} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Guardar y publicar</button>
            <button type="button" onClick={() => setPreviewOpen((value) => !value)} className="rounded-md border px-4 py-2 text-sm font-semibold">Preview</button>
          </div>
        </form>

        {previewOpen ? <Preview values={values} /> : null}
      </section>
    </div>
  );
}

function Input({ label, registration, error }: { label: string; registration: object; error?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input className="mt-1 w-full rounded-md border px-3 py-2" {...registration} />
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

function Textarea({ label, registration, error, rows = 3 }: { label: string; registration: object; error?: string; rows?: number }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <textarea rows={rows} className="mt-1 w-full rounded-md border px-3 py-2" {...registration} />
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

function Preview({ values }: { values: DiseaseFormValues }) {
  return (
    <div className="mt-6 rounded-lg border border-slate-200 p-4">
      <p className="text-sm font-semibold text-[#1A5276]">Preview</p>
      <h3 className="mt-2 text-xl font-semibold">{values.name || "Nombre"}</h3>
      <p className="mt-2 text-sm text-slate-600">{values.description || "Descripción"}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.clinicalPresentationsText.split(",").filter(Boolean).map((item) => (
          <span key={item} className="rounded-full bg-[#1A5276]/10 px-2 py-1 text-xs text-[#1A5276]">{item.trim()}</span>
        ))}
      </div>
      {values.flowchartUrl ? <img src={values.flowchartUrl} alt="Preview flujograma" className="mt-4 max-h-56 w-full object-contain" /> : null}
      {values.tables.length ? (
        <div className="mt-4 space-y-3">
          {values.tables.map((table, index) => (
            <div key={`${table.title}-${index}`} className="overflow-x-auto">
              <p className="mb-2 text-sm font-semibold">{table.title}</p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {table.headers.map((header, headerIndex) => (
                      <th key={headerIndex} className="border px-2 py-1 text-left">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {table.headers.map((_, columnIndex) => (
                        <td key={columnIndex} className="border px-2 py-1">
                          {row[columnIndex] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function normalizeTables(tables: unknown): ClinicalTableValue[] {
  if (!tables) return [];

  if (Array.isArray(tables)) {
    return tables.map((table, index) => {
      const candidate = table as Partial<ClinicalTableValue>;
      const headers = Array.isArray(candidate.headers)
        ? candidate.headers.map(String)
        : ["Columna 1"];
      const rows = Array.isArray(candidate.rows)
        ? candidate.rows.map((row) =>
            Array.isArray(row) ? row.map(String) : headers.map(() => "")
          )
        : [];

      return {
        title: String(candidate.title ?? `Tabla ${index + 1}`),
        headers,
        rows
      };
    });
  }

  if (typeof tables === "object") {
    return Object.entries(tables as Record<string, unknown>).map(
      ([title, value]) => ({
        title,
        headers: ["Elemento"],
        rows: Array.isArray(value)
          ? value.map((item) => [String(item)])
          : [[String(value)]]
      })
    );
  }

  return [];
}
