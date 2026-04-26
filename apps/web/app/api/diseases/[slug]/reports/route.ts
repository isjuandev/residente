import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, getAccessToken, readApiError } from "../../../../_lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/diseases/${slug}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(await request.json())
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await readApiError(response, "No se pudo enviar reporte") },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
