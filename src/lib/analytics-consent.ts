import { analyticsConfiguration } from "@/config/analytics";
import { syncGoogleConsent } from "@/lib/google-consent";

/** Delete accessible GA4 cookies without touching unrelated cookies. */
export function removeAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  const names = document.cookie.split(";").map((cookie) => cookie.trim().split("=")[0]).filter((name) => /^_ga(?:_|$)/.test(name));
  const hostname = window.location.hostname;
  const domains = ["", hostname];
  const parts = hostname.split(".");
  for (let index = 0; index < parts.length - 1; index++) domains.push(`.${parts.slice(index).join(".")}`);
  const paths = new Set(["/"]);
  const segments = window.location.pathname.split("/").filter(Boolean);
  for (let index = 1; index <= segments.length; index++) {
    const path = `/${segments.slice(0, index).join("/")}`;
    paths.add(path); paths.add(`${path}/`);
  }
  for (const name of names) for (const domain of domains) for (const path of paths) {
    document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ""}`;
  }
}

/** Close the adapter synchronously; a fresh denied document removes collectors. */
export function applyAnalyticsConsent(requested: boolean): void {
  const { enabled, measurementId } = analyticsConfiguration();
  const accepted = enabled && requested;
  const reloadRequired = !accepted && window.__uarouteAnalyticsConsent === true;
  window.__uarouteAnalyticsConsent = accepted;
  if (!accepted) {
    window.__uarouteAnalyticsProviderReady = false;
    removeAnalyticsCookies();
  }
  if (measurementId) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = !accepted;
  }
  syncGoogleConsent(accepted);
  window.dispatchEvent(new CustomEvent("uaroute:analytics-consent", { detail: accepted }));
  if (reloadRequired) window.location.reload();
}
