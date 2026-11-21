import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import atlasCity from "@/assets/atlas-city.jpg";
import { BookingWidget } from "@/components/BookingWidget";
import { AtlasComposition } from "@/components/brand/AtlasComposition";
import { Graticule } from "@/components/brand/graphics";
import { VerifiedMark } from "@/components/brand/Metadata";
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
              <div className="inline-flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                  {route.corridor.join(" → ")}
                </span>
                <span aria-hidden>·</span>
                <span>{route.status === "commercial" ? "Запит перевізнику" : "Довідка про напрямок"}</span>
              </div>
              <h1 className="mt-2 max-w-4xl break-words type-h1">
                {route.origin.name} <span className="text-primary" aria-hidden>→</span> {route.destination.name}
              </h1>
              <p className="mt-4 max-w-2xl type-body text-foreground/85">{route.description}</p>

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

              {route.status === "commercial" && carrier && carrier.claims.length > 0 ? (
                <div className="mt-7 max-w-2xl min-w-0 border-t-2 border-border-strong pt-5 [overflow-wrap:anywhere]">
                  <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                    <p className="min-w-0 type-label text-foreground">Ключові умови перевізника</p>
                    <VerifiedMark className="min-w-0" />
                  </div>
                  <ul className="mt-4 grid gap-3.5 sm:grid-cols-2">
                    {carrier.claims.map((claim, idx) => (
                      <li key={claim.text} className="flex min-w-0 items-start gap-3">
                        <span
                          aria-hidden
                          className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center border border-primary/25 bg-primary/8 text-primary"
                        >
                          {idx === 0 ? (
                            <svg viewBox="0 0 20 20" fill="none" className="size-4">
                              <circle cx="7.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M3.5 15.5c0-2.2 1.8-3.8 4-3.8s4 1.6 4 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                              <circle cx="13.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                              <path d="M13 12.2c1.9.2 3.5 1.4 3.5 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                          ) : idx === 1 ? (
                            <svg viewBox="0 0 20 20" fill="none" className="size-4">
                              <path d="M10 17s5-4.4 5-8.5A5 5 0 0 0 5 8.5C5 12.6 10 17 10 17Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                              <circle cx="10" cy="8.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                          ) : idx === 2 ? (
                            <svg viewBox="0 0 20 20" fill="none" className="size-4">
                              <path d="M10 2.8 4.2 5v4.6c0 3.9 2.5 6.8 5.8 7.8 3.3-1 5.8-3.9 5.8-7.8V5L10 2.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                              <path d="m7.3 10.1 1.9 1.9 3.6-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 20 20" fill="none" className="size-4">
                              <rect x="2.5" y="5.5" width="15" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M2.5 10h15M6.5 5.5V10M12.5 5.5V10" stroke="currentColor" strokeWidth="1.2" />
                              <circle cx="6" cy="14.5" r="1.5" fill="currentColor" />
                              <circle cx="14" cy="14.5" r="1.5" fill="currentColor" />
                            </svg>
                          )}
                        </span>
                        <div className="min-w-0">
                          <span className="block text-sm font-semibold leading-snug text-foreground">{claim.text}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {idx === 0
                              ? "Міжнародний екіпаж на маршруті"
                              : idx === 1
                                ? route.destination.countryCode === "DE"
                                  ? "Привеземо безпосередньо до вашої адреси та дому за погодженням із диспетчером"
                                  : "Заберемо з вашої адреси в Німеччині за погодженням із диспетчером"
                                : idx === 2
                                  ? "Оплата після узгодження з диспетчером"
                                  : "Комфортні пасажирські мікроавтобуси"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {route.whatToConfirm.length > 0 ? (
                <section className="mt-6 max-w-2xl min-w-0 border-t border-border-strong pt-5 [overflow-wrap:anywhere]" aria-labelledby="conditions-heading">
                  <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                    <h2 id="conditions-heading" className="min-w-0 font-sans text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                      Перед поїздкою уточніть
                    </h2>
                    <span className="min-w-0 text-xs text-muted-foreground">Що диспетчер погодить у WhatsApp</span>
                  </div>
                  <ul className="mt-3.5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {route.whatToConfirm.map((item, index) => {
                      const topics = [
                        "Можливість поїздки на бажану дату",
                        "Вартість і спосіб оплати",
                        "Місце посадки та висадки",
                        "Багаж та особливі речі",
                      ];
                      return (
                        <li key={item} className="flex min-w-0 items-start gap-2.5">
                          <span className="mt-0.5 font-mono text-xs font-semibold text-primary">
                            0{index + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold text-foreground">
                              {topics[index] ?? `Питання ${index + 1}`}
                            </span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">{item}</span>
                          </div>
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
          <figure className="min-w-0 overflow-hidden border border-border-strong bg-card p-2.5 sm:p-3 [overflow-wrap:anywhere]">
            <div className="mb-2.5 flex min-w-0 flex-wrap items-center justify-between gap-2 px-1">
              <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0">
                  <path d="M2.5 7.5 8 2.8l5.5 4.7V13.5a.8.8 0 0 1-.8.8H3.3a.8.8 0 0 1-.8-.8V7.5Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
                  <path d="M6.2 14.3V9.8h3.6v4.5" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
                </svg>
                <span>
                  {route.destination.countryCode === "DE"
                    ? `Адресна доставка в ${route.destination.name} · до вашого дому`
                    : `Посадка за адресою в ${route.origin.name} · до вашого дому`}
                </span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {route.origin.name} → {route.destination.name}
              </span>
            </div>
            <Image
              src={atlasCity}
              alt="Ілюстративна вулиця європейського міста"
              sizes="(max-width: 1023px) 100vw, 672px"
              className="photo-atlas aspect-[16/9] w-full object-cover"
            />
            <figcaption className="mt-2.5 flex min-w-0 flex-wrap items-center justify-between gap-2 px-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {route.destination.countryCode === "DE"
                  ? "Висадка за погодженою адресою — біля вашого дому чи обраного орієнтира (за інформацією перевізника)"
                  : "Адресна посадка в Німеччині та погоджене прибуття за маршрутом (за інформацією перевізника)"}
              </span>
              <span className="text-xs">Ілюстративне фото · не місце посадки чи висадки</span>
            </figcaption>
          </figure>

          {route.practicalContent?.length ? (
            <section aria-labelledby="practical-heading">
              <p className="type-label text-muted-foreground">Практична інформація</p>
              <h2 id="practical-heading" className="mt-2 type-h2">Сплануйте зустріч і прибуття</h2>
              <p className="mt-2 type-body-small text-muted-foreground">
                Орієнтири для напрямку {route.origin.name} → {route.destination.name}, які допоможуть швидко узгодити зручну точку посадки, адресну висадку та багаж із диспетчером.
              </p>
              <div className="mt-6 divide-y divide-border border-t-2 border-border-strong">
                {route.practicalContent.map((item, index) => (
                  <article
                    key={`${item.heading}-${item.body}`}
                    className="grid min-w-0 gap-3 py-6 [overflow-wrap:anywhere] sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5"
                  >
                    <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/8 font-mono text-xs font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="min-w-0 font-display text-2xl leading-snug text-foreground">
                        {item.heading || "Додатковий багаж та перевезення велосипеда"}
                      </h3>
                      <p className="mt-2.5 type-body text-muted-foreground">{item.body}</p>
                      {item.links?.length ? (
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                          {item.links.map((link) => (
                            <li key={link.url}>
                              <a
                                href={link.url}
                                {...(link.url.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className="inline-flex min-h-11 items-center font-medium text-primary link-underline"
                              >
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : item.sourceUrl ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center font-medium text-primary link-underline"
                          >
                            Інформація про місто ↗
                          </a>
                        </p>
                      ) : null}
                    </div>
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

          {route.status === "commercial" ? (
            <ShareRoute title={route.title} url={absoluteUrl(`/routes/${route.slug}/`)} />
          ) : null}
        </main>

        <aside className="space-y-8 [&_p]:text-base [&_a]:text-base lg:sticky lg:top-28 lg:self-start">
          <AtlasComposition
            originLabel={route.origin.name}
            destinationLabel={route.destination.name}
            originCountryCode={route.origin.countryCode}
            destinationCountryCode={route.destination.countryCode}
            corridor={route.corridor}
          />

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
            <section className="min-w-0 border-t-2 border-border-strong pt-6 [overflow-wrap:anywhere]" aria-labelledby="how-inquiry-works-heading">
              <p className="type-label text-muted-foreground">Прозорий процес</p>
              <h2 id="how-inquiry-works-heading" className="mt-2 min-w-0 type-h2 text-foreground">
                Як відбувається погодження поїздки
              </h2>
              <ol className="mt-5 space-y-4 border-l-2 border-primary/35 pl-4 text-sm text-muted-foreground">
                <li className="min-w-0">
                  <span className="block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">Крок 01 · Заявка без передоплати</span>
                  <span className="mt-1 block min-w-0 text-foreground/85">Вкажіть бажану дату, кількість місць і телефон у формі звернення — без жодної оплати на сайті.</span>
                </li>
                <li className="min-w-0">
                  <span className="block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">Крок 02 · Прямий чат у WhatsApp</span>
                  <span className="mt-1 block min-w-0 text-foreground/85">Надішліть сформоване повідомлення напряму диспетчеру у WhatsApp (або перейдіть на сайт перевізника).</span>
                </li>
                <li className="min-w-0">
                  <span className="block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">Крок 03 · Особисте підтвердження</span>
                  <span className="mt-1 block min-w-0 text-foreground/85">Диспетчер особисто підтвердить наявність місць, повну вартість та зручне місце посадки й висадки.</span>
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
