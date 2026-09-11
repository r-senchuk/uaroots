import { cn } from "@/lib/utils";

/** Ukrainian country names → short codes used in the corridor metadata. */
const countryCodes: Record<string, string> = {
  Україна: "UA",
  Польща: "PL",
  Німеччина: "DE",
  Австрія: "AT",
  Ліхтенштейн: "LI",
  Чехія: "CZ",
  Словаччина: "SK",
  Угорщина: "HU",
};

export function countryCode(name: string): string {
  return countryCodes[name] ?? name.slice(0, 2).toUpperCase();
}

/**
 * Corridor metadata, set as atlas type: monospaced, spaced, dot-separated.
 * No pill, no border — it reads as a map legend.
 */
export function RouteCapsule({
  items,
  codes = false,
  size = "sm",
  className,
}: {
  items: string[];
  codes?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono uppercase text-muted-foreground",
        size === "sm" ? "text-[0.6875rem] tracking-[0.2em]" : "text-xs tracking-[0.18em]",
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden className="text-border-strong">
              ·
            </span>
          ) : null}
          <span className={index === items.length - 1 ? "text-foreground" : undefined}>
            {codes ? countryCode(item) : item}
          </span>
        </span>
      ))}
    </span>
  );
}
