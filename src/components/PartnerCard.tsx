"use client";

import { VerifiedMark } from "@/components/brand/Metadata";
import { RouteLine } from "@/components/brand/RouteLine";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { withUtm } from "@/config/site";
import type { Carrier, Desk } from "@/data/types";
import { track, type CtaLocation } from "@/lib/analytics";

type PublicCarrier = Omit<Carrier, "desks">;

export function PartnerCard({
  carrier,
  desk,
  routeSlug,
  ctaLocation = "partner_card",
  whatsappHref,
}: {
  carrier: PublicCarrier;
  desk?: Desk | undefined;
  routeSlug?: string | undefined;
  ctaLocation?: CtaLocation;
  whatsappHref?: string | undefined;
}) {
  const utmContent = `${routeSlug ?? "site"}_${ctaLocation}`;
  const directWhatsapp = whatsappHref ?? (desk ? `https://wa.me/${desk.whatsapp}` : undefined);

  return (
    <section className="border-t-2 border-primary pt-6">
      <p className="type-label text-muted-foreground">Хто виконує перевезення</p>
      <h2 className="mt-3 type-h2">{carrier.name}</h2>
      <p className="mt-3 type-body-small text-muted-foreground">{carrier.serviceDescription}</p>

      <RouteLine variant="minimal" className="mt-5 max-w-[240px]" />

      <p className="mt-5 max-w-md type-body-small text-muted-foreground">
        Далі ви залишаєте UARoute і спілкуєтеся напряму з перевізником. Ми допомагаємо знайти
        маршрут і підготувати запит.
      </p>

      {carrier.claims.length > 0 ? (
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
                ...(routeSlug ? { routeSlug } : {}),
                ...(desk ? { deskId: desk.id } : {}),
                ctaLocation,
                conversionType: "whatsapp_inquiry",
              })
            }
            className="inline-flex h-12 items-center justify-center gap-2 bg-primary px-6 type-button text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <WhatsAppIcon />
            Написати Koval у WhatsApp
          </a>
        ) : null}

        <a
          href={withUtm(carrier.website, utmContent)}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={() =>
            track("koval_site_click", {
              ...(routeSlug ? { routeSlug } : {}),
              ctaLocation,
              conversionType: "koval_site",
            })
          }
          className="inline-flex h-12 items-center justify-center border border-border-strong px-6 type-button hover:bg-secondary"
        >
          Сайт Koval ↗
        </a>
      </div>
    </section>
  );
}
