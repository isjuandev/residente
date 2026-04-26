import { NextResponse } from "next/server";
import { API_BASE_URL, readApiError } from "../../_lib/auth";

export async function GET() {
  const apiResponse = await fetch(`${API_BASE_URL}/api/specialties`, {
    cache: "no-store"
  });

  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: await readApiError(apiResponse, "No se pudieron cargar especialidades") },
      { status: apiResponse.status }
    );
  }

  return NextResponse.json(await apiResponse.json());
}
