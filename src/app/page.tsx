import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Eyebrow, IndexBadge, chipLink, ticketCard } from "@/components/brand/editorial";
import { Graticule } from "@/components/brand/graphics";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { RouteList } from "@/components/RouteList";
import { RouteSearch } from "@/components/RouteSearch";
import { getCarrier, publicCarrier } from "@/data/carriers";
import { priorityOriginCityIds } from "@/data/discovery";
import { listResolvedRoutes } from "@/data/queries";
import { brandOrganizationLd, organizationLd, websiteLd, buildMetadata, travelPreviewImage } from "@/lib/seo";

const title = "UARoute — поїздки мікроавтобусом між Україною та Німеччиною";
const description =
  "Оберіть міста для запиту перевізнику: Львів, Івано-Франківськ, Калуш, Стрий, Долина та Ганновер, Целле, Вольфсбург, Брауншвейг. Можливість поїздки й умови підтверджує перевізник.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/", socialImage: travelPreviewImage });

const steps = [
  {
    title: "Оберіть міста",
    text: "Виберіть напрямок і перегляньте наявні поради. Сам вибір міст не підтверджує можливість поїздки.",
  },
  {
    title: "Підготуйте звернення",
    text: "Додайте дату, кількість пасажирів і телефон, щоб скласти повідомлення. Сайт перевізника доступний і без цих полів.",
  },
  {
    title: "Перевірте й надішліть",
    text: "Коли для напрямку доступний WhatsApp, це основний спосіб звернення: перевірте текст і надішліть його перевізнику самостійно.",
  },
];

export default function HomePage() {
  const routes = listResolvedRoutes("commercial");
  const koval = getCarrier("koval");
  const priorityCities = new Set<string>(priorityOriginCityIds);
  const featured = routes.filter((route) =>
    (route.origin.countryCode === "UA" && priorityCities.has(route.origin.id) && route.destination.countryCode === "DE") ||
    (route.destination.countryCode === "UA" && priorityCities.has(route.destination.id) && route.origin.countryCode === "DE"),
  );
  const additional = routes.filter((route) => !featured.some((item) => item.id === route.id));

  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd data={organizationLd()} />
      <JsonLd data={brandOrganizationLd()} />

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative grid items-center gap-8 py-6 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-12">
          <div className="min-w-0">
            <p><Eyebrow>Сплануйте наступну поїздку</Eyebrow></p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,4.5vw,4rem)] font-medium leading-[1.08] tracking-tight">
              Поїздки між Україною
              <br />
              <span className="italic text-primary">та Німеччиною</span>
            </h1>
            <p className="mt-5 max-w-lg type-body text-foreground/85">
              Оберіть міста для запиту перевізнику між Україною (Львів, Івано-Франківськ, Калуш, Стрий, Долина та інші)
              й Німеччиною (Ганновер, Целле, Вольфсбург, Брауншвейг, Люнебург та інші). За інформацією перевізника,
              у Німеччині діє адресна доставка та бронювання без передоплати; можливість поїздки, посадку й висадку підтверджує перевізник.
            </p>

            <div className={`mt-7 ${ticketCard}`}>
              <RouteSearch showPilotChoices />
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <picture>
              <source
                media="(max-width: 639px)"
                srcSet="/arrival-560.webp"
                type="image/webp"
              />
              <Image
                src="/arrival-1120.webp"
                alt="Ілюстрація: мандрівник із валізою на тихій вулиці європейського містечка"
                width={1120}
                height={1400}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 384px, 480px"
                loading="eager"
                className="h-auto w-full hero-arrival"
              />
            </picture>
          </div>
        </div>
      </section>

      <section className="container-page section-band" aria-labelledby="routes-heading">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="type-label text-muted-foreground">Знайдіть свій напрямок</p>
            <h2 id="routes-heading" className="mt-4 type-h1">
              Зі Львова та Івано-Франківська — і назад
            </h2>
          </div>
          <p className="max-w-sm type-body-small text-muted-foreground">
            Перегляньте поради для потрібного напрямку: як описати місце зустрічі,
            що запитати про прибуття та як спланувати подальшу дорогу.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cities/lviv/" className={chipLink}>Львів ↔ Німеччина</Link>
          <Link href="/cities/ivano-frankivsk/" className={chipLink}>Івано-Франківськ ↔ Німеччина</Link>
          <Link href="/cities/hannover/" className={chipLink}>Ганновер ↔ Україна</Link>
        </div>
        <RouteList routes={featured} ctaLocation="route_index" className="mt-8" />
        <details className="mt-8 border-t border-border-strong pt-5">
          <summary className="min-h-11 cursor-pointer type-button text-primary">Додаткові міста й напрямки</summary>
          <RouteList routes={additional} ctaLocation="route_index" className="mt-5" />
        </details>

        <Link href="/routes/" className="mt-8 inline-flex min-h-11 min-w-11 items-center text-sm font-medium text-primary link-underline">
          Усі напрямки →
        </Link>
      </section>

      <section className="container-page section-band" aria-labelledby="how-heading">
        <p className="type-label text-muted-foreground">Як це працює</p>
        <h2 id="how-heading" className="mt-4 max-w-2xl type-h1">
          Від вибору міст до розмови про поїздку
        </h2>

        <ol className="mt-10 grid gap-8 border-t-2 border-border-strong pt-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="min-w-0 [overflow-wrap:anywhere]">
              <IndexBadge index={index + 1} />
              <h3 className="mt-4 font-display text-2xl leading-snug">{step.title}</h3>
              <p className="mt-3 type-body-small text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-2xl type-body-small text-muted-foreground">
          Можливість поїздки на вашу дату, наявність місць та умови підтверджує перевізник.
          Надсилання повідомлення ще не резервує місце.{" "}
          Перегляньте{" "}
          <Link href="/about/#pilot-heading" className="text-primary link-underline">
            міста для виїзду й повернення
          </Link>
          .
        </p>
      </section>

      {koval ? (
        <section className="container-page pb-24">
          <div className="max-w-2xl">
            <PartnerCard carrier={publicCarrier(koval)} ctaLocation="partner_card" inquiryOnly />
          </div>
        </section>
      ) : null}
    </>
  );
}
