import type { Carrier } from "./types";

/**
 * Data-integrity rule: `claims` may only contain statements that were checked
 * against `sourceUrl` on `lastVerifiedAt`. Do not add claims from general
 * knowledge or because they sound plausible. An empty claims list is correct
 * until statements are verified — the UI omits the section entirely.
 */
export const carriers: Carrier[] = [
  {
    id: "koval",
    slug: "koval",
    name: "KOVAL 4K",
    website: "https://www.4k-koval.com/",
    serviceDescription: "Пасажирські перевезення та посилки між Україною та Європою.",
    desks: [
      {
        id: "koval-de",
        label: "Німеччина та основні напрямки (Іван)",
        phone: "+38 050 978 63 30",
        whatsapp: "380509786330",
        countries: ["Німеччина"],
      },
      {
        id: "koval-at",
        label: "Австрія та Ліхтенштейн (Микола)",
        phone: "+380 63 079 20 00",
        whatsapp: "380630792000",
        countries: ["Австрія", "Ліхтенштейн"],
      },
    ],
    claims: [],
  },
];

export const carriersById = new Map(carriers.map((carrier) => [carrier.id, carrier]));

export function getCarrier(id: string) {
  return carriersById.get(id);
}

export function getDesk(carrierId: string, deskId: string | undefined) {
  if (!deskId) return undefined;
  return getCarrier(carrierId)?.desks.find((desk) => desk.id === deskId);
}

/** Fields safe to pass into client components — omits unused desks/phones. */
export function publicCarrier(carrier: Carrier): Omit<Carrier, "desks"> {
  const { id, slug, name, website, serviceDescription, claims } = carrier;
  return { id, slug, name, website, serviceDescription, claims };
}
