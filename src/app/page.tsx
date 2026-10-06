import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import atlasRoad from "@/assets/atlas-road.jpg";
import { TopoPattern } from "@/components/brand/graphics";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { RouteList } from "@/components/RouteList";
import { RouteSearch } from "@/components/RouteSearch";
import { getCarrier, publicCarrier } from "@/data/carriers";
import { priorityOriginCityIds, pilotGermanCityIds } from "@/data/discovery";
import { listResolvedRoutes } from "@/data/queries";
import { organizationLd, websiteLd, buildMetadata, travelPreviewImage } from "@/lib/seo";

const title = "UARoute — поїздки між Україною та Німеччиною";
const description =
  "Поїздки зі Львова, Івано-Франківська та інших міст до Німеччини й назад. Оберіть напрямок, перегляньте питання про посадку й багаж та зверніться до перевізника Коваль.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/", socialImage: travelPreviewImage });

const steps = [
  {
    title: "Оберіть міста",
    text: "Укажіть, звідки й куди хочете їхати. Для повернення перемкніть напрямок — вибрані міста збережуться.",
  },
  {
    title: "Додайте деталі",
    text: "Зазначте бажану дату, кількість пасажирів і телефон для зв’язку. UARoute складе повідомлення з вашим напрямком та цими деталями.",
  },
  {
    title: "Надішліть у WhatsApp",
    text: "Перевірте підготовлений текст, додайте свої запитання й надішліть його перевізнику Коваль.",
  },
];

export default function HomePage() {
  const routes = listResolvedRoutes("commercial");
  const koval = getCarrier("koval");
  const featured = routes.filter((route) => pilotGermanCityIds.some((id) => id === route.origin.id || id === route.destination.id) && priorityOriginCityIds.some((id) => id === route.origin.id || id === route.destination.id));
  const additional = routes.filter((route) => !featured.some((item) => item.id === route.id));

  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd data={organizationLd()} />

      <section className="relative border-b border-border-strong">
        <div className="container-page relative grid items-center gap-8 py-6 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-12">
          <div>
            <p className="type-label text-muted-foreground">Сплануйте наступну поїздку</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,4.5vw,4rem)] font-medium leading-[1.08] tracking-tight">
              Поїздки між Україною
              <br />
              <span className="italic text-primary">та Німеччиною</span>
            </h1>
            <p className="mt-5 max-w-lg type-body text-muted-foreground">
              Зі Львова, Івано-Франківська та інших міст — і назад.
              Оберіть міста, дізнайтеся, що запитати про посадку, ціну й багаж,
              та зверніться до перевізника Коваль.
            </p>

            <div className="mt-7 border-t border-border-strong pt-5">
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
          <div>
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
          <Link href="/cities/lviv/" className="inline-flex min-h-11 items-center border border-border-strong px-4 py-2 type-button hover:bg-secondary">Львів ↔ Німеччина</Link>
          <Link href="/cities/ivano-frankivsk/" className="inline-flex min-h-11 items-center border border-border-strong px-4 py-2 type-button hover:bg-secondary">Івано-Франківськ ↔ Німеччина</Link>
        </div>
        <RouteList routes={featured} ctaLocation="route_index" className="mt-8" />
        <details className="mt-8 border-t border-border-strong pt-5">
          <summary className="min-h-11 cursor-pointer type-button text-primary">Додаткові міста й напрямки</summary>
          <RouteList routes={additional} ctaLocation="route_index" className="mt-5" />
        </details>

        <Link href="/routes/" className="mt-8 inline-flex type-label text-primary link-underline">
          Усі напрямки →
        </Link>
      </section>

      <section className="relative border-y border-border-strong">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <Image
            src={atlasRoad}
            alt="Європейська автомагістраль на світанку"
            className="photo-atlas h-full w-full object-cover"
          />
          <div className="relative flex flex-col justify-center overflow-hidden bg-surface p-8 lg:p-14">
            <TopoPattern />
            <p className="relative type-label text-muted-foreground">Перед поїздкою</p>
            <h2 className="relative mt-6 max-w-sm type-h2">Що запитати у перевізника</h2>
            <ul className="relative mt-6 max-w-md space-y-4 type-body-small text-muted-foreground">
              <li><strong className="text-foreground">Виїзд і прибуття.</strong> Де зустрічаєтеся, о котрій виїзд і де буде висадка?</li>
              <li><strong className="text-foreground">Вартість.</strong> Яка загальна ціна та як оплатити поїздку?</li>
              <li><strong className="text-foreground">Багаж.</strong> Скільки валіз можна взяти та чи потрібна доплата?</li>
              <li><strong className="text-foreground">Ваші потреби.</strong> Чи можна їхати з дитиною, взяти великий багаж або погодити зручне місце зустрічі?</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page section-band" aria-labelledby="how-heading">
        <p className="type-label text-muted-foreground">Як це працює</p>
        <h2 id="how-heading" className="mt-4 max-w-2xl type-h1">
          Від вибору міст до розмови про поїздку
        </h2>

        <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-border-strong pt-5">
              <span className="type-index text-accent-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-2xl font-normal leading-tight">{step.title}</h3>
              <p className="mt-3 type-body-small text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-2xl type-body-small text-muted-foreground">
          Можливість поїздки на вашу дату, наявність місць та умови підтверджує перевізник Коваль.
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
