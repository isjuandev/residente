import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, getAccessToken, readApiError } from "../../../_lib/auth";

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/billing/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(await request.json())
  });
  if (!response.ok) {
    return NextResponse.json({ error: await readApiError(response, "No se pudo iniciar checkout") }, { status: response.status });
  }
  return NextResponse.json(await response.json());
}
