"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { captureAttribution, canonicalLandingPath, flushCurrentRouteView, track } from "@/lib/analytics";

/** Captures the first canonical landing and bounded UTMs before SPA navigation. */
export function AnalyticsAttribution() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (canonicalLandingPath(pathname)) track("page_view");
  }, [pathname]);
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
