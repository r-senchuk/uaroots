import { siteConfig } from "@/config/site";
import {
  acquisitionChannels,
  manualCampaigns,
  manualSources,
} from "@/config/utm";
import { routes } from "@/data/routes";
import { canonicalLandingPath } from "@/lib/analytics";

/** Generate reviewed external acquisition links, never internal navigation links. */
export function buildCampaignLink(
  path: string,
  source: string,
  campaign: string,
): string {
  const canonical = canonicalLandingPath(path);
  const route = routes.find((entry) => canonical === `/routes/${entry.slug}/`);
  if (!canonical || (route && route.status !== "commercial")) {
    throw new Error("Campaign links require a known indexable landing path");
  }
  if (
    !(manualSources as readonly string[]).includes(source) ||
    !(manualCampaigns as readonly string[]).includes(campaign)
  ) {
    throw new Error(
      "Campaign source and campaign must be approved manual values",
    );
  }
  const url = new URL(canonical, siteConfig.domain);
  url.searchParams.set("utm_source", source);
  url.searchParams.set(
    "utm_medium",
    acquisitionChannels[source as keyof typeof acquisitionChannels],
  );
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}
