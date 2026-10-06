"use client";

import { useEffect, useRef } from "react";

import type { ResolvedRoute } from "@/data/queries";
import { track } from "@/lib/analytics";

export function RouteViewTracker({ route }: { route: ResolvedRoute }) {
  const lastViewedSlug = useRef<string | null>(null);

  useEffect(() => {
    if (lastViewedSlug.current === route.slug) return;
    lastViewedSlug.current = route.slug;
    track("route_view", {
      routeId: route.id,
      routeStatus: route.status,
      origin: route.origin.id,
      destination: route.destination.id,
      destinationCountry: route.destination.country,
    });
  }, [route, lastViewedSlug]);

  return null;
}
