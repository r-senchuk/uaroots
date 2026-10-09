import { cities } from "@/data/cities";
import { routes } from "@/data/routes";
import { ctaLocations, partnerUtm } from "@/config/utm";

export const siteConfig = {
  name: "UARoute",
  domain: "https://uaroute.com",
  description:
    "Поїздки між Україною та Німеччиною — вибір напрямку та запит перевізнику Коваль. Можливість і умови поїздки погоджуйте безпосередньо з перевізником.",
  campaign: partnerUtm.campaign,
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

const requestCodePattern = /^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}$/;
const approvedPartnerHosts = new Set(["4k-koval.com", "www.4k-koval.com"]);
const approvedPlacements = ctaLocations;
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
  parsed.searchParams.set("utm_source", partnerUtm.source);
  parsed.searchParams.set("utm_medium", partnerUtm.medium);
  parsed.searchParams.set("utm_campaign", siteConfig.campaign);
  const safeContent = approvedUtmContent.has(content) ? content : "partner_referral";
  parsed.searchParams.set("utm_content", safeContent);
  parsed.searchParams.delete("ref_code");
  parsed.searchParams.delete("origin_city_id");
  parsed.searchParams.delete("destination_city_id");
  if (referral?.requestCode && requestCodePattern.test(referral.requestCode)) {
    parsed.searchParams.set("ref_code", referral.requestCode);
  }
  const origin = cities.find((city) => city.id === referral?.originCityId);
  const destination = cities.find((city) => city.id === referral?.destinationCityId);
  if (origin && destination && origin.country !== destination.country) {
    parsed.searchParams.set("origin_city_id", origin.id);
    parsed.searchParams.set("destination_city_id", destination.id);
  }
  return parsed.toString();
}

/** Build-time handoff artifact: safe public enums, no visitor data or identity. */
export function getReferralContract() {
  return {
    version: 1,
    service: "passenger_inquiry",
    utm: partnerUtm,
    approvedContent: [...approvedUtmContent].sort(),
    approvedHosts: [...approvedPartnerHosts].sort(),
    codePattern: requestCodePattern.source,
    cities: cities.map(({ id, country }) => ({ id, country })),
    cityPairRule: "complete_known_opposite_countries",
    supportedReceiverPaths: ["/", "/about", "/contacts", "/gallery"],
    retention: "current_visit_memory_and_validated_tagged_navigation",
    excludedReceiverPaths: ["/packages"],
  };
}
