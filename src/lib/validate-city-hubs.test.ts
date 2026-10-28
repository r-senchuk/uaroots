import { describe, expect, it } from "vitest";

import { cityHubContents, type CityHubContent } from "@/data/city-hubs";
import { cities } from "@/data/cities";
import { cityHubPaths, pilotUkrainianCityIds, selectedCandidatePairs } from "@/data/discovery";
import { routes } from "@/data/routes";
import { validateCityHubContent } from "./validate-city-hubs";

const fixtureReferenceDate = "2035-10-09";

function cloneContents(): CityHubContent[] {
  return structuredClone(syntheticDateFixture("2035-10-09", "2035-10-09"));
}

function syntheticDateFixture(reviewedAt: string, contentUpdatedAt: string, checkedAt = reviewedAt): CityHubContent[] {
  const record = (cityId: string, cityName: string, routeSlug: string): CityHubContent => ({
    cityId, cityName, fromName: `з ${cityName}`, toName: `до ${cityName}`,
    title: `Поїздка ${cityName}`, heading: `Поїздка ${cityName}`, description: `Поради для ${cityName}`,
    intro: `UARoute допомагає знайти напрямок з ${cityName}.`, outbound: `Планування виїзду з ${cityName}.`,
    returning: `Планування повернення до ${cityName}.`,
    faq: [{ question: `Що уточнити у ${cityName}?`, answer: "Погодьте деталі конкретної поїздки." }],
    routeSlugs: [routeSlug], nearbyHeading: "Поруч", nearbyIntro: "Опишіть фактичне місце.",
    nearbyActionText: "Повернутися до пошуку", nearbyPlaces: [],
    planningResources: [{ label: "Synthetic planning resource", url: `https://${cityId}.example.gov/guide`, checkedAt, purpose: "Перевірити потрібну ділянку." }],
    contentReview: { reviewedAt, contentUpdatedAt, reviewScope: "editorial_guidance" },
  });
  const celle = record("celle", "Fixture City C", "celle-lviv");
  return [
    record("lviv", "Fixture City A", "lviv-hannover"),
    record("ivano-frankivsk", "Fixture City B", "ivano-frankivsk-wolfsburg"),
    record("stryi", "Fixture City D", "celle-stryi"),
    {
      ...celle,
      routeSlugs: ["celle-lviv", "lviv-celle", "celle-dolyna", "dolyna-celle"],
      planningResources: [{ label: "Офіційний довідник доїзду до Целле", url: "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken", checkedAt: "2026-10-09", purpose: "Перевірити місцевий доїзд перед зустріччю або подальшою дорогою." }],
      contentReview: { reviewedAt: "2026-10-09", contentUpdatedAt: "2026-10-09", reviewScope: "editorial_guidance" },
    },
  ];
}

function addNamedTestPlace(contents = cloneContents()) {
  const lviv = contents.find((content) => content.cityId === "lviv")!;
  (lviv.nearbyPlaces as unknown as Record<string, unknown>[]).push({
    contentKey: "synthetic-nearby-fixture",
    name: "Example Nearby Town",
    localName: "Beispielort",
    guidance: "Describe the meeting preference privately and ask what can be arranged.",
    geographySource: { url: "https://example.gov/nearby", checkedAt: "2035-10-08" },
  });
  return contents;
}

