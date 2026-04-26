import { ImageResponse } from "next/og";
import { getDisease } from "../../../_lib/diseases";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function DiseaseOpenGraphImage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const disease = await getDisease(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F8F9FA",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          color: "#0f172a"
        }}
      >
        <div style={{ color: "#1A5276", fontSize: 30, fontWeight: 700 }}>
          Residente
        </div>
        <div style={{ marginTop: 22, color: "#1A5276", fontSize: 34 }}>
          {disease?.specialty.icon} {disease?.specialty.name ?? "Algoritmo clínico"}
        </div>
        <div style={{ marginTop: 22, maxWidth: 980, fontSize: 68, fontWeight: 800 }}>
          {disease?.name ?? "Enfermedad"}
        </div>
        <div style={{ marginTop: 24, maxWidth: 920, fontSize: 28, lineHeight: 1.35 }}>
          {disease?.description ?? "Flujogramas y referencias clínicas."}
        </div>
      </div>
    ),
    size
  );
}
