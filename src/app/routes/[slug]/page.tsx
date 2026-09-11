import type { Metadata } from "next";
import Image from "next/image";
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
import { RouteCapsule } from "@/components/brand/RouteCapsule";
import { RouteLine } from "@/components/brand/RouteLine";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { InquiryProvider } from "@/components/inquiry";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { RelatedRoutes } from "@/components/RelatedRoutes";
import { RouteSummary } from "@/components/RouteSummary";
import { RouteViewTracker } from "@/components/RouteViewTracker";
import { StickyBookingBar } from "@/components/StickyBookingBar";
import { getCarrier, publicCarrier } from "@/data/carriers";
import { getResolvedRoute, getResolvedRoutesByIds } from "@/data/queries";
import { routes } from "@/data/routes";
import { breadcrumbLd, buildMetadata, faqLd } from "@/lib/seo";

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
      {route.faq.length > 0 ? <JsonLd data={faqLd(route.faq)} /> : null}

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-14 pt-8">
          <Breadcrumbs items={crumbs} />

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <RouteCapsule items={route.corridor} codes size="md" />
              <h1 className="mt-6 type-display">
                {route.origin.name}
                <span className="mt-2 flex items-center gap-4 text-primary">
                  <span aria-hidden className="font-sans text-[0.45em] font-light">
                    →
                  </span>
                  <span className="italic">{route.destination.name}</span>
                </span>
              </h1>
              <p className="mt-8 max-w-xl type-lead text-muted-foreground">{route.description}</p>

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
                alt={`Місто призначення: ${route.destination.name}`}
                className="photo-atlas aspect-[4/3] w-full object-cover"
              />
              <figcaption className="mt-3 type-caption">
                {route.destination.name}, {route.destination.country} · ілюстративне фото
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-14 pb-28 pt-14 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div className="space-y-16">
          <RouteSummary route={route} carrier={carrier} />

          <section>
            <p className="type-label text-muted-foreground">02 · Перед поїздкою</p>
            <h2 className="mt-3 type-h2">Що уточнити у Koval</h2>
            <p className="mt-3 max-w-xl type-body-small text-muted-foreground">
              UARoute не публікує розкладів, тривалості поїздки та цін, доки вони не підтверджені
              перевізником. Ось що варто запитати:
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

          <RelatedRoutes routes={related} />
        </div>

        <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
          <div id="inquiry-anchor">
            <BookingWidget />
          </div>
          {carrier ? (
            <PartnerCard
              carrier={publicCarrier(carrier)}
              routeSlug={route.slug}
              ctaLocation="partner_card"
            />
          ) : null}
        </aside>
      </div>

      <StickyBookingBar anchorId="inquiry-anchor" />
    </InquiryProvider>
  );
}
