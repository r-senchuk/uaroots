import { analyticsConfiguration } from "@/config/analytics";

export type GoogleConsentState = {
  analytics_storage: "granted" | "denied";
  ad_storage: "denied";
  ad_user_data: "denied";
  ad_personalization: "denied";
};
declare global {
  interface Window {
    __uarouteRegisterConsentListener?: (callback: (state: GoogleConsentState) => void) => void;
    __uarouteGoogleConsentReady?: boolean;
    __uarouteGtmLoaded?: boolean;
  }
}
const listeners = new WeakMap<object, Set<(state: GoogleConsentState) => void>>();

export function googleConsentState(accepted: boolean): GoogleConsentState {
  return { analytics_storage: accepted ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
}

/** GTM registers updateConsentState synchronously; no queued gtag substitute. */
export function syncGoogleConsent(accepted: boolean): void {
  const config = analyticsConfiguration();
  if (config.provider === "ga4") {
    // Before the library exists, AnalyticsScripts initializes defaults before config.
    if (config.enabled && window.gtag) {
      try { window.gtag("consent", "update", googleConsentState(accepted)); }
      catch { window.__uarouteAnalyticsProviderReady = false; }
    }
    return;
  }
  if (config.enabled && accepted && !listeners.has(window)) {
    const callbacks = new Set<(state: GoogleConsentState) => void>();
    listeners.set(window, callbacks);
    window.__uarouteGoogleConsentReady = false;
    window.__uarouteRegisterConsentListener = (callback) => {
      const state = googleConsentState(config.enabled && window.__uarouteAnalyticsConsent === true);
      try {
        callback(state);
        callbacks.add(callback);
        window.__uarouteGoogleConsentReady = state.analytics_storage === "granted";
        window.dispatchEvent(new Event("uaroute:google-consent-ready"));
      } catch {
        window.__uarouteGoogleConsentReady = false;
        window.__uarouteAnalyticsProviderReady = false;
      }
    };
  }
  for (const callback of listeners.get(window) ?? []) {
    try { callback(googleConsentState(config.enabled && accepted)); }
    catch { window.__uarouteGoogleConsentReady = false; window.__uarouteAnalyticsProviderReady = false; }
  }
  if (!accepted) window.__uarouteGoogleConsentReady = false;
}
