"use client";

import Link from "next/link";

import { RouteCapsule } from "@/components/brand/RouteCapsule";
import { RouteLine } from "@/components/brand/RouteLine";
import type { ResolvedRoute } from "@/data/queries";
import { track, type CtaLocation } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function RouteCard({
  route,
  ctaLocation,
  compact = false,
}: {
  route: ResolvedRoute;
  ctaLocation: CtaLocation;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col border-t border-border-strong pt-5 transition-colors",
        compact ? "pb-4" : "pb-6",
      )}
    >
      <RouteCapsule items={route.corridor} codes />

      <h3 className={cn("mt-4 type-h2", compact && "text-xl")}>
        <Link
          href={`/routes/${route.slug}/`}
          className="after:absolute after:inset-0 after:content-['']"
          onClick={() =>
            track(ctaLocation === "related_route" ? "related_route_click" : "route_view", {
              routeSlug: route.slug,
              origin: route.origin.slug,
              destination: route.destination.slug,
              destinationCountry: route.destination.country,
              ctaLocation,
            })
          }
        >
          {route.origin.name} — {route.destination.name}
        </Link>
      </h3>

      <div className="mt-5">
        <RouteLine
          variant={compact ? "minimal" : "card"}
          originLabel={route.origin.name}
          destinationLabel={route.destination.name}
        />
      </div>

      <span className="mt-5 type-meta text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Переглянути маршрут →
      </span>
    </article>
  );
}
