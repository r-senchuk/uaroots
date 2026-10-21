import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyticsConfiguration } from "@/config/analytics";
import { flushCurrentRouteView, resetAttributionForTests, track } from "./analytics";

describe("single consented analytics transport", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123456");
    vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "GTM-TEST123");
  });
  afterEach(() => { resetAttributionForTests(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  function browser(consent = true, ready = true) {
    const dataLayer: unknown[] = [];
    const gtag = vi.fn();
    const location = { pathname: "/", search: "?phone=private&utm_content=private", hash: "#private" };
    vi.stubGlobal("window", { location, dataLayer, gtag, __uarouteAnalyticsConsent: consent, __uarouteAnalyticsProviderReady: ready });
    return { dataLayer, gtag, location };
  }
  it("fails closed for incomplete, malformed or explicitly disabled configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    expect(analyticsConfiguration().enabled).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123456");
    vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "GTM-invalid");
    expect(analyticsConfiguration().enabled).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "GTM-TEST123");
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "false");
    expect(analyticsConfiguration().enabled).toBe(false);
  });
  it("sends one GTM envelope, strips inquiry IDs and raw URL data, and replaces sparse context", () => {
    const { dataLayer, gtag } = browser();
    track("booking_intent", { leadId: "UR-ABCDEFGHJK", origin: "lviv", destination: "celle" });
    track("page_view");
    expect(dataLayer).toHaveLength(4);
    expect(gtag).not.toHaveBeenCalled();
    const json = JSON.stringify(dataLayer);
    expect(json).not.toContain("UR-ABCDEFGHJK");
    expect(json).not.toContain("private");
    expect(window.__uarouteEvents?.[0].leadId).toBe("UR-ABCDEFGHJK");
    expect(dataLayer[3]).toMatchObject({ event: "uaroute_analytics", uaroute: { event_name: "page_view", parameters: { page_location: "https://uaroute.com/", page_referrer: "" } } });
    expect((dataLayer[3] as { uaroute: { parameters: object } }).uaroute.parameters).not.toHaveProperty("destination");
  });
  it("sends only the bounded Gemini label and medium to an enabled provider", () => {
    const { dataLayer } = browser();
    vi.stubGlobal("document", { referrer: "https://gemini.google.com/app/private?prompt=private" });
    track("page_view");
    const serialized = JSON.stringify(dataLayer);
    expect(serialized).toContain('"source":"gemini"');
    expect(serialized).toContain('"medium":"referral"');
    expect(serialized).not.toContain("gemini.google.com");
    expect(serialized).not.toContain("private");
  });
  it("normalizes Direct only at the Google boundary, preserving local first touch", () => {
    const { dataLayer, location } = browser();
    track("page_view");
    location.pathname = "/cities/celle/";
    track("whatsapp_click", { targetPath: "/cities/celle/" });
    for (const index of [1, 3]) {
      expect(dataLayer[index]).toMatchObject({ uaroute: { parameters: {
        source: "(direct)", medium: "(none)", landingPage: "/",
      } } });
    }
    expect(window.__uarouteEvents?.[1]).toMatchObject({
      source: "direct", medium: "direct", landingPage: "/", targetPath: "/cities/celle/",
    });
  });
  it.each([
    ["?utm_source=telegram&utm_medium=social&utm_campaign=m1", "telegram", "social", "m1"],
    ["?gclid=SYNTHETIC_CLICK_ID", "google", "cpc", undefined],
  ])("preserves approved acquisition on the provider boundary: %s", (search, source, medium, campaign) => {
    const { dataLayer, location } = browser();
    location.search = search;
    track("page_view");
    expect(dataLayer[1]).toMatchObject({ uaroute: { parameters: { source, medium } } });
    const parameters = (dataLayer[1] as { uaroute: { parameters: Record<string, unknown> } }).uaroute.parameters;
    expect(parameters.campaign).toBe(campaign);
  });
  it("keeps actions before consent or provider readiness local without replay", () => {
    const { dataLayer } = browser(false, false);
    track("whatsapp_click");
    window.__uarouteAnalyticsConsent = true;
    track("koval_site_click");
    window.__uarouteAnalyticsProviderReady = true;
    flushCurrentRouteView();
    expect(dataLayer).toHaveLength(0);
    track("koval_site_click");
    expect(dataLayer).toHaveLength(2);
    window.__uarouteAnalyticsConsent = false;
    track("koval_site_click");
    expect(dataLayer).toHaveLength(2);
  });
  it("flushes only the current page and route once when ready", () => {
    const { dataLayer, location } = browser(false, false);
    track("page_view");
    location.pathname = "/routes/dolyna-celle/";
    track("page_view");
    track("route_view", { routeId: "dolyna-celle" });
    window.__uarouteAnalyticsConsent = true;
    window.__uarouteAnalyticsProviderReady = true;
    flushCurrentRouteView(); flushCurrentRouteView();
    expect(dataLayer).toHaveLength(4);
    expect(JSON.stringify(dataLayer)).not.toContain('"page_location":"https://uaroute.com/"');
  });
  it("uses only gtag in the explicit legacy direct-GA configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "");
    const { dataLayer, gtag } = browser();
    track("whatsapp_click", { leadId: "UR-ABCDEFGHJK" });
    expect(gtag).toHaveBeenCalledOnce();
    expect(dataLayer).toHaveLength(0);
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("UR-ABCDEFGHJK");
    expect(gtag.mock.calls[0][2]).toMatchObject({ source: "(direct)", medium: "(none)" });
  });
});
