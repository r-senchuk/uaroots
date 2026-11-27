import type { Metadata } from "next";
import Link from "next/link";

import {
  BicycleIcon,
  Eyebrow,
  IconTile,
  IndexBadge,
  ticketCard,
} from "@/components/brand/editorial";
import { Graticule } from "@/components/brand/graphics";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RouteList } from "@/components/RouteList";
import { RouteSearch } from "@/components/RouteSearch";
import { priorityOriginCityIds } from "@/data/discovery";
import { listResolvedRoutes } from "@/data/queries";
import { breadcrumbLd, buildMetadata, routeIndexCollectionLd, travelPreviewImage } from "@/lib/seo";

const title = "Поїздки Україна — Німеччина: оберіть міста | UARoute";
const description =
  "Оберіть українське та німецьке місто для запиту перевізнику: Львів, Івано-Франківськ, Калуш, Стрий, Долина та Ганновер, Целле, Вольфсбург, Брауншвейг, Люнебург.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/routes/", socialImage: travelPreviewImage });

const crumbs = [
  { name: "Головна", path: "/" },
  { name: "Маршрути", path: "/routes/" },
];

const hubCards = [
  {
    href: "/cities/lviv/",
    title: "Львів ↔ Німеччина",
    cta: "Напрямки та підготовка поїздки →",
    tag: "UA ⇄ DE",
  },
  {
    href: "/cities/ivano-frankivsk/",
    title: "Івано-Франківськ ↔ Німеччина",
    cta: "Напрямки та підготовка поїздки →",
    tag: "UA ⇄ DE",
  },
  {
    href: "/cities/stryi/",
    title: "Стрий ↔ Німеччина",
    cta: "Напрямки та підготовка поїздки →",
    tag: "UA ⇄ DE",
  },
  {
    href: "/cities/celle/",
    title: "Целле ↔ Україна",
    cta: "Міста, напрямки та підготовка поїздки →",
    tag: "DE ⇄ UA",
  },
  {
    href: "/cities/hannover/",
    title: "Ганновер ↔ Україна",
    cta: "Напрямки в Нижній Саксонії та підготовка поїздки →",
    tag: "DE ⇄ UA",
  },
] as const;

export default function RoutesIndexPage() {
  const routes = listResolvedRoutes("commercial");
  const priorityCities = new Set<string>(priorityOriginCityIds);
  const outbound = routes.filter((route) => route.origin.countryCode === "UA" && priorityCities.has(route.origin.id) && route.destination.countryCode === "DE");
  const inbound = routes.filter((route) => route.origin.countryCode === "DE" && route.destination.countryCode === "UA" && priorityCities.has(route.destination.id));
  const primaryIds = new Set([...outbound, ...inbound].map((route) => route.id));
  const additional = routes.filter((route) => !primaryIds.has(route.id));

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={routeIndexCollectionLd(title, description, routes)} />

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-8 pt-4">
          <Breadcrumbs items={crumbs} />
          <p className="mt-4"><Eyebrow>Куди плануєте їхати?</Eyebrow></p>
          <h1 className="mt-4 max-w-4xl type-h1">Поїздки між Україною та Німеччиною</h1>
          <p className="mt-5 max-w-2xl type-body text-foreground/85">
            Оберіть українське та німецьке місто (зокрема Львів, Івано-Франківськ, Калуш, Стрий, Долина та
            Ганновер, Целле, Вольфсбург, Брауншвейг, Люнебург), щоб надіслати запит перевізнику.
            Можливість поїздки на вашу дату, посадку та висадку підтверджує перевізник; для зворотного напрямку перемкніть пошук на «До України».
          </p>
          <div className={`mt-7 ${ticketCard}`}>
            <RouteSearch sourcePath="/routes/" ctaLocation="route_index" showPilotChoices />
          </div>
        </div>
      </section>

      <div className="container-page space-y-12 py-10 sm:py-14">
        <section aria-labelledby="origin-guides-heading">
          <h2 id="origin-guides-heading" className="type-h2">Напрямки з вашого міста та назад</h2>
          <p className="mt-3 max-w-2xl type-body-small text-muted-foreground">На сторінках міст зібрано напрямки виїзду й повернення та поради для підготовки. Для іншого міста скористайтеся пошуком вище.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {hubCards.map((card, index) => (
              <Link
                key={card.href}
                href={card.href}
                className="group min-w-0 border border-border-strong bg-card p-5 transition-colors hover:border-primary/50 hover:bg-secondary/40 [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="flex items-center justify-between gap-2">
                  <IndexBadge index={index + 1} />
                  <span aria-hidden className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {card.tag}
                  </span>
                </span>
                <span className="mt-4 block font-display text-3xl text-foreground transition-colors group-hover:text-primary">{card.title}</span>
                <span className="mt-3 block type-button text-primary">{card.cta}</span>
              </Link>
            ))}
          </div>
        </section>

        {[
          { tag: "UA → DE", title: "Зі Львова та Івано-Франківська до Німеччини", items: outbound },
          { tag: "DE → UA", title: "З Німеччини до Львова та Івано-Франківська", items: inbound },
          { tag: "Інші міста", title: "Додаткові міста й напрямки", items: additional },
        ].map(({ tag, title: heading, items }) => (
          <section key={heading}>
            <p className="type-label text-muted-foreground">{tag}</p>
            <h2 className="mt-2 type-h2">{heading}</h2>
            <RouteList routes={items} ctaLocation="route_index" className="mt-5" />
          </section>
        ))}

        <section aria-labelledby="planning-guides-heading" className="border-t border-border-strong pt-8">
          <div className="min-w-0 border border-border-strong bg-card p-5 [overflow-wrap:anywhere]">
            <div className="flex min-w-0 items-start gap-4">
              <IconTile className="mt-1">
                <BicycleIcon />
              </IconTile>
              <div className="min-w-0">
                <h2 id="planning-guides-heading" className="type-h2">Практичні поради перед поїздкою</h2>
                <p className="mt-3 max-w-2xl type-body-small text-muted-foreground">
                  Якщо берете нестандартний багаж, звірте заздалегідь, що уточнити у перевізника.
                </p>
                <Link href="/guides/perevezennya-velosypeda/" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary link-underline">
                  Перевезення велосипеда: що погодити з перевізником →
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
