"use client";

import Link from "next/link";

import type { ResolvedRoute } from "@/data/queries";
import { track, type CtaLocation } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function RouteList({
  routes,
  ctaLocation,
  sourceRouteId,
  startIndex = 1,
  className,
}: {
  routes: ResolvedRoute[];
  ctaLocation: CtaLocation;
  sourceRouteId?: string;
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
            onClick={() => {
              if (ctaLocation !== "related_route") return;
              track("related_route_click", {
                ...(sourceRouteId ? { sourceRouteId } : {}),
                targetRouteId: route.id,
                origin: route.origin.id,
                destination: route.destination.id,
                destinationCountry: route.destination.country,
                ctaLocation,
                placement: "related_route",
              });
            }}
            className="group grid min-h-11 grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-3 py-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:py-7"
          >
            <span className="type-index text-muted-foreground transition-colors group-hover:text-accent-foreground">
              {String(startIndex + index).padStart(2, "0")}
            </span>

            <span className="min-w-0">
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="break-words font-display text-2xl leading-tight text-foreground sm:text-4xl">{route.origin.name}</span>
                <span className="text-xl text-primary" aria-label="до">→</span>
                <span className="break-words font-display text-2xl leading-tight text-foreground sm:text-4xl">{route.destination.name}</span>
              </span>

              <span className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                {"serviceMode" in route && route.serviceMode === "candidate_inquiry" ? (
                  <span className="type-meta text-primary">Уточніть можливість поїздки на вашу дату</span>
                ) : <span className="type-meta">Умови погоджує перевізник Коваль</span>}
                <span className="type-meta text-primary underline underline-offset-4 sm:ml-auto">
                  Переглянути напрямок →
                </span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
