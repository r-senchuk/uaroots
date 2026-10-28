import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { KovalReferralLink } from "@/components/KovalReferralLink";
import { NearbyPlaces } from "@/components/NearbyPlaces";
import { RouteSearch } from "@/components/RouteSearch";
import { getCity } from "@/data/cities";
import { cityHubPaths } from "@/data/discovery";
import { getCityHubContent } from "@/data/city-hubs";
import { getCityHubPresentation } from "@/lib/city-hub-presentation";
import { breadcrumbLd, buildMetadata, cityHubCollectionLd, travelPreviewImage } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

const hubs = cityHubPaths.map((path) => path.split("/")[2]!);

function isSelectedHubSlug(slug: string) {
  return cityHubPaths.some((path) => path === `/cities/${slug}/`);
}

export function generateStaticParams() {
  return hubs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  const details = city && isSelectedHubSlug(slug) ? getCityHubContent(city.id) : undefined;
  if (!details) return { title: "Місто не знайдено | UARoute", robots: { index: false } };
  return buildMetadata({ title: details.title, description: details.description, path: `/cities/${slug}/`, socialImage: travelPreviewImage });
}

export default async function CityHubPage({ params }: PageProps) {
  const { slug } = await params;
  const city = getCity(slug);
  const details = city && isSelectedHubSlug(slug) ? getCityHubContent(city.id) : undefined;
  if (!city || !details) notFound();
  const presentation = getCityHubPresentation(city, details.fromName, details.toName, details.routeSlugs);
  if (!presentation) notFound();
  const priorityHub = city.id === "lviv" || city.id === "ivano-frankivsk";
  const choiceDirections = presentation.choiceDirections.map(({ city: choiceCity, departureRoute, returnRoute }) => ({
    city: choiceCity,
    ...(departureRoute ? { departureHref: `/routes/${departureRoute.slug}/` } : {}),
    ...(returnRoute ? { returnHref: `/routes/${returnRoute.slug}/` } : {}),
  }));

  const crumbs = [
    { name: "Головна", path: "/" },
    { name: "Маршрути", path: "/routes/" },
    { name: city.name, path: `/cities/${city.slug}/` },
  ];
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={cityHubCollectionLd(city, details, presentation.routeCards)} />
      <section className="border-b border-border-strong">
        <div className={priorityHub ? "container-page pb-3 pt-3" : "container-page pb-8 pt-8 sm:pb-10"}>
          <Breadcrumbs items={crumbs} />
          <p className={priorityHub ? "hidden" : "mt-6 type-label text-muted-foreground"}>{presentation.departureLabel} · {presentation.arrivalLabel}</p>
          <h1 className={priorityHub ? "mt-3 max-w-4xl type-h1" : "mt-3 max-w-4xl type-h1"}>{details.heading}</h1>
          <p className={priorityHub ? "mt-3 max-w-3xl type-body text-muted-foreground" : "mt-4 max-w-3xl type-body text-muted-foreground"}>{details.intro}</p>
        </div>
      </section>

      <section className={priorityHub ? "container-page py-3 sm:py-6" : "container-page py-8 sm:py-10"} aria-labelledby="search-heading">
        <p className="type-label text-muted-foreground">Вибір напрямку</p>
        <h2 id="search-heading" tabIndex={-1} className="mt-2 scroll-mt-[calc(var(--header-height,4.5rem)+1rem)] type-h2">Куди хочете їхати?</h2>
        <div className={priorityHub ? "mt-3 max-w-5xl" : "mt-8 max-w-5xl border border-border-strong p-5 sm:p-8"}>
          <RouteSearch
            key={city.id}
            sourcePath={`/cities/${city.slug}/`}
            ctaLocation="route_index"
            initialOriginId={presentation.initialOriginId}
            showPilotChoices
            overviewCity={city}
            choiceDirections={choiceDirections}
            choiceHeading={presentation.choiceHeading}
          >
        <p className="mt-3 max-w-2xl type-body text-muted-foreground">
          {presentation.searchDescription}
        </p>
        <p className="mt-5 max-w-3xl border-l-2 border-primary pl-4 type-body text-muted-foreground">
          Можливість поїздки на вашу дату, наявність місць, місця посадки й висадки та ціну підтверджує перевізник у відповідь на звернення.
        </p>
          </RouteSearch>
        </div>
      </section>

      <NearbyPlaces
        heading={details.nearbyHeading}
        intro={details.nearbyIntro}
        actionText={details.nearbyActionText}
        places={details.nearbyPlaces}
      />

      <section className="border-y border-border-strong bg-secondary/40">
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="type-label text-muted-foreground">{presentation.departureLabel}</p>
            <h2 className="mt-3 type-h2">{presentation.departureHeading}</h2>
            <p className="mt-4 max-w-xl type-body text-muted-foreground">{details.outbound}</p>
          </div>
          <div>
            <p className="type-label text-muted-foreground">{presentation.arrivalLabel}</p>
            <h2 className="mt-3 type-h2">{presentation.arrivalHeading}</h2>
            <p className="mt-4 max-w-xl type-body text-muted-foreground">{details.returning}</p>
          </div>
          {details.planningResources.length > 0 ? (
            <div className="lg:col-span-2">
              <h3 className="type-h3">Корисний довідник</h3>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {details.planningResources.map((resource) => (
                  <li key={resource.url} className="border border-border-strong p-5">
                    <a className="inline-flex min-h-11 items-center link-underline" href={resource.url}>
                      {resource.label} ↗
                    </a>
                    <p className="mt-2 type-body text-muted-foreground">{resource.purpose}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Довідник переглянуто <time dateTime={resource.checkedAt}>{resource.checkedAt}</time>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground lg:col-span-2">
            Редакційні поради переглянуто <time dateTime={details.contentReview.reviewedAt}>{details.contentReview.reviewedAt}</time>
          </p>
        </div>
      </section>

      <section className="border-y border-border-strong bg-secondary/40">
        <div className="container-page py-12 sm:py-16">
          <p className="type-label text-muted-foreground">Поради для вашого напрямку</p>
          <h2 className="mt-3 type-h2">Місце зустрічі, прибуття та підготовка</h2>
          <p className="mt-3 max-w-2xl type-body text-muted-foreground">
            Перегляньте поради для потрібної пари міст, перш ніж писати перевізнику. Вони допоможуть описати зручне місце зустрічі та продумати подальшу дорогу.
          </p>
          <ul className="mt-7 grid gap-4 md:grid-cols-2">
            {presentation.routeCards.map((route) => (
              <li key={route.slug} className="border border-border-strong p-5">
                <h3 className="font-display text-xl">{route.title}</h3>
                <p className="mt-2 type-body text-muted-foreground">{route.description}</p>
                <Link className="mt-4 inline-flex min-h-11 items-center link-underline" href={`/routes/${route.slug}/`}>Поради: {route.title}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 [&_details_p]:text-base"><Faq items={[...details.faq]} /></div>
          <p className="mt-8 max-w-2xl type-body text-muted-foreground">
            Повертаєтеся до планування пізніше? Збережіть посилання на потрібний напрямок.
            Для наступної поїздки дату та умови потрібно погодити заново.
          </p>
          <KovalReferralLink
            href="https://www.4k-koval.com/"
            content="site_route_index"
            ctaLocation="route_index"
            referralContext={{ originCityId: city.id, sourcePath: `/cities/${city.slug}/` }}
            className="mt-5 inline-flex min-h-11 items-center type-button text-primary link-underline"
          >
            Контакти перевізника на його сайті ↗
          </KovalReferralLink>
          <p className="mt-2 text-sm text-muted-foreground">{priorityHub ? "Дата ще невідома або не користуєтеся WhatsApp? Відкрийте сайт перевізника — для переходу не потрібно вводити дату чи телефон. Відкриється сайт перевізника." : "Відкриється сайт перевізника."}</p>
          <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-border-strong pt-5 type-body" aria-label="Інші міські огляди">
            {presentation.relatedHubs.map(({ city: relatedCity, label }) => (
              <Link key={relatedCity.id} className="inline-flex min-h-11 items-center link-underline" href={`/cities/${relatedCity.slug}/`}>
                {label} →
              </Link>
            ))}
            <Link className="inline-flex min-h-11 items-center link-underline" href="/guides/perevezennya-velosypeda/">
              Поради щодо перевезення велосипеда →
            </Link>
          </nav>
        </div>
      </section>
    </>
  );
}
