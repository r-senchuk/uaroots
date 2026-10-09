/** Explicitly bounded discovery choices for the 2026-10-06 acquisition update. */
export const pilotUkrainianCityIds = [
  "lviv",
  "ivano-frankivsk",
  "dolyna",
  "kalush",
  "stryi",
  "halych",
  "burshtyn",
  "pustomyty",
  "briukhovychi",
  "horodok-lviv",
  "mykolaiv-lviv",
  "novyi-rozdil",
  "nadvirna",
  "zhydachiv",
] as const;

export const pilotGermanCityIds = [
  "schwerin",
  "lueneburg",
  "luebeck",
  "celle",
  "wolfsburg",
  "braunschweig",
] as const;

export const priorityOriginCityIds = ["lviv", "ivano-frankivsk"] as const;

export const cityHubPaths = ["/cities/lviv/", "/cities/ivano-frankivsk/", "/cities/celle/"] as const;

/** Explicitly selected pages only; do not derive route slugs from these pairs. */
export const selectedCandidatePairs = [
  { slug: "dolyna-celle", originCityId: "dolyna", destinationCityId: "celle" },
  { slug: "celle-dolyna", originCityId: "celle", destinationCityId: "dolyna" },
  { slug: "dolyna-wolfsburg", originCityId: "dolyna", destinationCityId: "wolfsburg" },
  { slug: "wolfsburg-dolyna", originCityId: "wolfsburg", destinationCityId: "dolyna" },
  { slug: "dolyna-braunschweig", originCityId: "dolyna", destinationCityId: "braunschweig" },
  { slug: "braunschweig-dolyna", originCityId: "braunschweig", destinationCityId: "dolyna" },
  { slug: "lviv-celle", originCityId: "lviv", destinationCityId: "celle" },
  { slug: "celle-lviv", originCityId: "celle", destinationCityId: "lviv" },
  { slug: "ivano-frankivsk-wolfsburg", originCityId: "ivano-frankivsk", destinationCityId: "wolfsburg" },
  { slug: "wolfsburg-ivano-frankivsk", originCityId: "wolfsburg", destinationCityId: "ivano-frankivsk" },
] as const;
