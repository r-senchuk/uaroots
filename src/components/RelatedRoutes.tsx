import { RouteList } from "@/components/RouteList";
import type { ResolvedRoute } from "@/data/queries";

export function RelatedRoutes({ routes, currentRoute }: { routes: ResolvedRoute[]; currentRoute: ResolvedRoute }) {
  if (routes.length === 0) return null;

  const reverse = routes.filter((route) =>
    route.origin.id === currentRoute.destination.id && route.destination.id === currentRoute.origin.id,
  );
  const other = routes.filter((route) => !reverse.includes(route));

  return (
    <>
      {reverse.length > 0 ? (
        <section aria-labelledby="reverse-route">
          <h2 id="reverse-route" className="type-h2">Зворотний напрямок</h2>
          <p className="mt-3 type-body-small text-muted-foreground">
            Плануєте їхати у зворотному напрямку? Перегляньте поради для виїзду та уточніть поїздку на потрібну дату.
          </p>
          <RouteList routes={reverse} ctaLocation="related_route" sourceRouteId={currentRoute.id} className="mt-8" />
        </section>
      ) : null}
      {other.length > 0 ? (
        <section aria-labelledby="related-routes">
          <h2 id="related-routes" className="type-h2">Інші напрямки</h2>
          <RouteList routes={other} ctaLocation="related_route" sourceRouteId={currentRoute.id} className="mt-8" />
        </section>
      ) : null}
    </>
  );
}
