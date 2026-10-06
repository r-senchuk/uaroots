/**
 * Vendor-neutral analytics façade. Only bounded catalog values and explicit
 * nonpersonal fields can leave this module. Inquiry dates and contact details
 * are intentionally absent from the runtime event allowlist.
 */
import { cities } from "@/data/cities";
import { cityHubPaths } from "@/data/discovery";
import { routes } from "@/data/routes";
import { siteConfig } from "@/config/site";

export type AnalyticsEvent =
  | "route_search_completed"
  | "route_view"
  | "booking_intent"
  | "whatsapp_click"
  | "koval_site_click"
  | "related_route_click";

const approvedEvents = new Set<AnalyticsEvent>([
  "route_search_completed",
  "route_view",
  "booking_intent",
  "whatsapp_click",
  "koval_site_click",
  "related_route_click",
]);

export type CtaLocation =
  | "hero"
  | "booking_widget"
  | "partner_card"
  | "related_route"
  | "sticky_mobile"
  | "footer"
  | "route_index";

export type ConversionType = "whatsapp_inquiry" | "koval_site";

export type AnalyticsContext = {
  source?: string;
  medium?: string;
  campaign?: string;
  landingPage?: string;
  routeSlug?: string;
  routeId?: string;
  origin?: string;
  destination?: string;
  destinationCountry?: string;
  passengerCount?: number;
  ctaLocation?: CtaLocation;
  conversionType?: ConversionType;
  leadId?: string;
  deskId?: string;
  searchOrigin?: string;
  searchDestination?: string;
  resultCount?: number;
  matchedRouteId?: string;
  sourceRouteId?: string;
  targetRouteId?: string;
  placement?: string;
  targetPath?: string;
  routeStatus?: "commercial" | "editorial";
};

type TrackedEvent = AnalyticsContext & {
  event: AnalyticsEvent;
  timestamp: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __uarouteEvents?: TrackedEvent[];
    __uarouteAnalyticsConsent?: boolean;
    __uarouteAnalyticsPageLocation?: string;
    __uarouteAnalyticsProviderReady?: boolean;
  }
}

const approvedSources = new Set([
  "google",
  "facebook",
  "koval",
  "bing",
  "chatgpt",
  "telegram",
  "direct",
  "unknown",
]);
const approvedMediums = new Set(["organic", "social", "referral", "direct"]);
const approvedCampaigns = new Set(["route_launch", "m1", "koval_poc"]);
const approvedCtaLocations = new Set<CtaLocation>([
  "hero",
  "booking_widget",
  "partner_card",
  "related_route",
  "sticky_mobile",
  "footer",
  "route_index",
]);
const approvedConversionTypes = new Set<ConversionType>(["whatsapp_inquiry", "koval_site"]);
const cityIds = new Set(cities.map((city) => city.id));
const routeSlugs = new Set(routes.map((route) => route.slug));
const routeIds = new Set(routes.map((route) => route.id));
const cityCountries = new Set(cities.map((city) => city.country));
const deskIds = new Set(["koval-de", "koval-at"]);
function analyticsIsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

type Attribution = Pick<AnalyticsContext, "source" | "medium" | "campaign" | "landingPage">;

let firstTouch: Attribution | null = null;
type RouteViewSnapshot = {
  payload: TrackedEvent;
  pageLocation: string;
  delivered: boolean;
};
let latestRouteView: RouteViewSnapshot | null = null;

const referrerFamilies: Array<{ source: string; medium: string; domains: string[] }> = [
  {
    source: "google",
    medium: "organic",
    domains: [
      "google.com",
      "google.de",
      "google.com.ua",
      "google.pl",
      "google.co.uk",
      "google.fr",
      "google.es",
      "google.it",
      "google.at",
      "google.ch",
      "google.nl",
      "google.cz",
    ],
  },
  { source: "bing", medium: "organic", domains: ["bing.com"] },
  { source: "chatgpt", medium: "referral", domains: ["chatgpt.com"] },
  { source: "koval", medium: "referral", domains: ["4k-koval.com"] },
  { source: "facebook", medium: "social", domains: ["facebook.com"] },
  { source: "telegram", medium: "social", domains: ["telegram.org", "t.me"] },
];

