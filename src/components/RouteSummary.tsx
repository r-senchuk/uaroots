import { MetaGrid, MetaItem } from "@/components/brand/Metadata";
import type { ResolvedRoute } from "@/data/queries";

/**
 * Factual route overview. Deliberately contains no duration, distance, stops,
 * schedule, price or availability — none of that is verified data.
 */
export function RouteSummary({
  route,
}: {
  route: ResolvedRoute;
}) {
  return (
    <section>
      <p className="type-label text-muted-foreground">01 · Ваш напрямок</p>
      <h2 className="mt-3 type-h2">Відправлення й прибуття</h2>

      <MetaGrid className="mt-8">
        <MetaItem label="Відправлення">{`${route.origin.name}, ${route.origin.country}`}</MetaItem>
        <MetaItem label="Призначення">
          {`${route.destination.name}, ${route.destination.country}`}
        </MetaItem>
      </MetaGrid>
    </section>
  );
}
