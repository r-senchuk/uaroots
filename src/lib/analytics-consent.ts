import { analyticsConfiguration } from "@/config/analytics";

/** Close the adapter synchronously; a fresh denied document removes collectors. */
export function applyAnalyticsConsent(requested: boolean): void {
  const { enabled, measurementId } = analyticsConfiguration();
  const accepted = enabled && requested;
  const reloadRequired = !accepted && window.__uarouteAnalyticsConsent === true;
  window.__uarouteAnalyticsConsent = accepted;
  if (!accepted) window.__uarouteAnalyticsProviderReady = false;
  if (measurementId) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = !accepted;
  }
  window.dispatchEvent(new CustomEvent("uaroute:analytics-consent", { detail: accepted }));
  if (reloadRequired) window.location.reload();
}
