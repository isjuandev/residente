import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  API_BASE_URL,
  getAccessToken,
  getRefreshToken,
  readApiError
} from "../../../_lib/auth";

const secureCookie = process.env.NODE_ENV === "production";

async function fetchMe(accessToken: string) {
  return fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });
}

export async function GET() {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const meResponse = await fetchMe(accessToken);

    if (meResponse.ok) {
      const user = await meResponse.json();
      return NextResponse.json({ user });
    }
  }

  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  });

  if (!refreshResponse.ok) {
    return NextResponse.json(
      { error: await readApiError(refreshResponse, "No autenticado") },
      { status: refreshResponse.status }
    );
  }

  const { accessToken: nextAccessToken } = (await refreshResponse.json()) as {
    accessToken: string;
  };
  const meResponse = await fetchMe(nextAccessToken);

  if (!meResponse.ok) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await meResponse.json();
  const response = NextResponse.json({ user });
  response.cookies.set(ACCESS_TOKEN_COOKIE, nextAccessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 15 * 60
  });

  return response;
}
