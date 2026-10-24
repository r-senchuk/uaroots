"use client";

import { useEffect, useRef, useState } from "react";

import { useInquiry } from "@/components/inquiry";
import { KovalReferralLink } from "@/components/KovalReferralLink";
import { getCarrier } from "@/data/carriers";
import { resolveDesk } from "@/lib/whatsapp";

export function StickyBookingBar({ anchorId }: { anchorId: string }) {
  const { route, submit } = useInquiry();
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;
    const observedAnchor = anchor;

    let animationFrame: number | null = null;

    function updateVisibility() {
      animationFrame = null;
      setVisible(observedAnchor.getBoundingClientRect().bottom <= 0);
    }

    function scheduleUpdate() {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(updateVisibility);
    }

    const observer = new IntersectionObserver(
      () => scheduleUpdate(),
      { threshold: 0 },
    );
    observer.observe(observedAnchor);

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
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

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty("--inquiry-sticky-height", `${bar.offsetHeight}px`);
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(bar);
    updateHeight();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--inquiry-sticky-height");
    };
  }, [visible, inputFocused]);

  if (!visible || inputFocused) return null;

  const desk = resolveDesk(route);
  const carrier = route.carrierIds[0] ? getCarrier(route.carrierIds[0]) : undefined;
  const sourcePath = `/routes/${route.slug}/`;

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-strong bg-background/97 backdrop-blur sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="container-page flex min-w-0 flex-col items-stretch gap-2 pt-3">
        <p className="min-w-0 break-words font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
          {route.origin.name} → {route.destination.name}
        </p>
        {desk ? (
          <button
            type="button"
            onClick={() => submit("sticky_mobile")}
            className="inline-flex min-h-11 min-w-0 items-center justify-center bg-primary px-4 py-3 type-button text-center whitespace-normal [overflow-wrap:anywhere] text-primary-foreground"
          >
            Уточнити поїздку
          </button>
        ) : carrier ? (
          <KovalReferralLink
            href={carrier.website}
            content={`${route.slug}_sticky_mobile`}
            ctaLocation="sticky_mobile"
            routeId={route.id}
            routeSlug={route.slug}
            referralContext={{
              originCityId: route.origin.id,
              destinationCityId: route.destination.id,
              sourcePath,
            }}
            className="inline-flex min-h-11 min-w-0 items-center justify-center bg-primary px-4 py-3 type-button text-center whitespace-normal [overflow-wrap:anywhere] text-primary-foreground"
          >
            Сайт перевізника ↗
          </KovalReferralLink>
        ) : null}
      </div>
    </div>
  );
}
