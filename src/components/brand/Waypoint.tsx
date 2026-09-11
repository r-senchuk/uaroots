import { cn } from "@/lib/utils";

export type WaypointKind = "origin" | "destination" | "intermediate" | "highlighted" | "decorative";

/** Consistent waypoint geometry: filled dot for origin, ring for destination. */
export function WaypointDot({
  kind = "origin",
  className,
}: {
  kind?: WaypointKind;
  className?: string;
}) {
  const size = kind === "intermediate" || kind === "decorative" ? 8 : 12;
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className={cn("shrink-0 text-primary", className)}
      style={{ width: size, height: size }}
    >
      {kind === "origin" ? <circle cx="6" cy="6" r="4.5" fill="currentColor" /> : null}
      {kind === "intermediate" || kind === "decorative" ? (
        <circle cx="6" cy="6" r="3" fill="currentColor" opacity="0.55" />
      ) : null}
      {kind === "destination" || kind === "highlighted" ? (
        <>
          <circle
            cx="6"
            cy="6"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className={kind === "highlighted" ? "text-accent" : undefined}
          />
          <circle
            cx="6"
            cy="6"
            r="1.75"
            className={kind === "highlighted" ? "fill-accent" : "fill-current"}
          />
        </>
      ) : null}
    </svg>
  );
}

export function WaypointLabel({
  kind = "origin",
  children,
  className,
}: {
  kind?: WaypointKind;
  children: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-medium", className)}>
      <WaypointDot kind={kind} />
      {children}
    </span>
  );
}
