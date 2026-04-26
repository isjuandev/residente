"use client";

import { DragEvent, useRef, useState } from "react";

const allowedTypes = new Set([
  "image/svg+xml",
  "image/jpeg",
  "image/png",
  "image/webp"
]);
const maxSizeBytes = 10 * 1024 * 1024;

interface UploadResponse {
  id: string;
  url: string;
  key: string;
}

export function FlowchartUploader({
  value,
  onChange
}: Readonly<{
  value?: string;
  onChange: (url: string) => void;
}>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);

  function validate(file: File) {
    if (!allowedTypes.has(file.type)) {
      return "Formato inválido. Usa SVG, JPG, PNG o WebP.";
    }

    if (file.size > maxSizeBytes) {
      return "El archivo supera el límite de 10MB.";
    }

    return null;
  }

  function upload(file: File) {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", "flowcharts");

    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/media/upload");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      setProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      setIsUploading(false);

      if (request.status < 200 || request.status >= 300) {
        setError(readUploadError(request.responseText));
        return;
      }

      const response = JSON.parse(request.responseText) as UploadResponse;
      setUploadedKey(response.key);
      onChange(response.url);
      setProgress(100);
    };

    request.onerror = () => {
      setIsUploading(false);
      setError("No se pudo subir el archivo. Revisa tu conexión.");
    };

    request.send(formData);
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    upload(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function clear() {
    onChange("");
    setUploadedKey(null);
    setProgress(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-4 transition ${
          isDragging
            ? "border-[#1A5276] bg-[#1A5276]/5"
            : "border-slate-300 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <div className="flex flex-col gap-3">
          <div>
            <p className="font-medium text-slate-900">Flujograma</p>
            <p className="mt-1 text-sm text-slate-500">
              Arrastra un SVG o imagen, o selecciona un archivo. Máximo 10MB.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="rounded-md bg-[#1A5276] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {value ? "Reemplazar" : "Seleccionar"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={clear}
                disabled={isUploading}
                className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
              >
                Eliminar
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {isUploading ? (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-[#1A5276] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">Subiendo {progress}%</p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {value ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-xs text-slate-500">{uploadedKey ?? value}</p>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs font-semibold text-[#1A5276]"
            >
              Abrir
            </a>
          </div>
          <div className="mt-3 flex h-48 items-center justify-center overflow-hidden rounded-md bg-slate-50">
            <img
              src={value}
              alt="Preview del flujograma"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function readUploadError(responseText: string) {
  try {
    const data = JSON.parse(responseText) as { error?: string; message?: string };
    return data.error ?? data.message ?? "No se pudo subir el archivo.";
  } catch {
    return "No se pudo subir el archivo.";
  }
}
