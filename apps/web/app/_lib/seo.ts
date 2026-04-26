export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://residente.app";

export const siteMetadata = {
  name: "Residente",
  description:
    "Algoritmos médicos, flujogramas y referencias clínicas organizadas por especialidad.",
  locale: "es_CO"
};

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
