import type { FaqItem } from "@/data/types";

export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rule-strong min-w-0">
      {items.map((item) => (
        <details key={item.question} className="group rule-hair min-w-0 py-5 first:border-t-0 [overflow-wrap:anywhere]">
          <summary className="flex min-h-11 w-full min-w-0 cursor-pointer list-none items-center marker:hidden">
            <span className="flex w-full min-w-0 items-start justify-between gap-4 sm:gap-6">
              <h3 className="min-w-0 flex-1 font-display text-xl leading-snug [overflow-wrap:anywhere]">{item.question}</h3>
              <span
                aria-hidden
                className="mt-1.5 shrink-0 font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-4 max-w-2xl type-body-small text-muted-foreground [overflow-wrap:anywhere]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
