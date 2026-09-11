import type { Metadata } from "next";

import { Graticule } from "@/components/brand/graphics";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RouteList } from "@/components/RouteList";
import { listResolvedRoutes } from "@/data/queries";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";

const title = "Маршрути з України до Європи | UARoute";
const description =
  "Перелік напрямків з України до Європи з інформацією про коридор, перевізника та те, що варто уточнити перед поїздкою.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/routes/" });

const crumbs = [
  { name: "Головна", path: "/" },
  { name: "Маршрути", path: "/routes/" },
];

export default function RoutesIndexPage() {
  const routes = listResolvedRoutes("commercial");

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-14 pt-8">
          <Breadcrumbs items={crumbs} />
          <p className="mt-10 type-label text-muted-foreground">Індекс · UA → EU</p>
          <h1 className="mt-6 max-w-3xl type-display">Атлас напрямків</h1>
          <p className="mt-8 max-w-xl type-lead text-muted-foreground">{description}</p>
        </div>
      </section>

      <div className="container-page section-band">
        <RouteList routes={routes} ctaLocation="route_index" />

        <p className="mt-12 max-w-xl type-body-small text-muted-foreground">
          UARoute не публікує розкладів, тривалості поїздки та цін, доки вони не підтверджені
          перевізником. Актуальність рейсу на конкретну дату уточнюйте у розмові з ним.
        </p>
      </div>
    </>
  );
}
