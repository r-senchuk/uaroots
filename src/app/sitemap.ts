import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site";
import { listResolvedRoutes } from "@/data/queries";
import { validateCatalog } from "@/lib/validate-catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalogErrors = validateCatalog();
  if (catalogErrors.length > 0) {
    throw new Error(`Catalog invalid:\n${catalogErrors.join("\n")}`);
  }

  const commercial = listResolvedRoutes("commercial");

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/routes/"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about/"), changeFrequency: "monthly", priority: 0.5 },
    ...commercial.map((route) => ({
      url: absoluteUrl(`/routes/${route.slug}/`),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
