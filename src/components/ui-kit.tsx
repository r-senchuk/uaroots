import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Panel — used ONLY where a bounded surface has a product function
 * (the inquiry form, the carrier handoff). Editorial content uses rules
 * and typography instead.
 */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "aside";
}) {
  return (
    <Tag className={cn("border border-border-strong bg-card text-card-foreground", className)}>
      {children}
    </Tag>
  );
}

/** Editorial section heading: mono eyebrow + serif title on a rule. */
export function SectionHeading({
  title,
  description,
  eyebrow,
  level = 2,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  level?: 2 | 3;
  className?: string;
}) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <div className={cn("rule-strong pt-5", className)}>
      {eyebrow ? <p className="type-label text-muted-foreground">{eyebrow}</p> : null}
      <Tag className={cn(eyebrow && "mt-3", level === 2 ? "type-h2" : "type-h3")}>{title}</Tag>
      {description ? (
        <p className="mt-3 max-w-xl type-body-small text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 type-caption",
        tone === "neutral" && "border-border-strong text-muted-foreground",
        tone === "accent" && "border-accent bg-accent/25 text-accent-foreground",
        tone === "warning" && "border-warning/60 text-warning-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rule-strong py-10">
      <h3 className="type-h2">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md type-body-small text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <section className="border-l-2 border-destructive py-4 pl-5">
      <h3 className="type-h3 text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 type-body-small text-muted-foreground">{description}</p>
      ) : null}
    </section>
  );
}
