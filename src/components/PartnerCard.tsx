"use client";

import { VerifiedMark } from "@/components/brand/Metadata";
import { RouteLine } from "@/components/brand/RouteLine";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { KovalReferralLink, type KovalReferralContext } from "@/components/KovalReferralLink";
import type { Carrier } from "@/data/types";
import { track, type CtaLocation } from "@/lib/analytics";

type PublicCarrier = Omit<Carrier, "desks">;

export function PartnerCard({
  carrier,
  routeSlug,
  ctaLocation = "partner_card",
  whatsappHref,
  referralContext,
  inquiryOnly = false,
}: {
  carrier: PublicCarrier;
  routeSlug?: string | undefined;
  ctaLocation?: CtaLocation;
  whatsappHref?: string | undefined;
  referralContext?: KovalReferralContext;
  inquiryOnly?: boolean;
}) {
  const utmContent = `${routeSlug ?? "site"}_${ctaLocation}`;
  const directWhatsapp = whatsappHref;

  return (
    <section className="border-t-2 border-primary pt-6">
      <p className="type-label text-muted-foreground">
        {inquiryOnly ? "Зв’язок із перевізником" : "Хто виконує перевезення"}
      </p>
      <h2 className="mt-3 type-h2">{carrier.name}</h2>
      <p className="mt-3 type-body-small text-muted-foreground">
        {inquiryOnly
          ? `Запитайте перевізника ${carrier.name} про можливість поїздки на вашу дату, вартість, посадку й багаж. На його сайті можна знайти контакт і продовжити звернення.`
          : carrier.serviceDescription}
      </p>

      <RouteLine variant="minimal" className="mt-5 max-w-[240px]" />

      {!inquiryOnly ? (
        <p className="mt-5 max-w-md type-body-small text-muted-foreground">
          Перегляньте інформацію перевізника та запитайте про умови для вашої поїздки.
        </p>
      ) : null}

      {!inquiryOnly && carrier.claims.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {carrier.claims.map((claim) => (
            <li key={claim.text} className="border-t border-border pt-3">
              <span className="block type-body-small text-foreground">{claim.text}</span>
              <VerifiedMark date={claim.lastVerifiedAt} source={carrier.name} className="mt-1.5" />{" "}
              <a
                href={claim.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="type-caption link-underline"
              >
                джерело
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {directWhatsapp ? (
          <a
            href={directWhatsapp}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() =>
              track("whatsapp_click", {
              ...(routeSlug ? { routeId: routeSlug } : {}),
                ctaLocation,
                conversionType: "whatsapp_inquiry",
              })
            }
            className="inline-flex h-12 items-center justify-center gap-2 bg-primary px-6 type-button text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <WhatsAppIcon />
            Уточнити поїздку в WhatsApp
          </a>
        ) : null}

        <KovalReferralLink
          href={carrier.website}
          content={utmContent}
          ctaLocation={ctaLocation}
          routeSlug={routeSlug}
          referralContext={referralContext}
          className="inline-flex h-12 items-center justify-center border border-border-strong px-6 type-button hover:bg-secondary"
        >
          Сайт {carrier.name} ↗
        </KovalReferralLink>
      </div>
    </section>
  );
}
