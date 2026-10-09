import { cities } from "@/data/cities";
import { cityHubPaths, pilotGermanCityIds, pilotUkrainianCityIds, priorityOriginCityIds } from "@/data/discovery";
import type { City } from "@/data/types";
import { findRouteByCities, getResolvedRoute, type ResolvedRoute } from "@/data/queries";

export type CityHubPresentation = {
  readonly isGerman: boolean;
  readonly initialDirection: "to-germany" | "to-ukraine";
  readonly initialOriginId: string;
  readonly choiceCities: readonly City[];
  readonly choiceDirections: readonly {
    readonly city: City;
    readonly departureRoute?: ResolvedRoute;
    readonly returnRoute?: ResolvedRoute;
  }[];
  readonly choiceHeading: string;
  readonly searchDescription: string;
  readonly departureLabel: string;
  readonly arrivalLabel: string;
  readonly departureHeading: string;
  readonly arrivalHeading: string;
  readonly routeCards: readonly ResolvedRoute[];
  readonly relatedHubs: readonly { readonly city: City; readonly label: string }[];
};

/** Derive direction labels and navigation from the selected hub's country and explicit choices. */
export function getCityHubPresentation(city: City, fromName: string, toName: string, routeSlugs: readonly string[]): CityHubPresentation | undefined {
  if (!((city.countryCode === "UA" && city.country === "Україна") || (city.countryCode === "DE" && city.country === "Німеччина"))) return undefined;

  const isGerman = city.countryCode === "DE";
  const choiceIds = isGerman ? pilotUkrainianCityIds : pilotGermanCityIds;
  const choices = choiceIds.map((id) => cities.find((candidate) => candidate.id === id)).filter((candidate): candidate is City => Boolean(candidate));
  if (choices.length !== choiceIds.length) return undefined;

  if (isGerman) {
    const priority = new Set<string>(priorityOriginCityIds);
    choices.sort((a, b) => (priority.has(a.id) ? 0 : 1) - (priority.has(b.id) ? 0 : 1));
  }

  const selectedHubCities = cityHubPaths
    .map((path) => cities.find((candidate) => `/cities/${candidate.slug}/` === path))
    .filter((candidate): candidate is City => Boolean(candidate));
  const choiceDirections = choices.map((choice) => ({
    city: choice,
    departureRoute: findRouteByCities(city.id, choice.id, { commercialOnly: true }),
    returnRoute: findRouteByCities(choice.id, city.id, { commercialOnly: true }),
  }));

  return {
    isGerman,
    initialDirection: isGerman ? "to-ukraine" : "to-germany",
    initialOriginId: city.id,
    choiceCities: choices,
    choiceDirections,
    choiceHeading: isGerman ? "Міста України" : "Шість міст Німеччини",
    searchDescription: isGerman
      ? `${city.name} вже вибрано. Додайте українське місто; для зворотного напрямку перемкніть пошук — пара міст збережеться.`
      : `${city.name} вже вибрано. Додайте місто в Німеччині, а для повернення натисніть «До України» — вибрана пара міст збережеться.`,
    departureLabel: `Як їхати ${fromName}`,
    arrivalLabel: `${isGerman ? "Як планувати прибуття" : "Як повертатися"} ${toName}`,
    departureHeading: isGerman ? `Підготуйте виїзд із ${city.name}` : "Підготуйте виїзд",
    arrivalHeading: isGerman ? `Сплануйте прибуття до ${city.name}` : "Підготуйте повернення",
    routeCards: routeSlugs.map(getResolvedRoute).filter((route): route is ResolvedRoute => route?.status === "commercial"),
    relatedHubs: selectedHubCities
      .filter((candidate) => candidate.id !== city.id)
      .map((candidate) => ({
        city: candidate,
        label: candidate.id === "lviv" ? "Напрямки зі Львова" : candidate.id === "ivano-frankivsk" ? "Напрямки з Івано-Франківська" : "Напрямки із Целле",
      })),
  };
}
