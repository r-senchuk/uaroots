import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import atlasCity from "@/assets/atlas-city.jpg";
import { BookingWidget } from "@/components/BookingWidget";
import { Graticule } from "@/components/brand/graphics";
import { VerifiedMark } from "@/components/brand/Metadata";
import { RouteLine } from "@/components/brand/RouteLine";
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

              {route.status === "commercial" && carrier ? (
                <div className="mt-6 max-w-2xl min-w-0 border border-border-strong bg-card/80 p-3 sm:p-5 [overflow-wrap:anywhere]">
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 type-label text-muted-foreground">
                      Маршрутний коридор · {route.corridor.join(" → ")}
                    </span>
                    <VerifiedMark className="min-w-0" />
                  </div>
                  <RouteLine
                    variant="card"
                    originLabel={route.origin.name}
                    destinationLabel={route.destination.name}
                    waypoints={route.corridor}
                    highlightDestination
                    className="mt-3"
                  />
                  {carrier.claims.length > 0 ? (
                    <ul className="mt-4 grid gap-2.5 border-t border-border pt-4 sm:grid-cols-2">
                      {carrier.claims.map((claim) => (
                        <li key={claim.text} className="flex min-w-0 items-start gap-2 text-sm text-foreground">
                          <span aria-hidden className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="min-w-0 font-medium">{claim.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {route.whatToConfirm.length > 0 ? (
                <section className="mt-5 max-w-2xl min-w-0 border border-border-strong bg-secondary/40 p-3 sm:p-5 [overflow-wrap:anywhere]" aria-labelledby="conditions-heading">
                  <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                    <h2 id="conditions-heading" className="min-w-0 text-base font-semibold text-foreground">Перед поїздкою уточніть</h2>
                    <span className="min-w-0 text-xs text-muted-foreground">Диспетчер погодить у WhatsApp</span>
                  </div>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {route.whatToConfirm.map((item, index) => {
                      const topics = [
                        "Можливість поїздки на бажану дату",
                        "Вартість і спосіб оплати",
                        "Місце посадки та висадки",
                        "Багаж та особливі речі",
                      ];
                      return (
                        <li key={item} className="min-w-0 border-l-2 border-primary pl-3">
                          <span className="block text-xs font-medium text-foreground">
                            {topics[index] ?? `Питання ${index + 1}`}
                          </span>
                          <span className="mt-0.5 block text-sm text-muted-foreground">{item}</span>
                        </li>
                      );
                    })}
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
              <p className="mt-2 type-body-small text-muted-foreground">
                Короткі орієнтири для напрямку {route.origin.name} → {route.destination.name}, які допоможуть швидко узгодити зручну точку посадки, висадку та багаж із диспетчером.
              </p>
              <div className="mt-6 space-y-5">
                {route.practicalContent.map((item, index) => (
                  <article key={`${item.heading}-${item.body}`} className="min-w-0 border border-border-strong bg-card/60 p-3 sm:p-6 [overflow-wrap:anywhere]">
                    <span className="block font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      {String(index + 1).padStart(2, "0")} · Орієнтир
                    </span>
                    <h3 className="mt-1.5 min-w-0 font-display text-2xl leading-snug text-foreground">
                      {item.heading || "Додатковий багаж та перевезення велосипеда"}
                    </h3>
                    <p className="mt-3 type-body text-muted-foreground">{item.body}</p>
                    {item.links?.length ? (
                      <ul className="mt-4 space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
                        {item.links.map((link) => (
                          <li key={link.url}>
                            <a href={link.url} {...(link.url.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex min-h-11 items-center font-medium text-primary link-underline">{link.label}</a>
                          </li>
                        ))}
                      </ul>
                    ) : item.sourceUrl ? (
                      <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium text-primary link-underline">Інформація про місто ↗</a>
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {route.faq.length > 0 ? (
            <section aria-labelledby="route-faq-heading">
              <p className="type-label text-muted-foreground">Питання та відповіді</p>
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
                    {route.id === "lviv-hannover" && city.id === "lviv"
                      ? "Інші напрямки зі Львова та повернення до Львова"
                      : `${city.name} ↔ ${city.countryCode === "DE" ? "Україна" : "Німеччина"}`}
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

        <aside className="space-y-8 [&_p]:text-base [&_a]:text-base [&_a]:border-foreground lg:sticky lg:top-28 lg:self-start">
          {carrier ? (
            <PartnerCard
              carrier={publicCarrier(carrier)}
              routeSlug={route.slug}
              ctaLocation="partner_card"
              inquiryOnly={route.status !== "commercial"}
              referralContext={{ originCityId: route.origin.id, destinationCityId: route.destination.id, sourcePath: `/routes/${route.slug}/` }}
            />
          ) : null}

          {route.status === "commercial" ? (
            <section className="min-w-0 border border-border-strong bg-secondary/40 p-3 sm:p-5 [overflow-wrap:anywhere]" aria-labelledby="how-inquiry-works-heading">
              <p className="type-label text-muted-foreground">Прозорий процес</p>
              <h2 id="how-inquiry-works-heading" className="mt-2 min-w-0 font-display text-xl text-foreground">
                Як відбувається погодження поїздки
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex min-w-0 items-start gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary">01</span>
                  <span className="min-w-0">Вкажіть бажану дату, кількість місць і телефон у формі звернення — без жодної оплати на сайті.</span>
                </li>
                <li className="flex min-w-0 items-start gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary">02</span>
                  <span className="min-w-0">Надішліть сформоване повідомлення напряму диспетчеру у WhatsApp (або перейдіть на сайт перевізника).</span>
                </li>
                <li className="flex min-w-0 items-start gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary">03</span>
                  <span className="min-w-0">Диспетчер особисто підтвердить наявність місць, повну вартість та зручне місце посадки й висадки.</span>
                </li>
              </ol>
            </section>
          ) : null}
        </aside>
      </div>

      {route.status === "commercial" ? <StickyBookingBar anchorId="inquiry-anchor" /> : null}
    </InquiryProvider>
  );
}
