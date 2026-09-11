/**
 * Vendor-neutral analytics façade. Components never import an analytics SDK.
 * Phone numbers, names and other personal data must never be sent here.
 */

export type AnalyticsEvent =
  | "route_search_completed"
  | "route_view"
  | "booking_intent"
  | "whatsapp_click"
  | "koval_site_click"
  | "related_route_click";

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
  origin?: string;
  destination?: string;
  destinationCountry?: string;
  travelDate?: string;
  passengerCount?: number;
  ctaLocation?: CtaLocation;
  conversionType?: ConversionType;
  leadId?: string;
  deskId?: string;
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
  }
}

function attributionFromUrl(): Pick<
  AnalyticsContext,
  "source" | "medium" | "campaign" | "landingPage"
> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const attribution: Pick<AnalyticsContext, "source" | "medium" | "campaign" | "landingPage"> = {
    landingPage: window.location.pathname,
  };

  const source = params.get("utm_source");
  if (source) attribution.source = source;
  const medium = params.get("utm_medium");
  if (medium) attribution.medium = medium;
  const campaign = params.get("utm_campaign");
  if (campaign) attribution.campaign = campaign;

  return attribution;
}

export function track(event: AnalyticsEvent, context: AnalyticsContext = {}): void {
  if (typeof window === "undefined") return;

  const payload: TrackedEvent = {
    event,
    timestamp: new Date().toISOString(),
    ...attributionFromUrl(),
    ...context,
  };

  window.__uarouteEvents = window.__uarouteEvents ?? [];
  window.__uarouteEvents.push(payload);
  window.dataLayer?.push(payload);

  if (typeof window.gtag === "function") {
    window.gtag("event", event, {
      ...context,
      landing_page: payload.landingPage,
      source: payload.source,
      medium: payload.medium,
      campaign: payload.campaign,
    });
  }
}
