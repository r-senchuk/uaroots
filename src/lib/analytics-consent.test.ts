import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyAnalyticsConsent, removeAnalyticsCookies } from "./analytics-consent";

describe("analytics withdrawal", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123456");
    vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "GTM-TEST123");
    vi.stubGlobal("window", { location: { reload: vi.fn() }, dispatchEvent: vi.fn(), __uarouteAnalyticsConsent: false, __uarouteAnalyticsProviderReady: false });
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
  it("does not reload for an initial refusal or a consent grant", () => {
    applyAnalyticsConsent(false); applyAnalyticsConsent(true);
    expect(window.location.reload).not.toHaveBeenCalled();
    expect(window.__uarouteAnalyticsConsent).toBe(true);
  });
  it("revokes synchronously and reloads only once without requiring localStorage", () => {
    applyAnalyticsConsent(true);
    window.__uarouteAnalyticsProviderReady = true;
    applyAnalyticsConsent(false); applyAnalyticsConsent(false);
    expect(window.__uarouteAnalyticsConsent).toBe(false);
    expect(window.__uarouteAnalyticsProviderReady).toBe(false);
    expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123456"]).toBe(true);
    expect(window.location.reload).toHaveBeenCalledOnce();
  });
  it("cannot grant consent while the build configuration is disabled", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "false");
    applyAnalyticsConsent(true);
    expect(window.__uarouteAnalyticsConsent).toBe(false);
  });
  it("clears GA4 cookies on host, parent domains and route paths without clearing other cookies", () => {
    const writes: string[] = [];
    vi.stubGlobal("document", {
      get cookie() { return "_ga=one; _ga_TEST=two; essential=keep; _garden=keep"; },
      set cookie(value: string) { writes.push(value); },
    });
    Object.assign(window.location, { hostname: "www.uaroute.com", pathname: "/routes/lviv-celle/" });
    removeAnalyticsCookies();
    expect(writes.some((value) => value.includes("domain=.uaroute.com"))).toBe(true);
    expect(writes.some((value) => value.includes("path=/routes/lviv-celle/"))).toBe(true);
    expect(writes.every((value) => /^_ga(?:=|_TEST=)/.test(value) && value.includes("Max-Age=0"))).toBe(true);
  });
});
