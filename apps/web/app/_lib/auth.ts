import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AuthUser {
  id: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const ACCESS_TOKEN_COOKIE = "residente_access_token";
export const REFRESH_TOKEN_COOKIE = "residente_refresh_token";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3001";

const secureCookie = process.env.NODE_ENV === "production";

export function setAuthCookies(response: NextResponse, tokens: AuthResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 15 * 60
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 7 * 24 * 60 * 60
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 0
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 0
  });
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function readApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;

    return message ?? data.error ?? fallback;
  } catch {
    return fallback;
  }
}
