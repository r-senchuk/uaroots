import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  captureAttribution,
  canonicalLandingPath,
  flushCurrentRouteView,
  resetAttributionForTests,
  sanitizeAnalyticsContext,
  track,
} from "./analytics";

describe("analytics privacy boundary", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "GTM-TEST123");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123456");
  });
  afterEach(() => {
    resetAttributionForTests();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("allows only the two published city hub landing paths", () => {
    expect(canonicalLandingPath("/cities/lviv")).toBe("/cities/lviv/");
    expect(canonicalLandingPath("/cities/lviv/")).toBe("/cities/lviv/");
    expect(canonicalLandingPath("/cities/ivano-frankivsk/")).toBe("/cities/ivano-frankivsk/");
    expect(canonicalLandingPath("/cities/unknown/")).toBeUndefined();
    expect(canonicalLandingPath("/cities/lviv/?phone=123")).toBeUndefined();
    expect(canonicalLandingPath("/cities/lviv/extra/")).toBeUndefined();
  });

  it("keeps first-touch acquisition while recording the current inquiry page separately", () => {
    const location = { origin: "https://uaroute.com", pathname: "/", search: "?utm_source=google&utm_medium=organic" };
    vi.stubGlobal("window", {
      location,
      __uarouteEvents: [],
      __uarouteAnalyticsConsent: false,
    });
    captureAttribution();
    location.pathname = "/cities/lviv/";
    location.search = "";
    track("booking_intent", {
      origin: "lviv",
      destination: "celle",
      landingPage: "/cities/lviv/",
      targetPath: "/cities/lviv/",
      source: "koval",
      medium: "referral",
      ctaLocation: "route_index",
      travelDate: "2030-01-01",
      phone: "+380501234567",
    } as never);

    expect(window.__uarouteEvents?.[0]).toMatchObject({
      landingPage: "/",
      targetPath: "/cities/lviv/",
      source: "google",
      medium: "organic",
      ctaLocation: "route_index",
      origin: "lviv",
      destination: "celle",
    });
    expect(JSON.stringify(window.__uarouteEvents?.[0])).not.toContain("2030-01-01");
    expect(JSON.stringify(window.__uarouteEvents?.[0])).not.toContain("+380501234567");
  });

  it("drops travel dates, contact data, arbitrary context, and unapproved UTM values", () => {
    const safe = sanitizeAnalyticsContext({
      source: "attacker-value",
      medium: "social",
      campaign: "m1",
      landingPage: "/routes/lviv-hannover/?phone=123",
      routeSlug: "lviv-hannover",
      origin: "lviv",
      destination: "hannover",
      passengerCount: 2,
      ctaLocation: "booking_widget",
      conversionType: "whatsapp_inquiry",
      leadId: "UR-ABCDEFGHJK",
      deskId: "koval-de",
      travelDate: "2030-01-01",
      phone: "+380501234567",
      name: "Passenger Name",
      utm_content: "arbitrary-pii",
      arbitraryContext: "unexpected",
    });

    expect(safe).toEqual({
      medium: "social",
      campaign: "m1",
      routeSlug: "lviv-hannover",
      origin: "lviv",
      destination: "hannover",
      passengerCount: 2,
      ctaLocation: "booking_widget",
      conversionType: "whatsapp_inquiry",
      leadId: "UR-ABCDEFGHJK",
      deskId: "koval-de",
    });
  });

  it("preserves the first approved landing context in memory across navigation", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    const location = {
      pathname: "/routes/lviv-hannover/",
      search: "?utm_source=google&utm_medium=organic&utm_campaign=m1&utm_content=ignored",
    };
    vi.stubGlobal("window", { location });

    expect(captureAttribution()).toEqual({
      source: "google",
      medium: "organic",
      campaign: "m1",
      landingPage: "/routes/lviv-hannover/",
    });

    location.pathname = "/about/";
    location.search = "?utm_source=facebook&utm_medium=social";
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", {
      location,
      dataLayer,
      __uarouteAnalyticsConsent: true,
      __uarouteAnalyticsProviderReady: true,
    });
    track("route_view", { routeSlug: "lviv-hannover", travelDate: "2030-01-01" } as never);

    expect(dataLayer).toHaveLength(2);
    expect((dataLayer[1] as { uaroute: { parameters: unknown } }).uaroute.parameters).toMatchObject({
      source: "google",
      medium: "organic",
      campaign: "m1",
      landingPage: "/routes/lviv-hannover/",
    });
    expect(JSON.stringify(dataLayer[1])).not.toContain("2030-01-01");
    expect(JSON.stringify(dataLayer[1])).not.toContain("utm_content");
  });

  it("maps only approved referrer families and labels unknown sources without storing URLs", () => {
    vi.stubGlobal("window", {
      location: { origin: "https://uaroute.com", pathname: "/", search: "" },
    });
    vi.stubGlobal("document", { referrer: "https://www.google.com/search?q=private-query" });
    expect(captureAttribution()).toMatchObject({ source: "google", medium: "organic" });
    expect(JSON.stringify(captureAttribution())).not.toContain("private-query");

    resetAttributionForTests();
    vi.stubGlobal("document", { referrer: "https://chatgpt.com/c/secret-path" });
    expect(captureAttribution()).toMatchObject({ source: "chatgpt", medium: "referral" });

    resetAttributionForTests();
    vi.stubGlobal("document", { referrer: "https://unexpected.example/path?email=person" });
    expect(captureAttribution()).toMatchObject({ source: "unknown", medium: "referral" });

    resetAttributionForTests();
    vi.stubGlobal("document", { referrer: "" });
    expect(captureAttribution()).toMatchObject({ source: "direct", medium: "direct" });
  });

  it("flushes only the current route view after consent and provider readiness", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    const location = { origin: "https://uaroute.com", pathname: "/routes/lviv-hannover/", search: "" };
    const dataLayer: unknown[] = [];
    const gtag = vi.fn();
    const localEvents: unknown[] = [];
    vi.stubGlobal("window", {
      location,
      dataLayer,
      gtag,
      __uarouteEvents: localEvents,
      __uarouteAnalyticsConsent: false,
      __uarouteAnalyticsProviderReady: false,
    });

    track("route_view", { routeId: "lviv-hannover", origin: "lviv", destination: "hannover" });
    location.pathname = "/routes/dolyna-celle/";
    track("route_view", { routeId: "dolyna-celle", origin: "dolyna", destination: "celle" });
    expect(dataLayer).toHaveLength(0);
    expect(gtag).not.toHaveBeenCalled();

    vi.stubGlobal("window", {
      location,
      dataLayer,
      gtag,
      __uarouteEvents: localEvents,
      __uarouteAnalyticsConsent: true,
      __uarouteAnalyticsProviderReady: true,
    });
    location.pathname = "/about/";
    flushCurrentRouteView();
    expect(dataLayer).toHaveLength(0);
    location.pathname = "/routes/dolyna-celle/";
    flushCurrentRouteView();
    flushCurrentRouteView();

    expect(dataLayer).toHaveLength(2);
    expect((dataLayer[1] as { uaroute: { parameters: unknown } }).uaroute.parameters).toMatchObject({
      routeId: "dolyna-celle",
    });
    expect((dataLayer[1] as { uaroute: { parameters: { routeId?: string } } }).uaroute.parameters.routeId).not.toBe("lviv-hannover");
    expect(gtag).not.toHaveBeenCalled();
    expect((dataLayer[1] as { uaroute: { parameters: unknown } }).uaroute.parameters).toMatchObject({
      page_location: "https://uaroute.com/routes/dolyna-celle/",
      page_referrer: "",
    });
  });

  it("counts an accepted arrival once, counts a later return, and keeps denied views local", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    const location = { origin: "https://uaroute.com", pathname: "/routes/lviv-hannover/", search: "" };
    const dataLayer: unknown[] = [];
    const gtag = vi.fn((...args: unknown[]) => {
      void args;
      throw new Error("sink failure");
    });
    vi.stubGlobal("window", {
      location,
      dataLayer,
      gtag,
      __uarouteEvents: [],
      __uarouteAnalyticsConsent: true,
      __uarouteAnalyticsProviderReady: true,
    });

    expect(() =>
      track("route_view", { routeId: "lviv-hannover", origin: "lviv", destination: "hannover" }),
    ).not.toThrow();
    flushCurrentRouteView();
    expect(dataLayer).toHaveLength(2);
    expect(gtag).not.toHaveBeenCalled();

    location.pathname = "/about/";
    location.pathname = "/routes/lviv-hannover/";
    track("route_view", { routeId: "lviv-hannover", origin: "lviv", destination: "hannover" });
    expect(dataLayer).toHaveLength(4);
    expect(gtag).not.toHaveBeenCalled();

    const deniedDataLayer: unknown[] = [];
    const deniedGtag = vi.fn();
    vi.stubGlobal("window", {
      location,
      dataLayer: deniedDataLayer,
      gtag: deniedGtag,
      __uarouteAnalyticsConsent: false,
      __uarouteAnalyticsProviderReady: true,
    });
    track("route_view", { routeId: "lviv-hannover" });
    flushCurrentRouteView();
    expect(deniedDataLayer).toHaveLength(0);
    expect(deniedGtag).not.toHaveBeenCalled();
  });

  it("leaves consented analytics optional when sinks throw and never calls external sinks without consent", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    const gtag = vi.fn((...args: unknown[]) => {
      void args;
      throw new Error("sink failure");
    });
    const dataLayer = {
      push: vi.fn((payload: unknown) => {
        void payload;
        throw new Error("sink failure");
      }),
    };
    const localEvents: unknown[] = [];
    vi.stubGlobal("window", {
      location: { pathname: "/", search: "" },
      dataLayer,
      gtag,
      __uarouteEvents: localEvents,
      __uarouteAnalyticsConsent: false,
    });

    expect(() => track("booking_intent", { leadId: "UR-ABCDEFGHJK" })).not.toThrow();
    expect(localEvents).toHaveLength(1);
    expect(dataLayer.push).not.toHaveBeenCalled();
    expect(gtag).not.toHaveBeenCalled();

    vi.stubGlobal("window", {
      location: { pathname: "/", search: "" },
      dataLayer,
      gtag,
      __uarouteEvents: localEvents,
      __uarouteAnalyticsConsent: true,
      __uarouteAnalyticsProviderReady: true,
    });
    expect(() => track("booking_intent", { leadId: "UR-ABCDEFGHJK" })).not.toThrow();
    expect(dataLayer.push).toHaveBeenCalledOnce();
    expect(dataLayer.push.mock.calls[0]?.[0]).toEqual({ uaroute: null });
    expect(gtag).not.toHaveBeenCalled();
  });
});
