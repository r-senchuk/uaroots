import { cities, getCity } from "./cities";
import { routes, routesBySlug } from "./routes";
import type { City, Route } from "./types";

export type ResolvedRoute = Route & { origin: City; destination: City };

function resolve(route: Route): ResolvedRoute | undefined {
  const origin = getCity(route.originCityId);
  const destination = getCity(route.destinationCityId);
  if (!origin || !destination) return undefined;
  return { ...route, origin, destination };
}

export function getResolvedRoute(slug: string): ResolvedRoute | undefined {
  const route = routesBySlug.get(slug);
  return route ? resolve(route) : undefined;
}

export function listResolvedRoutes(status?: Route["status"]): ResolvedRoute[] {
  return routes
    .filter((route) => (status ? route.status === status : true))
    .map(resolve)
    .filter((route): route is ResolvedRoute => Boolean(route));
}

export function getResolvedRoutesByIds(ids: string[]): ResolvedRoute[] {
  return ids
    .map((id) => routes.find((route) => route.id === id))
    .filter((route): route is Route => Boolean(route))
    .map(resolve)
    .filter((route): route is ResolvedRoute => Boolean(route));
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/ʼ|'|’/g, "'");
}

/** Alias-aware city search. Aliases are for search UX only — never URLs. */
export function searchCities(query: string, limit = 6): City[] {
  const q = normalize(query);
  if (q.length < 1) return [];

  const scored = cities
    .map((city) => {
      const haystack = [city.name, ...city.aliases].map(normalize);
      const starts = haystack.some((value) => value.startsWith(q));
      const contains = haystack.some((value) => value.includes(q));
      if (!starts && !contains) return null;
      return { city, score: starts ? 0 : 1 };
    })
    .filter((entry): entry is { city: City; score: number } => entry !== null)
    .sort((a, b) => a.score - b.score || a.city.name.localeCompare(b.city.name, "uk"));

  return scored.slice(0, limit).map((entry) => entry.city);
}

export function findRouteByCities(
  originId: string,
  destinationId: string,
): ResolvedRoute | undefined {
  const route = routes.find(
    (candidate) =>
      candidate.originCityId === originId && candidate.destinationCityId === destinationId,
  );
  return route ? resolve(route) : undefined;
}
