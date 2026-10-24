"use client";

import type { MouseEvent } from "react";

import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { KovalReferralLink } from "@/components/KovalReferralLink";
import type { CtaLocation } from "@/lib/analytics";

export function JourneyActions({
  website,
  hasDesk,
  anchorId,
  dateInputId,
  originCityId,
  destinationCityId,
  sourcePath,
  routeSlug,
  ctaLocation,
  content,
}: {
  website: string;
  hasDesk: boolean;
  anchorId: string;
  dateInputId: string;
  originCityId: string;
  destinationCityId: string;
  sourcePath: string;
  routeSlug?: string;
  ctaLocation: CtaLocation;
  content: string;
}) {
  function focusInquiry(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const dateInput = document.getElementById(dateInputId);
    dateInput?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
    dateInput?.focus({ preventScroll: true });
  }

  return (
    <div data-journey-actions data-primary-channel={hasDesk ? "whatsapp" : "website"} className="mt-4 flex min-w-0 flex-wrap items-center gap-3">
      {hasDesk ? (
        <a
          href={`#${anchorId}`}
          onClick={focusInquiry}
          className="inline-flex max-w-full min-h-12 min-w-0 items-center justify-center gap-2 bg-primary px-5 py-3 type-button text-center whitespace-normal [overflow-wrap:anywhere] text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <WhatsAppIcon />
          Уточнити поїздку в WhatsApp
        </a>
      ) : null}
      {website ? (
        <KovalReferralLink
          href={website}
          content={content}
          ctaLocation={ctaLocation}
          routeSlug={routeSlug}
          referralContext={{ originCityId, destinationCityId, sourcePath }}
          className={hasDesk
            ? "inline-flex max-w-full min-h-12 min-w-0 items-center justify-center border border-border-strong px-5 py-3 type-button text-center whitespace-normal [overflow-wrap:anywhere] hover:bg-secondary"
            : "inline-flex max-w-full min-h-12 min-w-0 items-center justify-center bg-primary px-5 py-3 type-button text-center whitespace-normal [overflow-wrap:anywhere] text-primary-foreground hover:bg-primary-hover"}
        >
          {hasDesk ? "Сайт перевізника ↗" : "Перейти на сайт перевізника ↗"}
        </KovalReferralLink>
      ) : null}
      {website ? <p className="basis-full text-sm text-muted-foreground">Посилання «Сайт перевізника» відкриє зовнішній сайт. Дата й телефон не потрібні.</p> : null}
    </div>
  );
}
