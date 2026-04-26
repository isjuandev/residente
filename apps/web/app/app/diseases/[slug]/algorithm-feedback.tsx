"use client";

import { useState } from "react";

const usefulReasons = ["Claro", "Completo", "Rápido de aplicar", "Buen soporte"];
const notUsefulReasons = [
  "Confuso",
  "Incompleto",
  "Difícil de aplicar",
  "Falta evidencia"
];
const reportReasons = [
  "Dato clínico incorrecto",
  "Referencia desactualizada",
  "Error en flujograma",
  "Otro"
];

type Rating = "USEFUL" | "NOT_USEFUL";

export function AlgorithmFeedback({ slug }: Readonly<{ slug: string }>) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [reportComment, setReportComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reasonOptions = rating === "NOT_USEFUL" ? notUsefulReasons : usefulReasons;

  function toggleReason(reason: string) {
    setReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  }

  async function submitFeedback() {
    if (!rating) {
      setError("Selecciona si el algoritmo fue útil.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/diseases/${slug}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, reasons, comment })
    });

    setIsSubmitting(false);
    if (!response.ok) {
      setError("No pudimos enviar tu feedback. Intenta nuevamente.");
      return;
    }

    setMessage("Gracias. Tu feedback ayuda a mejorar este algoritmo.");
    setComment("");
    setReasons([]);
  }

  async function submitReport() {
    if (reportComment.trim().length < 10) {
      setError("Describe el error con al menos 10 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/diseases/${slug}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason, comment: reportComment })
    });

    setIsSubmitting(false);
    if (!response.ok) {
      setError("No pudimos enviar el reporte. Intenta nuevamente.");
      return;
    }

    setMessage("Reporte recibido. El equipo médico lo revisará.");
    setReportComment("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-700">
          ¿Este algoritmo te resultó útil?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setRating("USEFUL");
              setReasons([]);
            }}
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${
              rating === "USEFUL"
                ? "border-[#1A5276] bg-[#1A5276] text-white"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Útil
          </button>
          <button
            type="button"
            onClick={() => {
              setRating("NOT_USEFUL");
              setReasons([]);
            }}
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${
              rating === "NOT_USEFUL"
                ? "border-[#1A5276] bg-[#1A5276] text-white"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            No útil
          </button>
        </div>
      </div>

      {rating ? (
        <div>
          <p className="text-sm font-medium text-slate-700">Razones</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {reasonOptions.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => toggleReason(reason)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  reasons.includes(reason)
                    ? "border-[#1A5276] bg-[#1A5276]/10 text-[#1A5276]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Comentario opcional
        </span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1A5276] focus:ring-2 focus:ring-[#1A5276]/20"
          placeholder="Cuéntanos qué mejorarías"
        />
      </label>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={submitFeedback}
        className="rounded-md bg-[#1A5276] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Enviar feedback
      </button>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="font-semibold text-slate-950">Reportar un error</h3>
        <div className="mt-3 grid gap-3">
          <select
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1A5276] focus:ring-2 focus:ring-[#1A5276]/20"
          >
            {reportReasons.map((reason) => (
              <option key={reason}>{reason}</option>
            ))}
          </select>
          <textarea
            value={reportComment}
            onChange={(event) => setReportComment(event.target.value)}
            rows={4}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1A5276] focus:ring-2 focus:ring-[#1A5276]/20"
            placeholder="Describe el error y dónde aparece"
          />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={submitReport}
            className="w-fit rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Enviar reporte
          </button>
        </div>
      </div>

      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
