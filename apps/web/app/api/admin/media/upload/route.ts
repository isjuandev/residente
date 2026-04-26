import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, getAccessToken, readApiError } from "../../../../_lib/auth";

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  const formData = await request.formData();
  const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await readApiError(response, "No se pudo subir el archivo") },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
