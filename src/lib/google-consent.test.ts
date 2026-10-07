import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { applyAnalyticsConsent } from "./analytics-consent";
import { googleConsentState, syncGoogleConsent } from "./google-consent";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123456");
  vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "GTM-TEST123");
  vi.stubGlobal("window", { location: { reload: vi.fn() }, dispatchEvent: vi.fn() });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it("keeps advertising denied regardless of analytics choice", () => {
  expect(googleConsentState(true)).toEqual({ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  expect(googleConsentState(false).analytics_storage).toBe("denied");
});
it("updates GTM synchronously before withdrawal reload", () => {
  applyAnalyticsConsent(true);
  const callback = vi.fn();
  window.__uarouteRegisterConsentListener!(callback);
  expect(window.__uarouteGoogleConsentReady).toBe(true);
  window.location.reload = vi.fn(() => {
    expect(callback).toHaveBeenLastCalledWith(googleConsentState(false));
    expect(window.__uarouteGoogleConsentReady).toBe(false);
  });
  applyAnalyticsConsent(false);
  expect(window.location.reload).toHaveBeenCalledOnce();
});
it("late container registration receives current refusal", () => {
  applyAnalyticsConsent(true);
  applyAnalyticsConsent(false);
  const callback = vi.fn();
  window.__uarouteRegisterConsentListener!(callback);
  expect(callback).toHaveBeenCalledWith(googleConsentState(false));
  expect(window.__uarouteGoogleConsentReady).toBe(false);
});
it("a broken container fails closed", () => {
  applyAnalyticsConsent(true);
  window.__uarouteRegisterConsentListener!(() => { throw new Error("broken template"); });
  expect(window.__uarouteGoogleConsentReady).toBe(false);
  expect(window.__uarouteAnalyticsProviderReady).toBe(false);
});
it("notifies the app when the sandbox registers after the script load event", () => {
  applyAnalyticsConsent(true);
  window.__uarouteGtmLoaded = true;
  window.dispatchEvent = vi.fn();
  expect(window.__uarouteGoogleConsentReady).toBe(false);
  window.__uarouteRegisterConsentListener!(vi.fn());
  expect(window.__uarouteGoogleConsentReady).toBe(true);
  expect(window.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "uaroute:google-consent-ready" }));
});
it("disabled configuration does not expose a registration bridge", () => {
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "false");
  syncGoogleConsent(true);
  expect(window.__uarouteRegisterConsentListener).toBeUndefined();
});
it("direct GA4 receives consent updates without interrupting withdrawal on errors", () => {
  vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "");
  window.gtag = vi.fn();
  applyAnalyticsConsent(true);
  expect(window.gtag).toHaveBeenCalledWith("consent", "update", googleConsentState(true));
  window.gtag = vi.fn(() => { throw new Error("blocked library"); });
  expect(() => applyAnalyticsConsent(false)).not.toThrow();
  expect(window.location.reload).toHaveBeenCalledOnce();
});
it("the actual GTM template defaults to denial, subscribes and denies advertising", () => {
  const calls: unknown[] = [];
  let listener: (state: Record<string, string>) => void = () => {};
  const source = readFileSync("infra/analytics/uaroute-basic-consent.txt", "utf8");
  runInNewContext(source, {
    require: (name: string) => ({
      setDefaultConsentState: (state: unknown) => calls.push(state),
      updateConsentState: (state: unknown) => calls.push(state),
      callInWindow: (name: string, callback: typeof listener) => {
        expect(name).toBe("__uarouteRegisterConsentListener");
        listener = callback;
      },
    })[name],
    data: { gtmOnSuccess: vi.fn() },
  });
  expect(calls[0]).toEqual(googleConsentState(false));
  listener({ analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
  expect(calls[1]).toEqual(googleConsentState(true));
  listener({ analytics_storage: "denied" });
  expect(calls[2]).toEqual(googleConsentState(false));
});
