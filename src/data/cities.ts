import type { City } from "./types";

export const cities: City[] = [
  {
    id: "lviv",
    slug: "lviv",
    name: "Львів",
    country: "Україна",
    countryCode: "UA",
    aliases: ["Lviv", "Львов", "Lwow", "Lwów", "Leopolis"],
    kind: "hub",
  },
  {
    id: "hannover",
    slug: "hannover",
    name: "Ганновер",
    country: "Німеччина",
    countryCode: "DE",
    aliases: ["Hannover", "Hanover", "Ганновер", "Ганновері"],
    kind: "destination",
  },
  {
    id: "hamburg",
    slug: "hamburg",
    name: "Гамбург",
    country: "Німеччина",
    countryCode: "DE",
    aliases: ["Hamburg", "Гамбурґ"],
    kind: "destination",
  },
  {
    id: "berlin",
    slug: "berlin",
    name: "Берлін",
    country: "Німеччина",
    countryCode: "DE",
    aliases: ["Berlin", "Берлин"],
    kind: "destination",
  },
];

export const citiesById = new Map(cities.map((city) => [city.id, city]));

export function getCity(id: string) {
  return citiesById.get(id);
}

export function requireCity(id: string): City {
  const city = citiesById.get(id);
  if (!city) throw new Error(`Unknown city id: ${id}`);
  return city;
}
