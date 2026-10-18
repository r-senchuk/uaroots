"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { track } from "@/lib/analytics";
import { buildBicycleInquiryUrl, createLeadId } from "@/lib/whatsapp";

export function BicycleInquiryCta({
  whatsappNumber = "380509786330",
  whatsappHref,
  label = "Уточнити перевезення велосипеда в WhatsApp",
  className = "",
}: {
  whatsappNumber?: string;
  whatsappHref?: string;
  label?: string;
  className?: string;
}) {
  const baselineHref = whatsappHref ?? buildBicycleInquiryUrl(whatsappNumber);

  function prepareTarget(currentTarget: HTMLAnchorElement): string | undefined {
    if (whatsappHref) return undefined;
    const existingCode = currentTarget.dataset?.leadId ?? currentTarget.getAttribute?.("data-lead-id");
    if (existingCode) {
      return existingCode;
    }

    try {
      const leadId = createLeadId();
      const targetUrl = buildBicycleInquiryUrl(whatsappNumber, leadId);
      currentTarget.href = targetUrl;
      currentTarget.setAttribute?.("href", targetUrl);
      if (currentTarget.dataset) {
        currentTarget.dataset.leadId = leadId;
      }
      currentTarget.setAttribute?.("data-lead-id", leadId);
      return leadId;
    } catch {
      // Restore uncoded baseline if code generation fails
      currentTarget.href = baselineHref;
      currentTarget.setAttribute?.("href", baselineHref);
      if (currentTarget.dataset) {
        delete currentTarget.dataset.leadId;
      }
      currentTarget.removeAttribute?.("data-lead-id");
      return undefined;
    }
  }

  function handleInteraction(event: MouseEvent<HTMLAnchorElement> | KeyboardEvent<HTMLAnchorElement>) {
    prepareTarget(event.currentTarget);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const leadId = prepareTarget(event.currentTarget);

    try {
      track("whatsapp_click", {
        ctaLocation: "partner_card",
        conversionType: "whatsapp_inquiry",
        targetPath: "/guides/perevezennya-velosypeda/",
        ...(leadId ? { leadId } : {}),
      });
    } catch {
      // Analytics must not prevent navigation
    }
  }

  return (
    <a
      href={baselineHref}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={handleClick}
      onMouseDown={handleInteraction}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleInteraction(event);
        }
      }}
      className={`inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 type-button text-primary-foreground transition-colors hover:bg-primary-hover ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}


