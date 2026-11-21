import Link from "next/link";
import type { Metadata } from "next";

import { Eyebrow, chipLink } from "@/components/brand/editorial";
import { Graticule } from "@/components/brand/graphics";
import { BrokenRouteGraphic } from "@/components/brand/states";
import { listResolvedRoutes } from "@/data/queries";

export const metadata: Metadata = {
  title: "Сторінку не знайдено | UARoute",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const commercial = listResolvedRoutes("commercial");

  return (
    <>
      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative py-10 sm:py-14">
          <p>
            <Eyebrow>404 · Сторінку не знайдено</Eyebrow>
          </p>
          <h1 className="mt-4 max-w-3xl type-h1">Цю сторінку не знайдено</h1>
          <div className="mt-8 max-w-xl">
            <BrokenRouteGraphic />
          </div>
          <p className="mt-6 max-w-md type-lead text-foreground/85">
            Можливо, адреса змінилася. Оберіть напрямок між Україною та Німеччиною в нашому атласі.
          </p>
          <Link
            href="/routes/"
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-primary px-6 type-button text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Усі маршрути
          </Link>
        </div>
      </section>

      {commercial.length > 0 ? (
        <section className="container-page py-8 sm:py-12" aria-labelledby="not-found-routes-heading">
          <h2 id="not-found-routes-heading" className="type-label text-muted-foreground">
            Напрямки для запиту
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {commercial.map((route) => (
              <li key={route.slug}>
                <Link href={`/routes/${route.slug}/`} className={chipLink}>
                  {route.origin.name} → {route.destination.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}