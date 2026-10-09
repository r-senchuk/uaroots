import { describe, expect, it } from "vitest";

import { cityHubContents, type CityHubContent } from "@/data/city-hubs";
import { cities } from "@/data/cities";
import { cityHubPaths, pilotUkrainianCityIds, selectedCandidatePairs } from "@/data/discovery";
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
  return [record("lviv", "Fixture City A", "lviv-hannover"), record("ivano-frankivsk", "Fixture City B", "ivano-frankivsk-wolfsburg")];
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
  it("accepts the selected hub data and permits empty named-place lists", () => {
    expect(validateCityHubContent(cityHubContents)).toEqual([]);
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
