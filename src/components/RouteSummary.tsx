import { MetaGrid, MetaItem } from "@/components/brand/Metadata";
import { RouteCapsule } from "@/components/brand/RouteCapsule";
import { RouteLine } from "@/components/brand/RouteLine";
import type { ResolvedRoute } from "@/data/queries";
import type { Carrier } from "@/data/types";

/**
 * Factual route overview. Deliberately contains no duration, distance, stops,
 * schedule, price or availability — none of that is verified data. The corridor
 * graphic is the shared RouteLine geometry, not an itinerary.
 */
export function RouteSummary({
  route,
  carrier,
}: {
  route: ResolvedRoute;
  carrier: Carrier | undefined;
}) {
  return (
    <section>
      <p className="type-label text-muted-foreground">01 · Про маршрут</p>
      <h2 className="mt-3 type-h2">Коридор напрямку</h2>

      <div className="mt-8 border-y border-border-strong py-8">
        <RouteLine
          variant="hero"
          originLabel={route.origin.name}
          destinationLabel={route.destination.name}
          waypoints={route.corridor.slice(1, -1)}
          title={`Маршрут ${route.origin.name} — ${route.destination.name}`}
        />
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
          <RouteCapsule items={route.corridor} codes />
          <span className="type-caption">Коридор, а не розклад зупинок</span>
        </div>
      </div>

      <MetaGrid className="mt-8">
        <MetaItem label="Відправлення">{`${route.origin.name}, ${route.origin.country}`}</MetaItem>
        <MetaItem label="Призначення">
          {`${route.destination.name}, ${route.destination.country}`}
        </MetaItem>
        <MetaItem label="Коридор">{route.corridor.join(" → ")}</MetaItem>
      </MetaGrid>

      {carrier ? (
        <p className="mt-8 max-w-xl type-body text-muted-foreground">
          Перевезення на цьому напрямку виконує {carrier.name}. UARoute не є перевізником.
        </p>
      ) : null}

      {route.status === "editorial" ? (
        <p className="mt-4 max-w-xl type-body-small text-muted-foreground">
          Наявність поїздок на цьому напрямку варто уточнити у перевізника перед плануванням.
        </p>
      ) : null}
    </section>
  );
}
