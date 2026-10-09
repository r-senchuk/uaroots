"use client";

import type { MouseEvent, ReactNode } from "react";

import { withUtm } from "@/config/site";
import { createLeadId } from "@/lib/whatsapp";
import { canonicalLandingPath, track, type CtaLocation } from "@/lib/analytics";

export type KovalReferralContext = {
  originCityId?: string;
  destinationCityId?: string;
  sourcePath?: string;
};

export function KovalReferralLink({
  href,
  content,
  ctaLocation,
  routeId,
  routeSlug,
  referralContext,
  className,
  children,
}: {
  href: string;
  content: string;
  ctaLocation: CtaLocation;
  routeId?: string;
  routeSlug?: string;
  referralContext?: KovalReferralContext;
  className: string;
  children: ReactNode;
}) {
  const baselineHref = withUtm(href, content, referralContext);

  function prepareReferral(event: MouseEvent<HTMLAnchorElement>) {
    let requestCode: string | undefined;
    try {
      requestCode = createLeadId();
      const target = withUtm(href, content, {
        requestCode,
        ...(referralContext?.originCityId ? { originCityId: referralContext.originCityId } : {}),
        ...(referralContext?.destinationCityId
          ? { destinationCityId: referralContext.destinationCityId }
          : {}),
      });
      event.currentTarget.href = target;
    } catch {
      // Keep the usable baseline link if optional referral setup fails.
    }

    try {
      const targetPath = canonicalLandingPath(window.location.pathname) ?? referralContext?.sourcePath;
      track("koval_site_click", {
        ...((routeId ?? routeSlug) ? { routeId: routeId ?? routeSlug } : {}),
        ...(referralContext?.originCityId ? { origin: referralContext.originCityId } : {}),
        ...(referralContext?.destinationCityId
          ? { destination: referralContext.destinationCityId }
          : {}),
        ...(targetPath ? { targetPath } : {}),
        ctaLocation,
        conversionType: "koval_site",
        ...(requestCode ? { leadId: requestCode } : {}),
      });
    } catch {
      // Analytics must not keep the link from opening.
    }
  }

  return (
    <a
      href={baselineHref}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={prepareReferral}
      onAuxClick={(event) => {
        if (event.button !== 1) return;
        event.preventDefault();
        prepareReferral(event);
        window.open(event.currentTarget.href, "_blank", "noopener,noreferrer");
      }}
      className={className}
    >
      {children}
    </a>
  );
}
