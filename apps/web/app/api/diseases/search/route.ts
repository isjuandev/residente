import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, readApiError } from "../../../_lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const apiUrl = new URL(`${API_BASE_URL}/api/diseases/search`);

  for (const [key, value] of searchParams.entries()) {
    apiUrl.searchParams.set(key, value);
  }

  const apiResponse = await fetch(apiUrl, {
    cache: "no-store"
  });

  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: await readApiError(apiResponse, "No se pudo buscar") },
      { status: apiResponse.status }
    );
  }

  return NextResponse.json(await apiResponse.json());
}
