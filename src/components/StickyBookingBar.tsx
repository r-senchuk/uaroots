"use client";

import { useEffect, useState } from "react";

import { useInquiry } from "@/components/inquiry";

export function StickyBookingBar({ anchorId }: { anchorId: string }) {
  const { route, submit } = useInquiry();
  const [visible, setVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(Boolean(entry && !entry.isIntersecting && entry.boundingClientRect.top < 0)),
      { threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorId]);

  useEffect(() => {
    function onFocusIn(event: FocusEvent) {
      const target = event.target as HTMLElement | null;
      setInputFocused(Boolean(target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)));
    }
    function onFocusOut() {
      setInputFocused(false);
    }
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  if (!visible || inputFocused) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-strong bg-background/97 backdrop-blur sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="container-page flex items-center justify-between gap-3 pt-3">
        <p className="min-w-0 truncate font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
          {route.origin.name} → {route.destination.name}
        </p>
        <button
          type="button"
          onClick={() => submit("sticky_mobile")}
          className="inline-flex h-11 shrink-0 items-center justify-center bg-primary px-5 type-button text-primary-foreground"
        >
          Написати Koval
        </button>
      </div>
    </div>
  );
}
