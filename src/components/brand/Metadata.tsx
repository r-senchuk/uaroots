import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Atlas metadata: mono label above a set value, separated by hairlines. */
export function MetaItem({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 border-t border-border pt-3", className)}>
      <dt className="type-label text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-display text-lg leading-snug text-foreground">{children}</dd>
    </div>
  );
}

export function MetaGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("grid gap-6 sm:grid-cols-3", className)}>{children}</dl>;
}

/**
 * Public attribution for carrier-reported claims. Review dates stay in the catalog.
 */
export function VerifiedMark({
  className,
}: {
  className?: string;
}) {
  return (
    <span className={cn("text-sm text-muted-foreground", className)}>За інформацією перевізника</span>
  );
}
