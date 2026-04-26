import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, getAccessToken, readApiError } from "../../../../_lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

async function authHeaders() {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const response = await fetch(`${API_BASE_URL}/api/diseases/${id}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(await request.json())
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await readApiError(response, "No se pudo actualizar") },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/diseases/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await readApiError(response, "No se pudo eliminar") },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
