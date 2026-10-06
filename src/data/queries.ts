import { cities, getCity } from "./cities";
import { pilotGermanCityIds, pilotUkrainianCityIds, priorityOriginCityIds } from "./discovery";
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
  const resolved = routes
    .filter((route) => (status ? route.status === status : true))
    .map(resolve)
    .filter((route): route is ResolvedRoute => Boolean(route));
  if (status !== "commercial") return resolved;

  const priority = new Set<string>(priorityOriginCityIds);
  return resolved.sort((a, b) => {
    const aPriority = priority.has(a.originCityId) ? 0 : 1;
    const bPriority = priority.has(b.originCityId) ? 0 : 1;
    return aPriority - bPriority;
  });
}

export function getResolvedRoutesByIds(ids: string[]): ResolvedRoute[] {
  return ids
    .map((id) => routes.find((route) => route.id === id))
    .filter((route): route is Route => Boolean(route))
    .map(resolve)
    .filter((route): route is ResolvedRoute => Boolean(route));
}

function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/ø/g, "o")
    .replace(/ß/g, "ss")
    .replace(/[ʼ'’]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Alias-aware city search. Aliases are for search UX only — never URLs. */
export function searchCities(query: string, limit = 6): City[] {
  const q = normalize(query);
  if (q.length < 1) return [];

  const scored = cities
    .map((city) => {
      const haystack = [city.name, ...city.aliases].map(normalize);
      const exact = haystack.some((value) => value === q);
      const starts = haystack.some((value) => value.startsWith(q));
      const contains = haystack.some((value) => value.includes(q));
      if (!starts && !contains) return null;
      return { city, score: exact ? 0 : starts ? 1 : 2 };
    })
    .filter((entry): entry is { city: City; score: number } => entry !== null)
    .sort((a, b) => a.score - b.score || a.city.name.localeCompare(b.city.name, "uk"));

  return scored.slice(0, limit).map((entry) => entry.city);
}

const pilotUkrainianCityIdSet = new Set<string>(pilotUkrainianCityIds);
const pilotGermanCityIdSet = new Set<string>(pilotGermanCityIds);

/** True only for the bounded owner-selected candidate inquiry search slice. */
export function isCandidateInquiryEligiblePair(origin: City, destination: City): boolean {
  return (pilotUkrainianCityIdSet.has(origin.id) && pilotGermanCityIdSet.has(destination.id)) ||
    (pilotGermanCityIdSet.has(origin.id) && pilotUkrainianCityIdSet.has(destination.id));
}

export function findRouteByCities(
  originId: string,
  destinationId: string,
  options?: { commercialOnly?: boolean },
): ResolvedRoute | undefined {
  const route = routes.find(
    (candidate) =>
      candidate.originCityId === originId &&
      candidate.destinationCityId === destinationId &&
      (options?.commercialOnly ? candidate.status === "commercial" : true),
  );
  return route ? resolve(route) : undefined;
}
