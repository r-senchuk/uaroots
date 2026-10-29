import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import atlasCity from "@/assets/atlas-city.jpg";
import { BookingWidget } from "@/components/BookingWidget";
import { Graticule } from "@/components/brand/graphics";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { InquiryProvider } from "@/components/inquiry";
import { JourneyActions } from "@/components/JourneyActions";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { RelatedRoutes } from "@/components/RelatedRoutes";
import { RouteViewTracker } from "@/components/RouteViewTracker";
import { ShareRoute } from "@/components/ShareRoute";
import { StickyBookingBar } from "@/components/StickyBookingBar";
import { absoluteUrl } from "@/config/site";
import { getCarrier, publicCarrier } from "@/data/carriers";
import { cityHubPaths } from "@/data/discovery";
import { getResolvedRoute, getResolvedRoutesByIds } from "@/data/queries";
import { routes } from "@/data/routes";
import { breadcrumbLd, buildMetadata, routePageLd, travelPreviewImage } from "@/lib/seo";
import { resolveDesk } from "@/lib/whatsapp";

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
  const hasDesk = Boolean(resolveDesk(route));
  const related = getResolvedRoutesByIds(route.relatedRouteIds).filter(
    (item) => item.status === "commercial",
  );
  const crumbs = [
    { name: "Головна", path: "/" },
    { name: "Маршрути", path: "/routes/" },
    { name: route.title, path: `/routes/${route.slug}/` },
  ];

  return (
    <InquiryProvider key={route.slug} route={route}>
      <RouteViewTracker route={route} />
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={routePageLd(route)} />

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-6 pt-4 sm:pb-6 sm:pt-4">
          <Breadcrumbs items={crumbs} />
          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{route.destination.country} · {route.status === "commercial" ? "Запит перевізнику" : "Довідка про напрямок"}</p>
              <h1 className="mt-2 max-w-4xl break-words type-h1">
                {route.origin.name} <span className="text-primary" aria-hidden>→</span> {route.destination.name}
              </h1>
              <p className="mt-4 max-w-2xl type-body text-muted-foreground">{route.description}</p>

              {route.status === "commercial" && carrier ? (
                <JourneyActions
                  website={carrier.website}
                  hasDesk={hasDesk}
                  anchorId="inquiry-anchor"
                  originCityId={route.origin.id}
                  destinationCityId={route.destination.id}
                  sourcePath={`/routes/${route.slug}/`}
                  routeSlug={route.slug}
                  ctaLocation="hero"
                  content={`${route.slug}_hero`}
                />
              ) : null}

              {route.whatToConfirm.length > 0 ? (
                <section className="mt-4 max-w-2xl" aria-labelledby="conditions-heading">
                  <h2 id="conditions-heading" className="text-sm font-semibold">Перед поїздкою уточніть</h2>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {route.whatToConfirm.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className="min-w-0">
              {route.status === "commercial" ? (
                <div id="inquiry-anchor" className="scroll-mt-[calc(var(--header-height,4.5rem)+1rem)]">
                  <BookingWidget />
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 pb-28 pt-8 sm:pb-16 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <main className="min-w-0 max-w-2xl space-y-10">
          {route.practicalContent?.length ? (
            <section aria-labelledby="practical-heading">
              <p className="type-label text-muted-foreground">Практична інформація</p>
              <h2 id="practical-heading" className="mt-2 type-h2">Сплануйте зустріч і прибуття</h2>
              <div className="mt-5 space-y-7">
                {route.practicalContent.map((item) => (
                  <div key={`${item.heading}-${item.body}`}>
                    {item.heading ? <h3 className="font-display text-2xl">{item.heading}</h3> : null}
                    <p className="mt-2 type-body text-muted-foreground">{item.body}</p>
                    {item.links?.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {item.links.map((link) => (
                          <li key={link.url}>
                            <a href={link.url} {...(link.url.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex min-h-11 items-center link-underline">{link.label}</a>
                            {link.url === item.sourceUrl && item.lastVerifiedAt ? (
                              <span className="ml-2 inline-block text-sm">· перевірено <time dateTime={item.lastVerifiedAt}>{item.lastVerifiedAt}</time></span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : item.sourceUrl ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center link-underline">Інформація про місто ↗</a>
                        {item.lastVerifiedAt ? <span className="ml-2 inline-block text-sm">· перевірено <time dateTime={item.lastVerifiedAt}>{item.lastVerifiedAt}</time></span> : null}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {route.faq.length > 0 ? (
            <section aria-labelledby="route-faq-heading">
              <p className="type-label text-muted-foreground">Питання</p>
              <h2 id="route-faq-heading" className="mt-2 type-h2">Часті питання</h2>
              <div className="mt-6 [&_details_p]:text-base"><Faq items={route.faq} /></div>
            </section>
          ) : null}

          <RelatedRoutes routes={related} currentRoute={route} />

          {cityHubPaths.some((path) => path === `/cities/${route.origin.slug}/` || path === `/cities/${route.destination.slug}/`) ? (
            <section aria-labelledby="city-directions-heading">
              <h2 id="city-directions-heading" className="type-h2">Інші напрямки вашого міста</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {[route.origin, route.destination].filter((city) => cityHubPaths.some((path) => path === `/cities/${city.slug}/`)).map((city) => (
                  <Link key={city.id} href={`/cities/${city.slug}/`} className="inline-flex min-h-11 items-center border border-border-strong px-4 py-2 type-button hover:bg-secondary">
                    {city.name} ↔ {city.countryCode === "DE" ? "Україна" : "Німеччина"}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <figure>
            <Image
              src={atlasCity}
              alt="Ілюстративна вулиця європейського міста"
              className="photo-atlas aspect-[4/3] w-full object-cover"
            />
            <figcaption className="mt-3 text-sm text-muted-foreground">Ілюстративне фото · не місце посадки чи висадки</figcaption>
          </figure>

          {route.status === "commercial" ? (
            <ShareRoute title={route.title} url={absoluteUrl(`/routes/${route.slug}/`)} />
          ) : null}
        </main>

        <aside className="space-y-10 [&_p]:text-base [&_a]:text-base [&_a]:border-foreground lg:sticky lg:top-28 lg:self-start">
          {carrier ? (
            <PartnerCard
              carrier={publicCarrier(carrier)}
              routeSlug={route.slug}
              ctaLocation="partner_card"
              inquiryOnly
              referralContext={{ originCityId: route.origin.id, destinationCityId: route.destination.id, sourcePath: `/routes/${route.slug}/` }}
            />
          ) : null}
        </aside>
      </div>

      {route.status === "commercial" ? <StickyBookingBar anchorId="inquiry-anchor" /> : null}
    </InquiryProvider>
  );
}
