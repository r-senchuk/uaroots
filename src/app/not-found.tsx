import Link from "next/link";

import { BrokenRouteGraphic } from "@/components/brand/states";

export default function NotFound() {
  return (
    <div className="container-page section-band">
      <p className="type-label text-muted-foreground">404 · Маршрут не знайдено</p>
      <h1 className="mt-6 max-w-3xl type-h1">Ця лінія нікуди не веде</h1>
      <div className="mt-10 max-w-xl">
        <BrokenRouteGraphic />
      </div>
      <p className="mt-8 max-w-md type-lead text-muted-foreground">
        Можливо, адреса змінилася. Поверніться до атласу напрямків з України до Європи.
      </p>
      <Link
        href="/routes/"
        className="mt-8 inline-flex h-12 items-center justify-center bg-primary px-6 type-button text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Усі маршрути
      </Link>
    </div>
  );
}
