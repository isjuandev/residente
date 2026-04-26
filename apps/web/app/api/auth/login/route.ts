import { NextResponse } from "next/server";
import { API_BASE_URL, readApiError, setAuthCookies } from "../../../_lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const apiResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: await readApiError(apiResponse, "Credenciales inválidas") },
      { status: apiResponse.status }
    );
  }

  const data = await apiResponse.json();
  const response = NextResponse.json({ user: data.user });
  setAuthCookies(response, data);

  return response;
}