function referralAttribution(referrer: string): Pick<Attribution, "source" | "medium"> {
  if (!referrer) return { source: "direct", medium: "direct" };
  try {
    const parsed = new URL(referrer);
    const hostname = parsed.hostname.toLowerCase();
    const siteHostname = new URL(siteConfig.domain).hostname.toLowerCase();
    if (
      (typeof window !== "undefined" && parsed.origin === window.location.origin) ||
      hostname === siteHostname ||
      hostname.endsWith(`.${siteHostname}`)
    ) {
      return { source: "direct", medium: "direct" };
    }
    for (const family of referrerFamilies) {
      if (family.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
        return { source: family.source, medium: family.medium };
      }
    }
    return { source: "unknown", medium: "referral" };
  } catch {
    return { source: "unknown", medium: "referral" };
  }
}

/** Return only a canonical path for one of the site's known static pages. */
export function canonicalLandingPath(pathname: string): string | undefined {
  if (pathname === "/") return "/";
  if (pathname === "/about" || pathname === "/about/") return "/about/";
  if (pathname === "/imprint" || pathname === "/imprint/") return "/imprint/";
  if (pathname === "/privacy" || pathname === "/privacy/") return "/privacy/";
  if (pathname === "/routes" || pathname === "/routes/") return "/routes/";
  if ((cityHubPaths as readonly string[]).includes(pathname)) return pathname;
  const hubPath = cityHubPaths.find((path) => path.slice(0, -1) === pathname);
  if (hubPath) return hubPath;
  const match = /^\/routes\/([a-z0-9-]+)\/?$/.exec(pathname);
  if (match?.[1] && routeSlugs.has(match[1])) return `/routes/${match[1]}/`;
  return undefined;
}

/** Capture first-touch acquisition once per page session, in memory only. */
export function captureLandingAttribution(): Attribution {
  if (firstTouch) return { ...firstTouch };
  if (typeof window === "undefined") return {};

  const landingPage = canonicalLandingPath(window.location.pathname);
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source") ?? undefined;
  const medium = params.get("utm_medium") ?? undefined;
  const campaign = params.get("utm_campaign") ?? undefined;
  const referral = referralAttribution(typeof document === "undefined" ? "" : document.referrer);
  firstTouch = {
    ...(source && approvedSources.has(source) ? { source } : { source: referral.source }),
    ...(medium && approvedMediums.has(medium) ? { medium } : { medium: referral.medium }),
    ...(campaign && approvedCampaigns.has(campaign) ? { campaign } : {}),
    ...(landingPage ? { landingPage } : {}),
  };
  window.__uarouteAnalyticsPageLocation = currentPageLocation();
  return { ...firstTouch };
}

/** Naming used by the root-mounted bootstrap component. */
export const captureAttribution = captureLandingAttribution;

function isSafePath(value: unknown): value is string {
  return typeof value === "string" && canonicalLandingPath(value) === value;
}

function currentPageLocation(): string {
  const path =
    typeof window === "undefined" ? undefined : canonicalLandingPath(window.location.pathname);
  return `${siteConfig.domain}${path ?? "/"}`;
}

function isSafeRoute(value: unknown): value is string {
  return typeof value === "string" && (routeSlugs.has(value) || routeIds.has(value));
}

function isSafeCity(value: unknown): value is string {
  return typeof value === "string" && cityIds.has(value);
}

