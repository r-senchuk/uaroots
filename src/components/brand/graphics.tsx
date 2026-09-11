import { cn } from "@/lib/utils";

/**
 * Abstract cartography. These forms are visual metaphors for geography —
 * deliberately schematic so they can never be mistaken for real route geometry.
 */
export function ContourGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 240"
      aria-hidden
      className={cn("h-full w-full text-primary", className)}
      style={{ opacity: "var(--contour-opacity)" }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M-10 190 C 60 150, 110 200, 175 165 S 300 120, 410 150" />
      <path d="M-10 160 C 70 120, 120 170, 180 132 S 305 88, 410 118" />
      <path d="M-10 128 C 80 92, 130 138, 188 100 S 310 58, 410 86" />
      <path d="M-10 96 C 90 64, 140 106, 196 70 S 315 30, 410 56" />
      <path d="M-10 64 C 100 34, 150 74, 204 40 S 320 4, 410 26" />
    </svg>
  );
}

/** Graticule field — the paper of the atlas. */
export function Graticule({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 graticule", className)} />
  );
}

/** Large simplified geographic silhouette — evocative, never authoritative. */
export function GeoSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 260"
      aria-hidden
      className={cn("h-full w-full text-primary", className)}
      style={{ opacity: "var(--contour-opacity)" }}
    >
      <path
        d="M42 96 L84 62 L134 70 L168 44 L214 58 L248 44 L286 74 L272 118 L288 156 L246 186 L206 178 L176 208 L128 214 L96 188 L58 178 L36 138 Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M42 96 L84 62 L134 70 L168 44 L214 58 L248 44 L286 74 L272 118 L288 156 L246 186 L206 178 L176 208 L128 214 L96 188 L58 178 L36 138 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 5"
      />
    </svg>
  );
}

/** Repeating waypoint-and-corridor texture. Used sparingly on bands and footers. */
export function RoutePattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 route-pattern", className)}
    />
  );
}

/** Topographic contour texture for large empty areas. */
export function TopoPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 topo-pattern", className)}
    />
  );
}

/** Very subtle coordinate/metadata typography texture. */
export function CoordinateTexture({
  labels = ["49.84 N / 24.03 E", "52.37 N / 09.73 E"],
  className,
}: {
  labels?: string[];
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none select-none type-caption", className)}>
      {labels.map((label) => (
        <div key={label}>{label}</div>
      ))}
    </div>
  );
}

export type DividerVariant = "node" | "arrow" | "curve";

/** Branded content separator. A measured rule, not a decorative flourish. */
export function RouteDivider({
  variant = "node",
  className,
}: {
  variant?: DividerVariant;
  className?: string;
}) {
  return (
    <div className={cn("my-12 text-primary", className)} aria-hidden>
      {variant === "curve" ? (
        <svg viewBox="0 0 320 14" preserveAspectRatio="none" className="h-3.5 w-full">
          <path
            d="M0 11 Q 160 -3 320 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="var(--route-stroke)"
            opacity="0.6"
          />
        </svg>
      ) : (
        <div className="flex items-center gap-4">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="h-px flex-1 bg-border-strong" />
          {variant === "arrow" ? (
            <span className="font-mono text-xs text-muted-foreground">→</span>
          ) : (
            <span className="size-1.5 rounded-full border border-primary" />
          )}
        </div>
      )}
    </div>
  );
}
