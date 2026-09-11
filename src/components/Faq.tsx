import type { FaqItem } from "@/data/types";

export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rule-strong">
      {items.map((item) => (
        <details key={item.question} className="group rule-hair py-5 first:border-t-0">
          <summary className="cursor-pointer list-none marker:hidden">
            <span className="flex items-start justify-between gap-6">
              <span className="font-display text-xl leading-snug">{item.question}</span>
              <span
                aria-hidden
                className="mt-1.5 shrink-0 font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-4 max-w-2xl type-body-small text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
