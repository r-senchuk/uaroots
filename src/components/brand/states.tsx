import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Route that terminates at a missing waypoint — the UARoute empty-state motif. */
export function BrokenRouteGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 40" aria-hidden className={cn("h-10 w-full text-primary", className)}>
      {Array.from({ length: 20 }).map((_, index) => (
        <line
          key={index}
          x1={10 + index * 13}
          x2={10 + index * 13}
          y1="17"
          y2="23"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.2"
        />
      ))}
      <circle cx="8" cy="20" r="5" fill="currentColor" />
      <path
        d="M14 20 H 260"
        stroke="currentColor"
        strokeWidth="var(--route-stroke)"
        strokeLinecap="round"
        strokeDasharray="var(--route-dash)"
        opacity="0.6"
      />
      <path
        d="M280 12 L296 28 M296 12 L280 28"
        stroke="currentColor"
        strokeWidth="var(--route-stroke)"
        strokeLinecap="round"
        className="text-accent-foreground"
      />
    </svg>
  );
}

export function RouteEmptyState({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-y border-border-strong py-10", className)}>
      <BrokenRouteGraphic className="max-w-sm" />
      <h3 className="mt-6 type-h2">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md type-body-small text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

/** Branded loading indicator: a route progressing between waypoints. */
export function RouteLoader({
  label = "Завантаження",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)} role="status" aria-live="polite">
      <svg viewBox="0 0 220 24" aria-hidden className="h-6 w-[220px] text-primary">
        <path
          d="M10 12 H 210"
          stroke="currentColor"
          strokeWidth="var(--route-stroke)"
          strokeLinecap="round"
          opacity="0.25"
        />
        {[10, 75, 140, 205].map((cx, index) => (
          <circle
            key={cx}
            cx={cx}
            cy="12"
            r="4"
            fill="currentColor"
            className="route-node-pulse"
            style={{ animationDelay: `${index * 160}ms` }}
          />
        ))}
      </svg>
      <span className="type-caption">{label}</span>
    </div>
  );
}
