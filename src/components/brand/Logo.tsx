import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * UARoute wordmark. The route line is not an icon beside the name — it runs
 * through the wordmark itself: a departure node under "UA", a corridor rule,
 * and an open destination node closing the word. Works at nav, footer and
 * favicon scale.
 */
export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className="inline-flex items-baseline gap-[0.1em] font-display text-[1.375rem] leading-none tracking-tight">
        <span className="relative font-semibold text-primary">
          UA
          <span aria-hidden className="absolute -bottom-[0.28em] left-0 h-px w-full bg-accent" />
        </span>
        <span className="relative font-normal text-foreground">
          Route
          <span
            aria-hidden
            className="absolute -bottom-[0.28em] left-0 h-px w-full bg-border-strong"
          />
        </span>
        <RouteMark aria-hidden className="mb-[0.12em] h-[0.62em] w-[2.1em] shrink-0 text-primary" />
      </span>
      {showTagline ? <span className="mt-2 type-caption">Атлас маршрутів UA → EU</span> : null}
    </span>
  );
}

/** Standalone route mark — favicon, share graphics, compact placements. */
export function RouteMark({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 12" className={cn("text-primary", className)} {...rest}>
      <circle cx="4" cy="8" r="3" fill="currentColor" />
      <path
        d="M4 8 Q 20 -1 36 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="var(--route-stroke)"
        strokeLinecap="round"
      />
      <circle cx="36" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="36" cy="5" r="1.1" className="fill-accent" />
    </svg>
  );
}
