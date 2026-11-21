import { cn } from "@/lib/utils";

import { countryCode } from "./RouteCapsule";

export type RouteLineVariant = "minimal" | "card" | "hero" | "decorative" | "compact";

type Props = {
  variant?: RouteLineVariant;
  /** Labels rendered under the endpoint nodes. Omitted for decorative use. */
  originLabel?: string | undefined;
  destinationLabel?: string | undefined;
  /** Intermediate waypoints along the line (corridor countries, for example). */
  waypoints?: string[];
  /** Renders waypoints as two-letter country codes (UA · PL · DE). */
  waypointsAsCodes?: boolean;
  /** Highlights the destination node with the signal accent. */
  highlightDestination?: boolean;
  /** Draws the line on mount. Disabled automatically under prefers-reduced-motion. */
  animate?: boolean;
  className?: string;
  /** Accessible description. When omitted the graphic is decorative (aria-hidden). */
  title?: string | undefined;
};

const geometry: Record<
  RouteLineVariant,
  { height: number; curve: number; labels: boolean; ticks: boolean }
> = {
  minimal: { height: 26, curve: 0, labels: false, ticks: true },
  card: { height: 46, curve: 8, labels: true, ticks: true },
  hero: { height: 96, curve: 20, labels: true, ticks: true },
  decorative: { height: 60, curve: 22, labels: false, ticks: false },
  compact: { height: 16, curve: 0, labels: false, ticks: false },
};

/**
 * The UARoute primitive: an origin node, a measured corridor, a destination.
 * Built with flex/HTML nodes so circles and labels never distort across widths.
 */
export function RouteLine({
  variant = "minimal",
  originLabel,
  destinationLabel,
  waypoints = [],
  waypointsAsCodes = true,
  highlightDestination = false,
  className,
  title,
}: Props) {
  const { labels } = geometry[variant];
  const stops = waypoints.slice(0, 4);

  return (
    <div
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("w-full min-w-0 select-none text-primary", className)}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" />
        <div className="relative flex min-w-0 flex-1 items-center justify-evenly">
          <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary/45" />
          {stops.map((stop, index) => (
            <span
              key={`${stop}-${index}`}
              className="relative z-10 inline-flex items-center gap-1 bg-background px-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-primary/60" />
              {labels ? (waypointsAsCodes ? countryCode(stop) : stop) : null}
            </span>
          ))}
        </div>
        <span
          className={cn(
            "size-2.5 shrink-0 rounded-full border-2",
            highlightDestination
              ? "border-primary bg-accent ring-4 ring-accent/30"
              : "border-primary bg-background ring-4 ring-primary/15",
          )}
        />
      </div>

      {labels && (originLabel || destinationLabel) ? (
        <div className="mt-1.5 flex min-w-0 items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="min-w-0 truncate text-muted-foreground">{originLabel}</span>
          <span className="min-w-0 truncate text-right font-medium text-foreground">{destinationLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
