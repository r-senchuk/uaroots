"use client";

import { useEffect } from "react";

import { captureAttribution, flushCurrentRouteView } from "@/lib/analytics";

/** Captures the first canonical landing and bounded UTMs before SPA navigation. */
export function AnalyticsAttribution() {
  useEffect(() => {
    captureAttribution();
    const flush = () => flushCurrentRouteView();
    window.addEventListener("uaroute:analytics-provider-ready", flush);
    window.addEventListener("uaroute:analytics-consent", flush);
    flush();
    return () => {
      window.removeEventListener("uaroute:analytics-provider-ready", flush);
      window.removeEventListener("uaroute:analytics-consent", flush);
    };
  }, []);

  return null;
}
