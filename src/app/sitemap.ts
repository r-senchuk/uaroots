import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site";
import { listResolvedRoutes } from "@/data/queries";
import { cityHubPaths } from "@/data/discovery";
import { cityHubContents } from "@/data/city-hubs";
import { cities } from "@/data/cities";
import { validateCatalog } from "@/lib/validate-catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalogErrors = validateCatalog();
  if (catalogErrors.length > 0) {
    throw new Error(`Catalog invalid:\n${catalogErrors.join("\n")}`);
  }

  const commercial = listResolvedRoutes("commercial");

  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/routes/") },
    { url: absoluteUrl("/about/") },
    { url: absoluteUrl("/imprint/") },
    { url: absoluteUrl("/privacy/") },
    ...commercial.map((route) => ({
      url: absoluteUrl(`/routes/${route.slug}/`),
    })),
    ...cityHubPaths.map((path) => {
      const slug = path.split("/")[2];
      const city = cities.find((candidate) => candidate.slug === slug);
      const content = city && cityHubContents.find((hub) => hub.cityId === city.id);
      return {
        url: absoluteUrl(path),
        ...(content ? { lastModified: content.contentReview.contentUpdatedAt } : {}),
      };
    }),
  ];
}
