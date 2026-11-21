import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

const EU_STARS = [
  "16.65,5.64 16.96,6.48 17.85,6.51 17.14,7.06 17.39,7.92 16.65,7.42 15.91,7.92 16.16,7.06 15.45,6.51 16.34,6.48",
  "20.30,6.62 20.61,7.46 21.50,7.49 20.79,8.04 21.04,8.90 20.30,8.40 19.56,8.90 19.81,8.04 19.10,7.49 19.99,7.46",
  "22.97,9.29 23.28,10.13 24.17,10.16 23.47,10.71 23.71,11.57 22.97,11.07 22.23,11.57 22.48,10.71 21.77,10.16 22.67,10.13",
  "23.95,12.94 24.26,13.78 25.15,13.81 24.44,14.36 24.69,15.22 23.95,14.72 23.21,15.22 23.46,14.36 22.75,13.81 23.64,13.78",
  "22.97,16.59 23.28,17.43 24.17,17.46 23.47,18.01 23.71,18.87 22.97,18.37 22.23,18.87 22.48,18.01 21.77,17.46 22.67,17.43",
  "20.30,19.26 20.61,20.10 21.50,20.13 20.79,20.68 21.04,21.54 20.30,21.04 19.56,21.54 19.81,20.68 19.10,20.13 19.99,20.10",
  "16.65,20.24 16.96,21.08 17.85,21.11 17.14,21.66 17.39,22.52 16.65,22.02 15.91,22.52 16.16,21.66 15.45,21.11 16.34,21.08",
  "13.00,19.26 13.31,20.10 14.20,20.13 13.49,20.68 13.74,21.54 13.00,21.04 12.26,21.54 12.51,20.68 11.80,20.13 12.69,20.10",
  "10.33,16.59 10.63,17.43 11.53,17.46 10.82,18.01 11.07,18.87 10.33,18.37 9.59,18.87 9.83,18.01 9.13,17.46 10.02,17.43",
  "9.35,12.94 9.66,13.78 10.55,13.81 9.84,14.36 10.09,15.22 9.35,14.72 8.61,15.22 8.86,14.36 8.15,13.81 9.04,13.78",
  "10.33,9.29 10.63,10.13 11.53,10.16 10.82,10.71 11.07,11.57 10.33,11.07 9.59,11.57 9.83,10.71 9.13,10.16 10.02,10.13",
  "13.00,6.62 13.31,7.46 14.20,7.49 13.49,8.04 13.74,8.90 13.00,8.40 12.26,8.90 12.51,8.04 11.80,7.49 12.69,7.46",
];

/**
 * UARoute wordmark — Diplomatic e-Passport emblem paired with decisive two-tier
 * editorial typography without competing badges or decorative clutter.
 */
export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex max-w-full min-w-0 flex-col", className)}>
      <span className="inline-flex max-w-full min-w-0 items-center gap-2.5 sm:gap-3">
        <RouteMark aria-hidden className="h-9 w-[1.875rem] shrink-0" />
        <span className="inline-flex min-w-0 flex-col">
          <span className="inline-flex items-baseline font-display text-[1.45rem] leading-none tracking-[-0.02em] sm:text-[1.55rem]">
            <span className="font-bold text-primary">UA</span>
            <span className="font-medium text-foreground">Route</span>
          </span>
          <span
            aria-hidden
            className="mt-1 block max-w-full min-w-0 font-mono text-[0.5625rem] uppercase leading-tight tracking-[0.11em] text-muted-foreground sm:tracking-[0.18em]"
          >
            Атлас напрямків · UA → EU
          </span>
        </span>
      </span>
      {showTagline ? (
        <span className="mt-2.5 max-w-full min-w-0 type-caption [overflow-wrap:anywhere]">
          Пасажирські напрямки між Україною та Європою
        </span>
      ) : null}
    </span>
  );
}

/**
 * Standalone Diplomatic e-Passport Cover mark — vertical booklet cover with subtle binding
 * hinge, large 12-star EU circle in gold foil, and centered lower corridor emblem.
 */
export function RouteMark({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 36" fill="none" className={cn(className)} {...rest}>
      <rect
        x="1.5"
        y="1.5"
        width="27"
        height="33"
        rx="3.2"
        fill="#182A4A"
        stroke="#E8B83A"
        strokeWidth="1.2"
      />
      <line
        x1="4.8"
        y1="2.2"
        x2="4.8"
        y2="33.8"
        stroke="#E8B83A"
        strokeOpacity="0.32"
        strokeWidth="0.85"
      />
      <rect x="2.1" y="26" width="2.1" height="6.5" rx="0.6" fill="#E8B83A" />
      {EU_STARS.map((points, index) => (
        <polygon key={index} points={points} fill="#E8B83A" />
      ))}
      <path
        d="M10.1 27.8H14.0M19.3 27.8H23.2"
        stroke="#E8B83A"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="16.65" cy="27.8" r="2.1" stroke="#E8B83A" strokeWidth="1.3" />
      <circle cx="16.65" cy="27.8" r="0.8" fill="#F5F1E8" />
    </svg>
  );
}
