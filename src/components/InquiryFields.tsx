"use client";

import type { InputHTMLAttributes } from "react";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

/** Keep the ISO date (including year) for validation, with a locale-independent visual label. */
export function InquiryDate({ value, className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const date = typeof value === "string" ? value : "";
  const display = date ? `${date.slice(8, 10)}.${date.slice(5, 7)}` : "ДД.ММ";
  return (
    <div className={`relative flex items-center justify-between focus-within:outline-2 focus-within:outline-primary ${className}`}>
      <span aria-hidden="true" className={date ? "" : "text-muted-foreground"}>{display}</span>
      <CalendarDays aria-hidden="true" className="h-5 w-5 shrink-0" />
      <input {...props} type="date" value={value} lang="uk" title={date ? `${display}.${date.slice(0, 4)}` : undefined}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onClick={(event) => {
          // Only a direct user click may open the native picker; never focus it during scrolling.
          try { event.currentTarget.showPicker?.(); } catch { /* Native control remains available. */ }
        }} />
    </div>
  );
}

export function PassengerCount({ id, value, onChange, invalid, describedBy }: {
  id: string; value: number; onChange: (value: number) => void; invalid?: boolean; describedBy?: string | undefined;
}) {
  const buttonClass = "flex min-h-12 min-w-12 items-center justify-center hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="mt-2 flex min-h-12 items-center border border-input bg-background">
      <span id={id} role="spinbutton" tabIndex={0} aria-label="Кількість пасажирів" aria-valuemin={1} aria-valuemax={8}
        aria-valuenow={value} aria-invalid={invalid} aria-describedby={describedBy}
        className="flex min-h-12 flex-1 items-center justify-center text-lg tabular-nums focus-visible:outline-2 focus-visible:outline-primary"
        onKeyDown={(event) => {
          const next = event.key === "ArrowUp" ? Math.min(8, value + 1) : event.key === "ArrowDown" ? Math.max(1, value - 1) : event.key === "Home" ? 1 : event.key === "End" ? 8 : null;
          if (next !== null) { event.preventDefault(); onChange(next); }
        }}>{value}</span>
      <button type="button" aria-label="Зменшити кількість пасажирів" disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))} className={buttonClass}><ChevronDown aria-hidden="true" className="h-5 w-5" /></button>
      <button type="button" aria-label="Збільшити кількість пасажирів" disabled={value >= 8} onClick={() => onChange(Math.min(8, value + 1))} className={buttonClass}><ChevronUp aria-hidden="true" className="h-5 w-5" /></button>
    </div>
  );
}
