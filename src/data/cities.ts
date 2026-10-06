import type { City } from "./types";

/** Search aliases never create route URLs. Names and UI remain Ukrainian. */
export const cities: City[] = [
  {
    id: "lviv", slug: "lviv", name: "Львів", country: "Україна", countryCode: "UA",
    aliases: ["Lviv", "Lvov", "Львов", "Lwow", "Lwów", "Lwiw", "Lemberg", "Leopolis"], kind: "hub",
  },
  {
    id: "dolyna", slug: "dolyna", name: "Долина", country: "Україна", countryCode: "UA",
    aliases: ["Dolyna", "Dolina", "Долина", "Dolina Ivano-Frankivsk Oblast", "Dolina obwód iwanofrankiwski", "Dolyna Ivano-Frankivsk Region", "Долина Івано-Франківська область", "Долина Ивано-Франковская область"], kind: "satellite",
  },
  {
    id: "kalush", slug: "kalush", name: "Калуш", country: "Україна", countryCode: "UA",
    aliases: ["Kalush", "Kałusz", "Kalusch", "Калуш", "Калуш Ивано-Франковская область", "Kalush Ivano-Frankivsk Oblast"], kind: "satellite",
  },
  {
    id: "ivano-frankivsk", slug: "ivano-frankivsk", name: "Івано-Франківськ", country: "Україна", countryCode: "UA",
    aliases: ["Ivano-Frankivsk", "Ivano Frankivsk", "Ivano-Frankovsk", "Iwano-Frankiwsk", "Stanisławów", "Stanislau", "Stanislaviv", "Ивано-Франковск", "Івано Франківськ"], kind: "hub",
  },
  {
    id: "stryi", slug: "stryi", name: "Стрий", country: "Україна", countryCode: "UA",
    aliases: ["Stryi", "Stryj", "Стрый", "Стрий", "Stryj Lviv Oblast"], kind: "satellite",
  },
  {
    id: "halych", slug: "halych", name: "Галич", country: "Україна", countryCode: "UA",
    aliases: ["Halych", "Halicz", "Halytsch", "Galich", "Галич", "Галич Ивано-Франковская область", "Halych Ivano-Frankivsk Oblast"], kind: "satellite",
  },
  {
    id: "burshtyn", slug: "burshtyn", name: "Бурштин", country: "Україна", countryCode: "UA",
    aliases: ["Burshtyn", "Bursztyn", "Burstin", "Бурштын", "Бурштин Ивано-Франковская область", "Burshtyn Ivano-Frankivsk Oblast"], kind: "satellite",
  },
  {
    id: "pustomyty", slug: "pustomyty", name: "Пустомити", country: "Україна", countryCode: "UA",
    aliases: ["Pustomyty", "Pustomyty Lviv Oblast", "Пустомыты", "Пустомити Львівська область", "Пустомиты Львовская область"], kind: "satellite",
  },
  {
    id: "briukhovychi", slug: "briukhovychi", name: "Брюховичі", country: "Україна", countryCode: "UA",
    aliases: ["Bryukhovychi", "Bryukhovichi", "Brzuchowice", "Брюховичи", "Брюховичі Львівська область", "Briukhovychi Lviv Oblast"], kind: "satellite",
  },
  {
    id: "horodok-lviv", slug: "horodok-lviv", name: "Городок (Львівська область)", country: "Україна", countryCode: "UA",
    aliases: ["Horodok Lviv Oblast", "Horodok Lviv Region", "Gorodok Lviv Oblast", "Gródek Lwowski", "Grodek Lviv", "Городок Львівська область", "Городок Львовская область", "Городок Львовской области"], kind: "satellite",
  },
  {
    id: "mykolaiv-lviv", slug: "mykolaiv-lviv", name: "Миколаїв (Львівська область)", country: "Україна", countryCode: "UA",
    aliases: ["Mykolaiv Lviv Oblast", "Mykolaiv Lviv Region", "Mykolaiv Lvivska oblast", "Mikołajów Lwowski", "Nikolajew Lwiw", "Миколаїв Львівська область", "Миколаев Львовская область", "Миколаев Львовской области", "Nikolaev Lviv Oblast"], kind: "satellite",
  },
  {
    id: "novyi-rozdil", slug: "novyi-rozdil", name: "Новий Розділ", country: "Україна", countryCode: "UA",
    aliases: ["Novyi Rozdil", "Novy Rozdol", "Nowy Rozdół", "Nowy Rozdil", "Новый Раздол", "Новий Розділ Львівська область"], kind: "satellite",
  },
  {
    id: "nadvirna", slug: "nadvirna", name: "Надвірна", country: "Україна", countryCode: "UA",
    aliases: ["Nadvirna", "Nadworna", "Nadwórna", "Nadwornaia", "Надворная", "Надвірна Івано-Франківська область"], kind: "satellite",
  },
  {
    id: "zhydachiv", slug: "zhydachiv", name: "Жидачів", country: "Україна", countryCode: "UA",
    aliases: ["Zhydachiv", "Zhydaczów", "Żydaczów", "Zydatschow", "Zhidachov", "Жидачев", "Жидачів Львівська область"], kind: "satellite",
  },
  {
    id: "hannover", slug: "hannover", name: "Ганновер", country: "Німеччина", countryCode: "DE",
    aliases: ["Hannover", "Hanover", "Ганновер", "Ганновері"], kind: "destination",
  },
  {
    id: "hamburg", slug: "hamburg", name: "Гамбург", country: "Німеччина", countryCode: "DE",
    aliases: ["Hamburg", "Гамбурґ", "Гамбург"], kind: "destination",
  },
  {
    id: "berlin", slug: "berlin", name: "Берлін", country: "Німеччина", countryCode: "DE",
    aliases: ["Berlin", "Берлин"], kind: "destination",
  },
  {
    id: "celle", slug: "celle", name: "Целле", country: "Німеччина", countryCode: "DE",
    aliases: ["Celle", "Целле", "Целле Германия"], kind: "destination",
  },
  {
    id: "wolfsburg", slug: "wolfsburg", name: "Вольфсбург", country: "Німеччина", countryCode: "DE",
    aliases: ["Wolfsburg", "Вольфсбург", "Вольфсбург Германия"], kind: "destination",
  },
  {
    id: "braunschweig", slug: "braunschweig", name: "Брауншвейг", country: "Німеччина", countryCode: "DE",
    aliases: ["Braunschweig", "Brunswick", "Брауншвейг", "Брауншвайг"], kind: "destination",
  },
  {
    id: "schwerin", slug: "schwerin", name: "Шверін", country: "Німеччина", countryCode: "DE",
    aliases: ["Schwerin", "Шверин", "Шверін"], kind: "destination",
  },
  {
    id: "lueneburg", slug: "lueneburg", name: "Люнебург", country: "Німеччина", countryCode: "DE",
    aliases: ["Lüneburg", "Lueneburg", "Luneburg", "Люнебург", "Luneburg", "Люнебург"], kind: "destination",
  },
  {
    id: "luebeck", slug: "luebeck", name: "Любек", country: "Німеччина", countryCode: "DE",
    aliases: ["Lübeck", "Luebeck", "Lubeck", "Любек", "Lubeka"], kind: "destination",
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
