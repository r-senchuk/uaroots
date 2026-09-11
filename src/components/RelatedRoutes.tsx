import { RouteList } from "@/components/RouteList";
import type { ResolvedRoute } from "@/data/queries";

export function RelatedRoutes({ routes }: { routes: ResolvedRoute[] }) {
  if (routes.length === 0) return null;

  return (
    <section aria-labelledby="related-routes">
      <p className="type-label text-muted-foreground">Інші напрямки</p>
      <h2 id="related-routes" className="mt-3 type-h2">
        Схожі маршрути
      </h2>
      <RouteList routes={routes} ctaLocation="related_route" className="mt-8" />
    </section>
  );
}
