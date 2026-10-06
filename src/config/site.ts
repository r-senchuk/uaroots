import { cities } from "@/data/cities";
import { routes } from "@/data/routes";

export const siteConfig = {
  name: "UARoute",
  domain: "https://uaroute.com",
  description:
    "Поїздки між Україною та Німеччиною — вибір напрямку та запит перевізнику Коваль. Можливість і умови поїздки погоджуйте безпосередньо з перевізником.",
  campaign: "koval_poc",
} as const;

/** Absolute URL for canonical / og:url / WhatsApp message links. */
export function absoluteUrl(path: string): string {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  if (withSlash === "/") return `${siteConfig.domain}/`;
  if (/\.[a-z0-9]+$/i.test(withSlash)) {
    return `${siteConfig.domain}${withSlash}`;
  }
  const normalized = withSlash.endsWith("/") ? withSlash : `${withSlash}/`;
  return `${siteConfig.domain}${normalized}`;
}

export type ReferralContext = {
  /** Random opaque UR code. Never include traveller-entered text here. */
  requestCode?: string;
  originCityId?: string;
  destinationCityId?: string;
};

const cityIdPattern = /^[a-z0-9-]{1,40}$/;
const requestCodePattern = /^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}$/;
const approvedCityIds = new Set(cities.map((city) => city.id));
const approvedPartnerHosts = new Set(["4k-koval.com", "www.4k-koval.com"]);
const approvedPlacements = [
  "hero",
  "booking_widget",
  "partner_card",
  "related_route",
  "sticky_mobile",
  "footer",
  "route_index",
] as const;
const approvedUtmContent = new Set([
  "candidate_inquiry",
  "footer",
  "partner_referral",
  ...approvedPlacements.map((placement) => `site_${placement}`),
  ...routes.flatMap((route) => [
    ...approvedPlacements.map((placement) => `${route.slug}_${placement}`),
    `${route.slug}_inquiry_fallback`,
  ]),
]);

/** Programmatic UTM tagging for outbound partner links. Never used in WhatsApp text. */
export function withUtm(url: string, content: string, referral?: ReferralContext): string {
  const parsed = new URL(url);
  const hostname = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:" || !approvedPartnerHosts.has(hostname)) {
    throw new Error("Outbound UTM links are limited to the verified Koval website");
  }
  parsed.search = "";
  parsed.hash = "";
  parsed.searchParams.set("utm_source", "uaroute");
  parsed.searchParams.set("utm_medium", "referral");
  parsed.searchParams.set("utm_campaign", siteConfig.campaign);
  const safeContent = approvedUtmContent.has(content) ? content : "partner_referral";
  parsed.searchParams.set("utm_content", safeContent);
  parsed.searchParams.delete("ref_code");
  parsed.searchParams.delete("origin_city_id");
  parsed.searchParams.delete("destination_city_id");
  if (referral?.requestCode && requestCodePattern.test(referral.requestCode)) {
    parsed.searchParams.set("ref_code", referral.requestCode);
  }
  if (
    referral?.originCityId &&
    cityIdPattern.test(referral.originCityId) &&
    approvedCityIds.has(referral.originCityId)
  ) {
    parsed.searchParams.set("origin_city_id", referral.originCityId);
  }
  if (
    referral?.destinationCityId &&
    cityIdPattern.test(referral.destinationCityId) &&
    approvedCityIds.has(referral.destinationCityId)
  ) {
    parsed.searchParams.set("destination_city_id", referral.destinationCityId);
  }
  return parsed.toString();
}