/** Pure allowlist sanitizer, also used by tests and useful for adapter audits. */
export function sanitizeAnalyticsContext(context: Record<string, unknown>): AnalyticsContext {
  const safe: AnalyticsContext = {};
  if (typeof context.source === "string" && approvedSources.has(context.source)) {
    safe.source = context.source;
  }
  if (typeof context.medium === "string" && approvedMediums.has(context.medium)) {
    safe.medium = context.medium;
  }
  if (typeof context.campaign === "string" && approvedCampaigns.has(context.campaign)) {
    safe.campaign = context.campaign;
  }
  if (isSafePath(context.landingPage)) safe.landingPage = context.landingPage;
  if (isSafeRoute(context.routeSlug)) safe.routeSlug = context.routeSlug;
  if (isSafeRoute(context.routeId)) safe.routeId = context.routeId;
  if (isSafeCity(context.origin)) safe.origin = context.origin;
  if (isSafeCity(context.destination)) safe.destination = context.destination;
  if (typeof context.destinationCountry === "string" && cityCountries.has(context.destinationCountry)) {
    safe.destinationCountry = context.destinationCountry;
  }
  if (Number.isInteger(context.passengerCount) && Number(context.passengerCount) >= 1 && Number(context.passengerCount) <= 8) {
    safe.passengerCount = Number(context.passengerCount);
  }
  if (typeof context.ctaLocation === "string" && approvedCtaLocations.has(context.ctaLocation as CtaLocation)) {
    safe.ctaLocation = context.ctaLocation as CtaLocation;
  }
  if (
    typeof context.conversionType === "string" &&
    approvedConversionTypes.has(context.conversionType as ConversionType)
  ) {
    safe.conversionType = context.conversionType as ConversionType;
  }
  if (
    typeof context.leadId === "string" &&
    /^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}$/.test(context.leadId)
  ) {
    safe.leadId = context.leadId;
  }
  if (typeof context.deskId === "string" && deskIds.has(context.deskId)) safe.deskId = context.deskId;
  if (isSafeCity(context.searchOrigin)) safe.searchOrigin = context.searchOrigin;
  if (isSafeCity(context.searchDestination)) safe.searchDestination = context.searchDestination;
  if (Number.isInteger(context.resultCount) && Number(context.resultCount) >= 0 && Number(context.resultCount) <= 100) {
    safe.resultCount = Number(context.resultCount);
  }
  if (context.matchedRouteId === null) {
    safe.matchedRouteId = undefined;
  } else if (isSafeRoute(context.matchedRouteId)) {
    safe.matchedRouteId = context.matchedRouteId;
  }
  if (isSafeRoute(context.sourceRouteId)) safe.sourceRouteId = context.sourceRouteId;
  if (isSafeRoute(context.targetRouteId)) safe.targetRouteId = context.targetRouteId;
  if (context.placement === "related_route") safe.placement = "related_route";
  if (isSafePath(context.targetPath)) safe.targetPath = context.targetPath;
  if (context.routeStatus === "commercial" || context.routeStatus === "editorial") {
    safe.routeStatus = context.routeStatus;
  }
  return safe;
}

function emitToLocalBuffer(payload: TrackedEvent): void {
  try {
    window.__uarouteEvents = window.__uarouteEvents ?? [];
    window.__uarouteEvents.push(payload);
  } catch {
    // A frozen or unavailable local sink must not interrupt navigation.
  }
}

function emitToDataLayer(payload: TrackedEvent): void {
  if (!analyticsIsEnabled() || window.__uarouteAnalyticsConsent !== true) return;
  try {
    window.dataLayer?.push(payload);
  } catch {
    // Analytics sinks are optional and must not break the user flow.
  }
}

function emitToGtag(payload: TrackedEvent): void {
  if (!analyticsIsEnabled() || window.__uarouteAnalyticsConsent !== true) return;
  try {
    if (typeof window.gtag === "function") {
      const { event, timestamp, ...context } = payload;
      window.gtag("event", event, {
        ...context,
        event_timestamp: timestamp,
        page_location: window.__uarouteAnalyticsPageLocation ?? currentPageLocation(),
        page_referrer: "",
      });
    }
  } catch {
    // Analytics sinks are optional and must not break the user flow.
  }
}

function emitRouteView(snapshot: RouteViewSnapshot): void {
  if (
    !analyticsIsEnabled() ||
    window.__uarouteAnalyticsConsent !== true ||
    window.__uarouteAnalyticsProviderReady !== true ||
    snapshot.delivered ||
    currentPageLocation() !== snapshot.pageLocation
  ) {
    return;
  }

  // Claim delivery before calling optional sinks so repeated readiness signals
  // cannot duplicate a route view, even if an adapter throws or re-enters.
  snapshot.delivered = true;
  emitToDataLayer(snapshot.payload);
  emitToGtag(snapshot.payload);
}

/** Deliver only the latest route view when consent and the provider are ready. */
export function flushCurrentRouteView(): void {
  if (typeof window === "undefined" || !latestRouteView) return;
  emitRouteView(latestRouteView);
}

export function track(event: AnalyticsEvent, context: AnalyticsContext = {}): void {
  if (typeof window === "undefined") return;
  if (!approvedEvents.has(event)) return;
  const acquisition = captureLandingAttribution();
  const safeContext = sanitizeAnalyticsContext(context);
  const pageLocation = currentPageLocation();
  window.__uarouteAnalyticsPageLocation = pageLocation;
  const payload: TrackedEvent = {
    ...safeContext,
    ...acquisition,
    event,
    timestamp: new Date().toISOString(),
  };

  emitToLocalBuffer(payload);
  if (event === "route_view") {
    latestRouteView = {
      payload,
      pageLocation,
      delivered: false,
    };
    emitRouteView(latestRouteView);
    return;
  }
  emitToDataLayer(payload);
  emitToGtag(payload);
}

/** Test helper; attribution itself remains memory-only during normal use. */
export function resetAttributionForTests(): void {
  firstTouch = null;
  latestRouteView = null;
}
