import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <div style={{ color: "#1A5276", fontSize: 32, fontWeight: 700 }}>
          Residente
        </div>
        <div style={{ marginTop: 28, fontSize: 78, fontWeight: 800 }}>
          Algoritmos médicos
        </div>
        <div style={{ marginTop: 24, maxWidth: 900, fontSize: 34 }}>
          Flujogramas, tablas y referencias clínicas por especialidad.
        </div>
      </div>
    ),
    size
  );
}
