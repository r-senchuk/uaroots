import Link from "next/link";
import type { Metadata } from "next";

import { BrokenRouteGraphic } from "@/components/brand/states";
import { listResolvedRoutes } from "@/data/queries";

export const metadata: Metadata = {
  title: "Сторінку не знайдено | UARoute",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const commercial = listResolvedRoutes("commercial");

  return (
    <div className="container-page section-band">
      <p className="type-label text-muted-foreground">404 · Сторінку не знайдено</p>
      <h1 className="mt-6 max-w-3xl type-h1">Цю сторінку не знайдено</h1>
      <div className="mt-10 max-w-xl">
        <BrokenRouteGraphic />
      </div>
      <p className="mt-8 max-w-md type-lead text-muted-foreground">
        Можливо, адреса змінилася. Оберіть напрямок між Україною та Німеччиною в нашому атласі.
      </p>
      <Link
        href="/routes/"
        className="mt-8 inline-flex h-12 items-center justify-center bg-primary px-6 type-button text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Усі маршрути
      </Link>

      {commercial.length > 0 ? (
        <ul className="mt-16 space-y-3">
          <li className="type-label text-muted-foreground">Напрямки для запиту</li>
          {commercial.map((route) => (
            <li key={route.slug}>
              <Link href={`/routes/${route.slug}/`} className="type-body link-underline">
                {route.origin.name} → {route.destination.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
