import { NextResponse } from "next/server";
import { API_BASE_URL, getAccessToken, readApiError } from "../../../_lib/auth";

export async function GET() {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/billing/status`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store"
  });
  if (!response.ok) {
    return NextResponse.json({ error: await readApiError(response, "No se pudo consultar el plan") }, { status: response.status });
  }
  return NextResponse.json(await response.json());
}
