import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import atlasCity from "@/assets/atlas-city.jpg";
import { BookingWidget } from "@/components/BookingWidget";
import { Graticule } from "@/components/brand/graphics";
import {
  BaggageIllustration,
  BorderIllustration,
  DocumentsIllustration,
  InformationIllustration,
} from "@/components/brand/illustrations";
import { RouteLine } from "@/components/brand/RouteLine";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { InquiryProvider } from "@/components/inquiry";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { RelatedRoutes } from "@/components/RelatedRoutes";
import { RouteSummary } from "@/components/RouteSummary";
import { RouteViewTracker } from "@/components/RouteViewTracker";
import { ShareRoute } from "@/components/ShareRoute";
import { StickyBookingBar } from "@/components/StickyBookingBar";
import { absoluteUrl } from "@/config/site";
import { getCarrier, publicCarrier } from "@/data/carriers";
import { cityHubPaths } from "@/data/discovery";
import { getResolvedRoute, getResolvedRoutesByIds } from "@/data/queries";
import { routes } from "@/data/routes";
import { breadcrumbLd, buildMetadata, travelPreviewImage } from "@/lib/seo";

const confirmIllustrations = [
  DocumentsIllustration,
  BorderIllustration,
  BaggageIllustration,
  InformationIllustration,
];

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return routes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getResolvedRoute(slug);
  if (!route) return { title: "Маршрут не знайдено | UARoute", robots: { index: false } };

  return buildMetadata({
    title: route.seo.title,
    description: route.seo.description,
    path: `/routes/${route.slug}/`,
    type: "article",
    noIndex: route.status === "editorial",
    socialImage: travelPreviewImage,
  });
}

export default async function RoutePage({ params }: PageProps) {
  const { slug } = await params;
  const route = getResolvedRoute(slug);
  if (!route) notFound();

  const carrier = getCarrier(route.carrierIds[0] ?? "");
  const related = getResolvedRoutesByIds(route.relatedRouteIds).filter(
    (item) => item.status === "commercial",
  );
  const crumbs = [
    { name: "Головна", path: "/" },
    { name: "Маршрути", path: "/routes/" },
    { name: route.title, path: `/routes/${route.slug}/` },
  ];

  return (
    <InquiryProvider route={route}>
      <RouteViewTracker route={route} />
      <JsonLd data={breadcrumbLd(crumbs)} />

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-14 pt-8">
          <Breadcrumbs items={crumbs} />

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="type-label text-muted-foreground">{route.destination.country} · {route.status === "commercial" ? "Запит перевізнику Коваль" : "Довідка про напрямок"}</p>
              <h1 className="mt-6 break-words type-display">
                {route.origin.name}
                <span className="mt-2 flex items-center gap-4 text-primary">
                  <span aria-hidden className="font-sans text-[0.45em] font-light">
                    →
                  </span>
                  <span className="min-w-0 break-words italic">{route.destination.name}</span>
                </span>
              </h1>
              <p className="mt-8 max-w-xl type-lead text-muted-foreground">{route.description}</p>

              {route.serviceMode === "candidate_inquiry" ? (
                <div className="mt-6 max-w-xl border-l-2 border-primary pl-4">
                  <p className="type-body-small font-medium">Уточніть можливість поїздки на бажану дату.</p>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Перевізник Коваль перевірить можливість поїздки та погодить з вами умови.
                    Повідомлення не резервує місце.
                  </p>
                </div>
              ) : null}

              {route.status === "commercial" ? (
                <ShareRoute title={route.title} url={absoluteUrl(`/routes/${route.slug}/`)} />
              ) : null}

              <div className="mt-10 max-w-lg border-t border-border-strong pt-6">
                <RouteLine
                  variant="hero"
                  originLabel={route.origin.name}
                  destinationLabel={route.destination.name}
                  waypoints={route.corridor.slice(1, -1)}
                  animate
                  title={`Маршрут ${route.origin.name} — ${route.destination.name}`}
                />
              </div>
            </div>

            <figure className="lg:pb-2">
              <Image
                src={atlasCity}
                alt="Ілюстративна вулиця європейського міста"
                className="photo-atlas aspect-[4/3] w-full object-cover"
              />
              <figcaption className="mt-3 type-caption">
                Ілюстративне фото · не місце посадки чи висадки
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-14 pb-28 pt-14 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div className="space-y-16">
          <RouteSummary route={route} />

          {route.practicalContent?.length ? (
            <section aria-labelledby="practical-heading">
              <p className="type-label text-muted-foreground">Практична інформація</p>
              <h2 id="practical-heading" className="mt-3 type-h2">Сплануйте зустріч і прибуття</h2>
              <div className="mt-6 space-y-8">
                {route.practicalContent.map((item) => (
                  <div key={item.heading}>
                    <h3 className="font-display text-2xl">{item.heading}</h3>
                    <p className="mt-3 type-body text-muted-foreground">{item.body}</p>
                    {item.sourceUrl ? (
                      <p className="mt-3 type-caption">
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                          Інформація про місто ↗
                        </a>
                        {item.lastVerifiedAt ? ` · перевірено ${item.lastVerifiedAt}` : ""}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <p className="type-label text-muted-foreground">02 · Перед поїздкою</p>
            <h2 className="mt-3 type-h2">Що погодити з перевізником Коваль</h2>
            <p className="mt-3 max-w-xl type-body-small text-muted-foreground">
              Використайте цей перелік під час розмови, щоб заздалегідь обговорити важливі для вас умови.
            </p>

            <ul className="mt-8 rule-strong">
              {route.whatToConfirm.map((item, index) => {
                const Illustration = confirmIllustrations[index % confirmIllustrations.length]!;
                return (
                  <li key={item} className="flex items-start gap-5 rule-hair py-5 first:border-t-0">
                    <Illustration className="size-9 shrink-0" />
                    <span className="type-body">{item}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {route.faq.length > 0 ? (
            <section>
              <p className="type-label text-muted-foreground">03 · Питання</p>
              <h2 className="mt-3 type-h2">Часті питання</h2>
              <div className="mt-8">
                <Faq items={route.faq} />
              </div>
            </section>
          ) : null}

          <RelatedRoutes routes={related} currentRoute={route} />

          {cityHubPaths.some((path) => path === `/cities/${route.origin.slug}/` || path === `/cities/${route.destination.slug}/`) ? (
            <section aria-labelledby="city-directions-heading">
              <h2 id="city-directions-heading" className="type-h2">Інші напрямки вашого міста</h2>
              <div className="mt-5 flex flex-wrap gap-4">
                {[route.origin, route.destination].filter((city) => cityHubPaths.some((path) => path === `/cities/${city.slug}/`)).map((city) => (
                  <Link key={city.id} href={`/cities/${city.slug}/`} className="inline-flex min-h-11 items-center border border-border-strong px-4 py-2 type-button hover:bg-secondary">
                    {city.name} ↔ Німеччина
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
          {route.status === "commercial" ? (
            <div id="inquiry-anchor">
              <BookingWidget />
            </div>
          ) : null}
          {carrier ? (
            <PartnerCard
              carrier={publicCarrier(carrier)}
              routeSlug={route.slug}
              ctaLocation="partner_card"
              inquiryOnly={route.serviceMode === "candidate_inquiry" || route.status === "editorial"}
              referralContext={{ originCityId: route.origin.id, destinationCityId: route.destination.id, sourcePath: `/routes/${route.slug}/` }}
            />
          ) : null}
        </aside>
      </div>

      {route.status === "commercial" ? <StickyBookingBar anchorId="inquiry-anchor" /> : null}
    </InquiryProvider>
  );
}