describe("validateCityHubContent", () => {
  it("accepts the selected hub data with source-backed regional nearby places for Lviv and Ivano-Frankivsk", () => {
    expect(validateCityHubContent(cityHubContents, "2026-10-25")).toEqual([]);
    const lviv = cityHubContents.find((c) => c.cityId === "lviv")!;
    const ifHub = cityHubContents.find((c) => c.cityId === "ivano-frankivsk")!;
    expect(lviv.nearbyPlaces).toHaveLength(4);
    expect(ifHub.nearbyPlaces).toHaveLength(4);
  });

  it("accepts a source-backed synthetic nearby-place fixture", () => {
    expect(validateCityHubContent(addNamedTestPlace(), fixtureReferenceDate)).toEqual([]);
  });

  it("preserves the existing geography URL contract when its source has a query", () => {
    const contents = addNamedTestPlace();
    const places = contents.find((content) => content.cityId === "lviv")!.nearbyPlaces as unknown as Record<string, unknown>[];
    places[0] = { ...places[0]!, geographySource: { url: "https://example.gov/place?language=uk", checkedAt: "2035-10-08" } };
    expect(validateCityHubContent(contents, fixtureReferenceDate)).toEqual([]);
  });

  it("allows a nearby display name already present as a separate city without mutating registries", () => {
    const contents = addNamedTestPlace();
    const lviv = contents.find((content) => content.cityId === "lviv")!;
    const places = lviv.nearbyPlaces as unknown as Record<string, unknown>[];
    places[0] = { ...places[0]!, contentKey: "pustomyty", name: "Пустомити", localName: "Pustomyty" };
    const citySnapshot = structuredClone(cities);
    const discoverySnapshot = structuredClone({ cityHubPaths, pilotUkrainianCityIds, selectedCandidatePairs });

    expect(validateCityHubContent(contents, fixtureReferenceDate)).toEqual([]);
    expect(cities).toEqual(citySnapshot);
    expect({ cityHubPaths, pilotUkrainianCityIds, selectedCandidatePairs }).toEqual(discoverySnapshot);
  });

  it("rejects unknown, unselected, missing, and duplicate hub records", () => {
    const unknown = cloneContents();
    unknown[0] = { ...unknown[0]!, cityId: "missing-city" };
    expect(validateCityHubContent(unknown, fixtureReferenceDate).join(" ")).toContain("unknown city id");

    const extra = cloneContents();
    extra.push({ ...extra[0]!, cityId: "dolyna" });
    expect(validateCityHubContent(extra, fixtureReferenceDate).join(" ")).toContain("not selected: dolyna");

    const missing = cloneContents().filter((content) => content.cityId !== "lviv");
    expect(validateCityHubContent(missing, fixtureReferenceDate).join(" ")).toContain("no content: lviv");

    const duplicate = cloneContents();
    duplicate.push({ ...duplicate[0]! });
    expect(validateCityHubContent(duplicate, fixtureReferenceDate).join(" ")).toContain("Duplicate city hub content city id: lviv");
  });

  it("rejects malformed or duplicate selected paths and unsupported hub countries", () => {
    const malformed = validateCityHubContent(cityHubContents, fixtureReferenceDate, { hubPaths: ["/cities/Celle/"] }).join(" ");
    expect(malformed).toContain("Malformed selected city hub path");

    const duplicate = validateCityHubContent(cityHubContents, fixtureReferenceDate, { hubPaths: ["/cities/celle/", "/cities/celle/"] }).join(" ");
    expect(duplicate).toContain("Duplicate selected city hub path");

    const unsupportedCatalog = cities.map((city) => city.id === "celle" ? { ...city, country: "Austria" } : city);
    expect(validateCityHubContent(cityHubContents, fixtureReferenceDate, { cityCatalog: unsupportedCatalog }).join(" ")).toContain("unsupported country: celle");
  });

  it("requires known commercial route links and complete FAQ content", () => {
    const unknownRoute = cloneContents();
    unknownRoute[0] = { ...unknownRoute[0]!, routeSlugs: ["not-a-route"] };
    expect(validateCityHubContent(unknownRoute, fixtureReferenceDate).join(" ")).toContain("unknown route slug");

    const editorialRoute = cloneContents();
    editorialRoute[0] = { ...editorialRoute[0]!, routeSlugs: ["lviv-hamburg"] };
    expect(validateCityHubContent(editorialRoute, fixtureReferenceDate).join(" ")).toContain("non-commercial route");

    const emptyFaq = cloneContents();
    emptyFaq[0] = { ...emptyFaq[0]!, faq: [] };
    expect(validateCityHubContent(emptyFaq, fixtureReferenceDate).join(" ")).toContain("must have FAQ items");

    const duplicateCards = cloneContents();
    const celle = duplicateCards.find((content) => content.cityId === "celle")!;
    duplicateCards[duplicateCards.indexOf(celle)] = { ...celle, routeSlugs: ["celle-lviv", "celle-lviv"] };
    expect(validateCityHubContent(duplicateCards, fixtureReferenceDate).join(" ")).toContain("duplicate route card slug: celle-lviv");

    const unrelated = cloneContents();
    const lviv = unrelated.find((content) => content.cityId === "lviv")!;
    unrelated[unrelated.indexOf(lviv)] = { ...lviv, routeSlugs: ["celle-dolyna"] };
    expect(validateCityHubContent(unrelated, fixtureReferenceDate).join(" ")).toContain("unrelated route: celle-dolyna");

    const sameCountryRoutes = structuredClone(routes);
    const celleLviv = sameCountryRoutes.find((route) => route.slug === "celle-lviv")!;
    celleLviv.destinationCityId = "braunschweig";
    expect(validateCityHubContent(cloneContents(), fixtureReferenceDate, { routeCatalog: sameCountryRoutes }).join(" ")).toContain("unsupported country pair: celle-lviv");

    const mismatchedEndpointCatalog = cities.map((city) => city.id === "celle" ? { ...city, country: "Austria" } : city);
    const lvivOnly = cloneContents().filter((content) => content.cityId === "lviv").map((content) => ({ ...content, routeSlugs: ["lviv-celle"] }));
    expect(validateCityHubContent(lvivOnly, fixtureReferenceDate, {
      hubPaths: ["/cities/lviv/"],
      cityCatalog: mismatchedEndpointCatalog,
    }).join(" ")).toContain("unsupported country pair: lviv-celle");

    const missingEndpointRoutes = structuredClone(routes);
    missingEndpointRoutes.find((route) => route.slug === "celle-lviv")!.destinationCityId = "missing-city";
    expect(validateCityHubContent(cloneContents(), fixtureReferenceDate, { routeCatalog: missingEndpointRoutes }).join(" ")).toContain("unknown endpoint city");
  });

  it("keeps Celle's selected directions, source, and editorial dates in the reviewed content", () => {
    const celle = cityHubContents.find((content) => content.cityId === "celle")!;
    expect(celle.routeSlugs).toEqual(["celle-lviv", "lviv-celle", "celle-dolyna", "dolyna-celle"]);
    expect(celle.planningResources).toEqual([{
      label: "Офіційний довідник доїзду до Целле",
      url: "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken",
      checkedAt: "2026-10-09",
      purpose: "Перевірити місцевий доїзд перед зустріччю або подальшою дорогою.",
    }]);
    expect(celle.contentReview).toEqual({ reviewedAt: "2026-10-23", contentUpdatedAt: "2026-10-23", reviewScope: "editorial_guidance" });
    expect(celle.nearbyPlaces.map((place) => place.localName)).toEqual([
      "Samtgemeinde Lachendorf",
      "Hambühren",
      "Winsen (Aller)",
      "Wietze",
      "Samtgemeinde Flotwedel",
    ]);
    const expectedLocalities = [
      ["Lachendorf", "Ahnsbeck", "Beedenbostel", "Eldingen", "Hohne"],
      ["Hambühren", "Hambühren I", "Hambühren II", "Oldau", "Ovelgönne", "Schönhop"],
      ["Winsen (Aller)", "Bannetze", "Meißendorf", "Stedden", "Südwinsen", "Thören", "Walle", "Wolthausen"],
      ["Wietze", "Steinförde", "Wieckenberg", "Jeversen", "Hornbostel"],
      ["Wienhausen", "Eicklingen", "Langlingen", "Bröckel", "Offensen", "Oppershausen", "Bockelskamp", "Nienhof"],
    ];
    expect(celle.nearbyPlaces).toHaveLength(5);
    for (const [index, places] of expectedLocalities.entries()) {
      expect(places.every((place) => celle.nearbyPlaces[index]!.guidance.includes(place))).toBe(true);
      expect(celle.nearbyPlaces[index]!.geographySource.checkedAt).toBe("2026-10-10");
      expect(celle.nearbyPlaces[index]!).not.toHaveProperty("cityId");
      expect(celle.nearbyPlaces[index]!).not.toHaveProperty("aliases");
      expect(celle.nearbyPlaces[index]!).not.toHaveProperty("url");
    }
    expect(celle.nearbyIntro).toContain("найближче доступне для вашої поїздки місто в пошуку");
    expect(celle.nearbyIntro).toContain("точну адресу або орієнтир");
    expect(celle.nearbyIntro).toContain("чи можлива там посадка або висадка");
    expect(validateCityHubContent(cityHubContents, "2026-10-25")).toEqual([]);
  });

  it("keeps Stryi's selected directions, source, and editorial dates in the reviewed content", () => {
    const stryi = cityHubContents.find((content) => content.cityId === "stryi")!;
    expect(stryi).toBeDefined();
    expect(stryi.routeSlugs).toEqual(["celle-stryi"]);
    expect(stryi.planningResources).toEqual([
      {
        label: "Офіційний пошук квитків Укрзалізниці",
        url: "https://booking.uz.gov.ua/",
        checkedAt: "2026-10-17",
        purpose: "Окремо перевірити розклад приміських потягів та поїздів до станції Стрий.",
      },
    ]);
    expect(stryi.contentReview).toEqual({
      reviewedAt: "2026-10-23",
      contentUpdatedAt: "2026-10-23",
      reviewScope: "editorial_guidance",
    });
    expect(stryi.nearbyPlaces).toHaveLength(6);
    expect(stryi.nearbyPlaces.map((place) => place.name)).toEqual([
      "Моршин і громада",
      "Дрогобич",
      "Трускавець",
      "Сколе та Сколівщина",
      "Болехів і прилеглі громади",
      "Стебник",
    ]);
    for (const place of stryi.nearbyPlaces) {
      expect(place.geographySource.url).toMatch(/^https:\/\/[a-z0-9.-]+(?:\.gov\.ua|\.ua)\//);
      expect(place.geographySource.checkedAt).toBe("2026-10-17");
    }
    expect(stryi.nearbyIntro).toContain("фактичне місце");
    expect(stryi.nearbyIntro).toContain("приватному повідомленні WhatsApp");
    expect(stryi.nearbyIntro).toContain("Перевізник підтвердить, чи можлива там посадка або висадка");
    expect(validateCityHubContent(cityHubContents, "2026-10-25")).toEqual([]);
  });

  it("requires unique nearby keys and complete source-backed context", () => {
    const duplicate = addNamedTestPlace();
    const lviv = duplicate.find((content) => content.cityId === "lviv")!;
    (lviv.nearbyPlaces as unknown as Record<string, unknown>[]).push({
      ...(lviv.nearbyPlaces[0] as unknown as Record<string, unknown>),
      name: "Another Example Town",
    });
    expect(validateCityHubContent(duplicate, fixtureReferenceDate).join(" ")).toContain("duplicate nearby contentKey");

    const empty = addNamedTestPlace();
    const places = empty.find((content) => content.cityId === "lviv")!.nearbyPlaces as unknown as Record<string, unknown>[];
    places[0] = { ...places[0]!, guidance: "  " };
    expect(validateCityHubContent(empty, fixtureReferenceDate).join(" ")).toContain("empty guidance");
  });

  it("rejects malformed, non-public, or credentialed source URLs", () => {
    for (const url of ["not a URL", "http://example.gov/place", "https://user:secret@example.gov/place", "https://localhost/place"]) {
      const contents = addNamedTestPlace();
      const places = contents.find((content) => content.cityId === "lviv")!.nearbyPlaces as unknown as Record<string, unknown>[];
      places[0] = { ...places[0]!, geographySource: { url, checkedAt: fixtureReferenceDate } };
      expect(validateCityHubContent(contents, fixtureReferenceDate).join(" ")).toContain("public HTTPS geography source");
    }
  });

  it("rejects invalid calendar dates and future verification dates", () => {
    for (const checkedAt of ["2035-02-30", "2035-2-03", "2035-10-10"]) {
      const contents = addNamedTestPlace();
      const places = contents.find((content) => content.cityId === "lviv")!.nearbyPlaces as unknown as Record<string, unknown>[];
      places[0] = { ...places[0]!, geographySource: { url: "https://example.gov/place", checkedAt } };
      const errors = validateCityHubContent(contents, fixtureReferenceDate).join(" ");
      expect(errors).toMatch(checkedAt === "2035-10-10" ? /in the future/ : /invalid geography checkedAt date/);
    }
  });

  it("rejects nearby records that smuggle service or registry fields", () => {
    const operational = addNamedTestPlace();
    const places = operational.find((content) => content.cityId === "lviv")!.nearbyPlaces as unknown as Record<string, unknown>[];
    places[0] = { ...places[0]!, served: true };
    expect(validateCityHubContent(operational, fixtureReferenceDate).join(" ")).toContain("unsupported field: served");

    const registryField = addNamedTestPlace();
    const registryPlaces = registryField.find((content) => content.cityId === "lviv")!.nearbyPlaces as unknown as Record<string, unknown>[];
    registryPlaces[0] = { ...registryPlaces[0]!, aliases: ["Pustomyty"], cityId: "pustomyty" };
    const errors = validateCityHubContent(registryField, fixtureReferenceDate).join(" ");
    expect(errors).toContain("unsupported field: aliases");
    expect(errors).toContain("unsupported field: cityId");
  });

  it("accepts independent empty-resource and valid-resource fixtures while preserving empty nearby lists", () => {
    const emptyFallback = cloneContents().map((content) => ({ ...content, planningResources: [] }));
    expect(validateCityHubContent(emptyFallback, fixtureReferenceDate)).toEqual([]);
    const valid = cloneContents();
    const lviv = valid.find((content) => content.cityId === "lviv")!;
    (lviv.nearbyPlaces as unknown as unknown[]).splice(0);
    expect(validateCityHubContent(valid, fixtureReferenceDate)).toEqual([]);
  });

  it("rejects missing arrays, malformed resources, unsafe links, duplicate URLs, and unsupported claims", () => {
    const missing = cloneContents();
    (missing[0] as unknown as Record<string, unknown>).planningResources = undefined;
    expect(validateCityHubContent(missing, fixtureReferenceDate).join(" ")).toContain("planningResources must be an array");
    for (const change of [
      { purpose: " " },
      { url: "https://user:pass@example.gov/guide" },
      { url: "https://example.gov/guide?token=private" },
      { url: "https://example.gov/guide#section" },
      { url: "https://www.4k-koval.com/contact/" },
      { url: "https://example.gov/referral/" },
      { url: "http://example.gov/guide" },
      { checkedAt: "2035-02-30" },
      { checkedAt: "2035-10-10" },
      { pickup: true },
    ]) {
      const contents = cloneContents();
      const lviv = contents.find((content) => content.cityId === "lviv")!;
      const resources = lviv.planningResources as unknown as Record<string, unknown>[];
      resources[0] = { ...resources[0]!, ...change };
      const errors = validateCityHubContent(contents, fixtureReferenceDate).join(" ");
      expect(errors).not.toBe("");
    }
    const duplicate = cloneContents();
    const ivano = duplicate.find((content) => content.cityId === "ivano-frankivsk")!;
    (ivano as unknown as Record<string, unknown>).planningResources = [duplicate[0]!.planningResources[0], duplicate[0]!.planningResources[0]];
    expect(validateCityHubContent(duplicate, fixtureReferenceDate).join(" ")).toContain("duplicate planning resource URL");
  });

  it("checks editorial and source dates against injected reference dates around boundaries", () => {
    for (const review of ["2035-04-10", "2045-04-10"]) {
      const synthetic = syntheticDateFixture(review, review);
      const before = new Date(`${review}T00:00:00Z`);
      before.setUTCDate(before.getUTCDate() - 1);
      const after = new Date(`${review}T00:00:00Z`);
      after.setUTCDate(after.getUTCDate() + 1);
      expect(validateCityHubContent(synthetic, before.toISOString().slice(0, 10)).join(" ")).toContain("in the future");
      expect(validateCityHubContent(synthetic, review)).toEqual([]);
      expect(validateCityHubContent(synthetic, after.toISOString().slice(0, 10))).toEqual([]);

      const prior = before.toISOString().slice(0, 10);
      const checkedAtOnly = syntheticDateFixture(prior, prior, review);
      expect(validateCityHubContent(checkedAtOnly, prior).join(" ")).toContain("checkedAt date is in the future");
      expect(validateCityHubContent(checkedAtOnly, review)).toEqual([]);
      expect(validateCityHubContent(checkedAtOnly, after.toISOString().slice(0, 10))).toEqual([]);

      const following = new Date(`${review}T00:00:00Z`);
      following.setUTCDate(following.getUTCDate() + 1);
      const contentDate = following.toISOString().slice(0, 10);
      const reviewAfterContent = new Date(`${contentDate}T00:00:00Z`);
      reviewAfterContent.setUTCDate(reviewAfterContent.getUTCDate() + 1);
      const contentUpdatedOnly = syntheticDateFixture(reviewAfterContent.toISOString().slice(0, 10), contentDate, prior);
      expect(validateCityHubContent(contentUpdatedOnly, review).join(" ")).toContain("contentUpdatedAt date is in the future");
      expect(validateCityHubContent(contentUpdatedOnly, contentDate).join(" ")).not.toContain("contentUpdatedAt date is in the future");
      expect(validateCityHubContent(contentUpdatedOnly, reviewAfterContent.toISOString().slice(0, 10))).toEqual([]);
    }
    const reversed = syntheticDateFixture("2045-04-10", "2045-04-11");
    expect(validateCityHubContent(reversed, "2045-04-12").join(" ")).toContain("contentUpdatedAt date follows reviewedAt");
    const malformed = syntheticDateFixture("2045-02-30", "2045-02-29", "2045-02-29");
    expect(validateCityHubContent(malformed, "2045-03-01").join(" ")).toMatch(/invalid reviewedAt date|invalid contentUpdatedAt date|invalid checkedAt date/);
  });
});

describe("accepted nearby conditional wording", () => {
  it("retains the eight exact conditional explanations without geographic or service promises", async () => {
    const {readFileSync} = await import("node:fs");
    const copy = JSON.parse(readFileSync(new URL("../../ops/evidence/seo-s04-2026-10-27/copy-records.json", import.meta.url), "utf8"));
    const keys = ["lv-nearby-examples.lviv-zhovkva", "lv-nearby-examples.lviv-yavoriv", "lv-nearby-examples.lviv-zolochiv", "lv-nearby-examples.lviv-sambir", "if-nearby-examples.if-kolomyia", "if-nearby-examples.if-tysmenytsia", "if-nearby-examples.if-rogatyn", "if-nearby-examples.if-bohorodchany"];
    for (const key of keys) {
      const place = cityHubContents.map((hub) => hub.nearbyPlaces.find((place) => place.contentKey === key.split(".")[1])).find(Boolean);
      expect(place?.guidance).toBe(copy.records[key].text);
      expect(place?.geographySource.checkedAt).toBe("2026-10-25");
    }
  });
});
