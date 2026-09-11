"use client";

import { useEffect } from "react";

import type { ResolvedRoute } from "@/data/queries";
import { track } from "@/lib/analytics";

export function RouteViewTracker({ route }: { route: ResolvedRoute }) {
  useEffect(() => {
    track("route_view", {
      routeSlug: route.slug,
      origin: route.origin.slug,
      destination: route.destination.slug,
      destinationCountry: route.destination.country,
    });
  }, [route]);

  return null;
}
