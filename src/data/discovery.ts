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

/** Owner-selected 2026-10-26: inline inquiries in both directions, without new route pages. */
export const additionalInquiryPairs = [
  { originCityId: "ivano-frankivsk", destinationCityId: "hannover" },
] as const;

export const cityHubPaths = ["/cities/lviv/", "/cities/ivano-frankivsk/", "/cities/celle/", "/cities/stryi/"] as const;

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
  { slug: "celle-stryi", originCityId: "celle", destinationCityId: "stryi" },
] as const;
