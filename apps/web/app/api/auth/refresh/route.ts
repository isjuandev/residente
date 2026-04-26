import { NextResponse } from "next/server";
import {
  API_BASE_URL,
  ACCESS_TOKEN_COOKIE,
  getRefreshToken,
  readApiError
} from "../../../_lib/auth";

const secureCookie = process.env.NODE_ENV === "production";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
  }

  const apiResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  });

  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: await readApiError(apiResponse, "Sesión expirada") },
      { status: apiResponse.status }
    );
  }

  const data = (await apiResponse.json()) as { accessToken: string };
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 15 * 60
  });

  return response;
}
