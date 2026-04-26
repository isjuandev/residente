import type { MetadataRoute } from "next";
import { getDiseasesForSitemap } from "./_lib/diseases";
import { absoluteUrl } from "./_lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const diseases = await getDiseasesForSitemap();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: absoluteUrl("/login"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1
    },
    {
      url: absoluteUrl("/register"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1
    }
  ];

  return [
    ...staticRoutes,
    ...diseases.map((disease) => ({
      url: absoluteUrl(`/app/diseases/${disease.slug}`),
      lastModified: disease.updatedAt ? new Date(disease.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
