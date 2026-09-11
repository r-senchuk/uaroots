import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import atlasRoad from "@/assets/atlas-road.jpg";
import { AtlasComposition } from "@/components/brand/AtlasComposition";
import { CoordinateTexture, Graticule, TopoPattern } from "@/components/brand/graphics";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { RouteList } from "@/components/RouteList";
import { RouteSearch } from "@/components/RouteSearch";
import { getCarrier, publicCarrier } from "@/data/carriers";
import { listResolvedRoutes } from "@/data/queries";
import { organizationLd, websiteLd, buildMetadata } from "@/lib/seo";

const title = "UARoute — маршрути з України до Європи";
const description =
  "Знайдіть маршрут з України до Європи, дізнайтеся, що варто уточнити перед поїздкою, і надішліть запит перевізнику у WhatsApp.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/" });

const steps = [
  {
    title: "Знайдіть напрямок",
    text: "Оберіть місто відправлення та місто призначення — відкриється сторінка маршруту.",
  },
  {
    title: "Дізнайтеся важливе",
    text: "Що відомо про коридор, хто виконує перевезення і що варто уточнити перед поїздкою.",
  },
  {
    title: "Напишіть перевізнику",
    text: "Дата, телефон і кількість пасажирів — готове повідомлення відкриється у WhatsApp.",
  },
];

export default function HomePage() {
  const routes = listResolvedRoutes("commercial");
  const koval = getCarrier("koval");
  const lead = routes[0];

  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd data={organizationLd()} />

      <section className="relative border-b border-border-strong">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <Graticule />
        </div>
        <div className="container-page relative z-10 grid items-end gap-12 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div>
            <p className="type-label text-muted-foreground">UA → EU · Атлас маршрутів</p>
            <h1 className="mt-8 type-display">
              Маршрути
              <br />
              з України
              <br />
              <span className="italic text-primary">до Європи</span>
            </h1>
            <p className="mt-8 max-w-md type-lead text-muted-foreground">
              UARoute — незалежний атлас напрямків. Ми не перевозимо пасажирів: ми допомагаємо
              зрозуміти маршрут і зв&apos;язатися з перевізником.
            </p>

            <div className="mt-12 border-t border-border-strong pt-8">
              <RouteSearch />
            </div>
          </div>

          <div className="relative">
            {lead ? (
              <AtlasComposition
                originLabel={lead.origin.name}
                destinationLabel={lead.destination.name}
                corridor={lead.corridor}
                className="mx-auto max-w-md lg:max-w-none"
              />
            ) : null}
            <CoordinateTexture
              className="absolute bottom-0 right-0 hidden text-right lg:block"
              labels={["52.37 N / 09.73 E", "Схема, а не мапа"]}
            />
          </div>
        </div>
      </section>

      <section className="container-page section-band" aria-labelledby="routes-heading">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="type-label text-muted-foreground">Індекс напрямків</p>
            <h2 id="routes-heading" className="mt-4 type-h1">
              Напрямки
            </h2>
          </div>
          <p className="max-w-sm type-body-small text-muted-foreground">
            Кожна сторінка маршруту показує коридор, перевізника і перелік того, що варто уточнити
            перед поїздкою.
          </p>
        </div>

        <RouteList routes={routes} ctaLocation="route_index" className="mt-12" />

        <Link href="/routes/" className="mt-8 inline-flex type-label text-primary link-underline">
          Усі маршрути →
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
            <p className="relative type-label text-muted-foreground">Дорога</p>
            <p className="relative mt-6 max-w-sm font-display text-2xl leading-snug lg:text-3xl">
              Кожна подорож — це лінія, що з&apos;єднує два місця. Ми описуємо цю лінію чесно: без
              вигаданих розкладів, цін і обіцянок.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page section-band" aria-labelledby="how-heading">
        <p className="type-label text-muted-foreground">Як це працює</p>
        <h2 id="how-heading" className="mt-4 max-w-2xl type-h1">
          Від пошуку напрямку до розмови з перевізником
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
      </section>

      {koval ? (
        <section className="container-page pb-24">
          <div className="max-w-2xl">
            <PartnerCard carrier={publicCarrier(koval)} ctaLocation="partner_card" />
            <p className="mt-6 type-body-small text-muted-foreground">
              Цікавить пересилання посилок? Це окремий напрямок обслуговування —{" "}
              <Link href="/about/" className="link-underline">
                дізнайтеся, як працює UARoute
              </Link>
              , і зверніться до перевізника окремо.
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
