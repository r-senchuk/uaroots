import type { Metadata } from "next";

import { Graticule } from "@/components/brand/graphics";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { RouteList } from "@/components/RouteList";
import { RouteSearch } from "@/components/RouteSearch";
import { pilotGermanCityIds, priorityOriginCityIds } from "@/data/discovery";
import { listResolvedRoutes } from "@/data/queries";
import { breadcrumbLd, buildMetadata, travelPreviewImage } from "@/lib/seo";

const title = "Поїздки Україна — Німеччина: оберіть міста | UARoute";
const description =
  "Знайдіть напрямок зі Львова, Івано-Франківська чи іншого українського міста до Німеччини та назад. Поради для підготовки й повідомлення перевізнику Коваль.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/routes/", socialImage: travelPreviewImage });

const crumbs = [
  { name: "Головна", path: "/" },
  { name: "Маршрути", path: "/routes/" },
];

export default function RoutesIndexPage() {
  const routes = listResolvedRoutes("commercial");
  const outbound = routes.filter((route) => priorityOriginCityIds.some((id) => id === route.origin.id) && pilotGermanCityIds.some((id) => id === route.destination.id));
  const inbound = routes.filter((route) => priorityOriginCityIds.some((id) => id === route.destination.id) && pilotGermanCityIds.some((id) => id === route.origin.id));
  const primaryIds = new Set([...outbound, ...inbound].map((route) => route.id));
  const additional = routes.filter((route) => !primaryIds.has(route.id));

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />

      <section className="relative border-b border-border-strong">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden><Graticule /></div>
        <div className="container-page relative pb-10 pt-8">
          <Breadcrumbs items={crumbs} />
          <p className="mt-8 type-label text-muted-foreground">Куди плануєте їхати?</p>
          <h1 className="mt-4 max-w-4xl type-h1">Поїздки між Україною та Німеччиною</h1>
          <p className="mt-5 max-w-2xl type-body text-muted-foreground">
            Оберіть міста, щоб звернутися до перевізника й з’ясувати умови вашої поїздки.
            У добірках нижче є поради про місце зустрічі та подальшу дорогу.
            Для поїздки з Німеччини перемкніть пошук на «До України».
          </p>
          <div className="mt-8 border-t border-border-strong pt-6">
            <RouteSearch sourcePath="/routes/" ctaLocation="route_index" showPilotChoices />
          </div>
        </div>
      </section>

      <div className="container-page space-y-12 py-10 sm:py-14">
        <section aria-labelledby="origin-guides-heading">
          <h2 id="origin-guides-heading" className="type-h2">Напрямки з вашого міста та назад</h2>
          <p className="mt-3 max-w-2xl type-body-small text-muted-foreground">На сторінках міст зібрано напрямки виїзду й повернення та поради для підготовки. Для іншого міста скористайтеся пошуком вище.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Link href="/cities/lviv/" className="border border-border-strong p-5 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary">
              <span className="block font-display text-3xl">Львів ↔ Німеччина</span>
              <span className="mt-3 block type-button text-primary">Напрямки та підготовка поїздки →</span>
            </Link>
            <Link href="/cities/ivano-frankivsk/" className="border border-border-strong p-5 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary">
              <span className="block font-display text-3xl">Івано-Франківськ ↔ Німеччина</span>
              <span className="mt-3 block type-button text-primary">Напрямки та підготовка поїздки →</span>
            </Link>
            <Link href="/cities/celle/" className="border border-border-strong p-5 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary">
              <span className="block font-display text-3xl">Целле ↔ Україна</span>
              <span className="mt-3 block type-button text-primary">Міста, напрямки та підготовка поїздки →</span>
            </Link>
          </div>
        </section>

        {[
          { title: "Зі Львова та Івано-Франківська до Німеччини", items: outbound },
          { title: "З Німеччини до Львова та Івано-Франківська", items: inbound },
          { title: "Додаткові міста й напрямки", items: additional },
        ].map(({ title: heading, items }) => (
          <section key={heading}>
            <h2 className="type-h2">{heading}</h2>
            <RouteList routes={items} ctaLocation="route_index" className="mt-5" />
          </section>
        ))}

        <section className="border-t border-border-strong pt-8" aria-labelledby="request-steps-heading">
          <h2 id="request-steps-heading" className="type-h2">Що повідомити перевізнику</h2>
          <ol className="mt-5 grid gap-5 type-body-small text-muted-foreground sm:grid-cols-3">
            <li><strong className="block text-foreground">Дата та пасажири</strong> Зазначте бажану дату й кількість людей. Якщо дата гнучка, додайте можливі варіанти в повідомленні.</li>
            <li><strong className="block text-foreground">Місце зустрічі</strong> Напишіть зручний район, адресу чи орієнтир. Запитайте, де можна погодити посадку та висадку.</li>
            <li><strong className="block text-foreground">Багаж та особливі потреби</strong> Опишіть кількість валіз, великий багаж або поїздку з дитиною, щоб одразу обговорити потрібні умови.</li>
          </ol>
          <p className="mt-5 max-w-3xl type-body-small text-muted-foreground">Можливість поїздки на вашу дату, місця, ціну та умови підтверджує перевізник Коваль у відповідь на звернення. Після заповнення форми перевірте й надішліть повідомлення у WhatsApp; саме звернення ще не резервує місце.</p>
        </section>
      </div>
    </>
  );
}
