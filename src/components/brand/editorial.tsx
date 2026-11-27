import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Shared editorial badge for hero and section eyebrows matching the route atlas header. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary [overflow-wrap:anywhere]",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
      {children}
    </span>
  );
}

/** Framed monospace index square (`01`, `02`, ...) used in route lists and step timelines. */
export function IndexBadge({ index, className }: { index: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/8 font-mono text-xs font-semibold text-primary",
        className,
      )}
    >
      {String(index).padStart(2, "0")}
    </span>
  );
}

/** Small framed icon tile matching the route page carrier claims grid. */
export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center border border-primary/25 bg-primary/8 text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Location pin stroke icon reused across place and pickup cards. */
export function PinIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className={cn("size-4 shrink-0", className)}>
      <path
        d="M10 17s5-4.4 5-8.5A5 5 0 0 0 5 8.5C5 12.6 10 17 10 17Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Shield checkmark stroke icon for privacy and verification callouts. */
export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className={cn("size-4 shrink-0", className)}>
      <path
        d="M10 2.8 4.2 5v4.6c0 3.9 2.5 6.8 5.8 7.8 3.3-1 5.8-3.9 5.8-7.8V5L10 2.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m7.3 10.1 1.9 1.9 3.6-3.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** House arrival stroke icon used in figure headers. */
export function HouseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className={cn("size-3.5 shrink-0", className)}>
      <path
        d="M2.5 7.5 8 2.8l5.5 4.7V13.5a.8.8 0 0 1-.8.8H3.3a.8.8 0 0 1-.8-.8V7.5Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 14.3V9.8h3.6v4.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Direction arrow icon for outbound/inbound planning bands. */
export function ArrowDirectionIcon({
  direction = "outbound",
  className,
}: {
  direction?: "outbound" | "inbound";
  className?: string;
}) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className={cn("size-4 shrink-0", className)}>
      {direction === "outbound" ? (
        <path
          d="M4.5 10h11m0 0-4-4m4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M15.5 10h-11m0 0 4-4m-4 4 4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/** Bicycle stroke icon for luggage and bicycle preparation callouts. */
export function BicycleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className={cn("size-4 shrink-0", className)}>
      <circle cx="5.5" cy="13.5" r="2.75" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.5" cy="13.5" r="2.75" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.5 13.5 8.5 7.5h3.5l2.5 6M8.5 7.5l1.5 6h-4.5M11.5 5.5h2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Package stroke icon for parcel inquiry callout. */
export function PackageIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className={cn("size-4 shrink-0", className)}>
      <path
        d="M10 2.8 16.5 6.3v7.4L10 17.2l-6.5-3.5V6.3L10 2.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 6.3 10 9.8l6.5-3.5M10 9.8v7.4M6.8 4.5l6.4 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const ticketCard =
  "min-w-0 border border-border-strong border-t-4 border-t-primary bg-card p-3 sm:p-6 shadow-[var(--shadow-lifted)]";

export const chipLink =
  "inline-flex min-h-11 items-center border border-border-strong px-4 py-2 type-button hover:bg-secondary";
