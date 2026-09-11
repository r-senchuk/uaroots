import { Check } from "lucide-react";
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
 * Verification treatment. Render ONLY when the underlying data carries real
 * provenance — never as a decorative trust badge.
 */
export function VerifiedMark({
  date,
  source,
  className,
}: {
  date: string;
  source?: string | undefined;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 type-caption", className)}>
      <Check aria-hidden className="size-3.5 text-success" />
      Перевірено · {date}
      {source ? <span>· Джерело: {source}</span> : null}
    </span>
  );
}
