"use client";

import Link from "next/link";

import { countryCode } from "@/components/brand/RouteCapsule";
import type { ResolvedRoute } from "@/data/queries";
import { track, type CtaLocation } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function RouteList({
  routes,
  ctaLocation,
  startIndex = 1,
  className,
}: {
  routes: ResolvedRoute[];
  ctaLocation: CtaLocation;
  startIndex?: number;
  className?: string;
}) {
  if (routes.length === 0) return null;

  return (
    <ol className={cn("rule-strong", className)}>
      {routes.map((route, index) => (
        <li key={route.id} className="rule-hair first:border-t-0">
          <Link
            href={`/routes/${route.slug}/`}
            onClick={() =>
              track(ctaLocation === "related_route" ? "related_route_click" : "route_view", {
                routeSlug: route.slug,
                origin: route.origin.slug,
                destination: route.destination.slug,
                destinationCountry: route.destination.country,
                ctaLocation,
              })
            }
            className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-6 transition-colors sm:grid-cols-[3.5rem_1fr] sm:py-8"
          >
            <span className="type-index text-muted-foreground transition-colors group-hover:text-accent-foreground">
              {String(startIndex + index).padStart(2, "0")}
            </span>

            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:flex-nowrap">
                <span className="type-route text-foreground">{route.origin.name}</span>
                <span
                  aria-hidden
                  className="relative hidden h-px min-w-8 flex-1 bg-border-strong transition-colors group-hover:bg-primary sm:block"
                >
                  <span className="absolute -top-[3px] left-0 size-[7px] rounded-full bg-primary" />
                  <span className="absolute -top-[3px] right-0 size-[7px] rounded-full border border-primary bg-background transition-colors group-hover:bg-accent" />
                </span>
                <span className="type-route text-foreground">{route.destination.name}</span>
              </span>

              <span className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                <span className="type-meta">{route.corridor.map(countryCode).join(" · ")}</span>
                <span className="type-meta hidden opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                  {route.destination.country}
                </span>
                <span className="type-meta ml-auto hidden text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                  Переглянути маршрут →
                </span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
