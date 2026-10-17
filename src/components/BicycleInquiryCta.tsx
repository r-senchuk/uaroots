"use client";

import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { track } from "@/lib/analytics";

export function BicycleInquiryCta({
  whatsappHref,
  label = "Уточнити перевезення велосипеда в WhatsApp",
  className = "",
}: {
  whatsappHref: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={() =>
        track("whatsapp_click", {
          ctaLocation: "partner_card",
          conversionType: "whatsapp_inquiry",
          targetPath: "/guides/perevezennya-velosypeda/",
        })
      }
      className={`inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 type-button text-primary-foreground transition-colors hover:bg-primary-hover ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
