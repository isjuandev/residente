import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, getAccessToken, readApiError } from "../../../_lib/auth";

async function authHeaders() {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim();
  const path = q ? "/api/diseases/search" : "/api/diseases";
  const apiUrl = new URL(`${API_BASE_URL}${path}`);

  for (const [key, value] of searchParams.entries()) {
    if (key === "status") {
      if (value === "published") apiUrl.searchParams.set("isPublished", "true");
      if (value === "draft") apiUrl.searchParams.set("isPublished", "false");
      continue;
    }
    if (key === "q" && !q) continue;
    apiUrl.searchParams.set(key, key === "q" ? q ?? "" : value);
  }

  if (q && !apiUrl.searchParams.has("q")) apiUrl.searchParams.set("q", q);

  const response = await fetch(apiUrl, {
    headers: await authHeaders(),
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await readApiError(response, "No se pudieron cargar enfermedades") },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}

export async function POST(request: NextRequest) {
  const response = await fetch(`${API_BASE_URL}/api/diseases`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(await request.json())
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await readApiError(response, "No se pudo crear la enfermedad") },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json(), { status: 201 });
}
