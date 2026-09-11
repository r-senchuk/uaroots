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
 * Ticks read as an atlas scale bar; waypoints carry country codes.
 */
export function RouteLine({
  variant = "minimal",
  originLabel,
  destinationLabel,
  waypoints = [],
  waypointsAsCodes = true,
  highlightDestination = false,
  animate = false,
  className,
  title,
}: Props) {
  const { height, curve, labels, ticks } = geometry[variant];
  const width = 360;
  const y = labels ? height * 0.4 : height / 2;
  const startX = 10;
  const endX = width - 10;
  const path =
    curve === 0
      ? `M ${startX} ${y} L ${endX} ${y}`
      : `M ${startX} ${y} Q ${width / 2} ${y - curve} ${endX} ${y}`;

  const nodeR = variant === "hero" ? 5.5 : variant === "compact" ? 3 : 4;
  const stops = waypoints.slice(0, 4);
  const tickCount = variant === "hero" ? 28 : 18;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("w-full text-primary", className)}
      style={{ height, maxHeight: height }}
    >
      {title ? <title>{title}</title> : null}

      {ticks
        ? Array.from({ length: tickCount }).map((_, index) => {
            const t = index / (tickCount - 1);
            const cx = startX + (endX - startX) * t;
            const cy = curve === 0 ? y : y - curve * 4 * t * (1 - t);
            return (
              <line
                key={index}
                x1={cx}
                x2={cx}
                y1={cy - 3}
                y2={cy + 3}
                stroke="currentColor"
                strokeWidth="0.75"
                opacity={0.22}
              />
            );
          })
        : null}

      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="var(--route-stroke)"
        strokeLinecap="round"
        strokeDasharray={animate ? 900 : undefined}
        className={animate ? "route-line-draw" : undefined}
        opacity={0.85}
      />

      {stops.map((stop, index) => {
        const t = (index + 1) / (stops.length + 1);
        const cx = startX + (endX - startX) * t;
        const cy = curve === 0 ? y : y - curve * 4 * t * (1 - t);
        return (
          <g key={`${stop}-${index}`}>
            <circle cx={cx} cy={cy} r={nodeR * 0.45} fill="currentColor" opacity={0.55} />
            {labels ? (
              <text
                x={cx}
                y={cy - 9}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: variant === "hero" ? 10 : 8.5,
                  letterSpacing: "0.14em",
                }}
              >
                {waypointsAsCodes ? countryCode(stop) : stop}
              </text>
            ) : null}
          </g>
        );
      })}

      <circle cx={startX} cy={y} r={nodeR} fill="currentColor" />
      <circle
        cx={endX}
        cy={y}
        r={nodeR}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={highlightDestination ? "text-accent" : undefined}
      />
      <circle
        cx={endX}
        cy={y}
        r={nodeR * 0.4}
        className={highlightDestination ? "fill-accent" : "fill-current"}
      />

      {labels && (originLabel || destinationLabel) ? (
        <>
          <text
            x={startX}
            y={height - 3}
            className="fill-muted-foreground"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {originLabel?.toUpperCase()}
          </text>
          <text
            x={endX}
            y={height - 3}
            textAnchor="end"
            className="fill-foreground"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {destinationLabel?.toUpperCase()}
          </text>
        </>
      ) : null}
    </svg>
  );
}
