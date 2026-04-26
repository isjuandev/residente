import type { MetadataRoute } from "next";
import { absoluteUrl } from "./_lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/app/diseases/"],
        disallow: ["/admin/", "/api/", "/app"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
