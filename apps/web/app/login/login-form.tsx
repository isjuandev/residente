"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser } from "../_providers/user-provider";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useUser();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const data = (await response.json()) as {
      error?: string;
    };

    if (!response.ok) {
      setApiError(data.error ?? "No se pudo iniciar sesión");
      return;
    }

    await refreshUser();
    router.push(searchParams.get("next") ?? "/app");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-[#1A5276] focus:ring-2 focus:ring-[#1A5276]/20"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-2 text-sm text-red-700">{errors.email.message}</p>
        ) : null}
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-[#1A5276] focus:ring-2 focus:ring-[#1A5276]/20"
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-700">{errors.password.message}</p>
        ) : null}
      </div>

      {apiError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-[#1A5276] px-4 py-2.5 font-medium text-white transition hover:bg-[#164763] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="text-center text-sm text-slate-600">
        ¿No tienes cuenta?{" "}
        <Link className="font-medium text-[#1A5276]" href="/register">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
