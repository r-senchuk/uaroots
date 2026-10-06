import { describe, expect, it } from "vitest";

import { cities } from "./cities";
import { pilotGermanCityIds, pilotUkrainianCityIds, selectedCandidatePairs } from "./discovery";
import { findRouteByCities, isCandidateInquiryEligiblePair, listResolvedRoutes, searchCities } from "./queries";

describe("searchCities", () => {
  it("resolves every checked-in display name and search alias to its city", () => {
    for (const city of cities) {
      for (const term of [city.name, ...city.aliases]) {
        expect(searchCities(term, cities.length)[0]?.id, `search term: ${term}`).toBe(city.id);
      }
    }
  });

  it("matches accented, ASCII, punctuation, and case variants", () => {
    expect(searchCities("LUNEBURG")[0]?.id).toBe("lueneburg");
    expect(searchCities("LÜNEBURG")[0]?.id).toBe("lueneburg");
    expect(searchCities("Lwów")[0]?.id).toBe("lviv");
    expect(searchCities("ivano frankivsk")[0]?.id).toBe("ivano-frankivsk");
  });

  it("keeps Mykolaiv in Lviv Oblast visibly and explicitly disambiguated", () => {
    const city = searchCities("Mykolaiv Lviv Oblast")[0];
    expect(city?.id).toBe("mykolaiv-lviv");
    expect(city?.name).toContain("Львівська область");
    expect(city?.aliases).not.toContain("Nikolaev");
    expect(city?.aliases).not.toContain("Миколаїв");
    expect(city?.aliases).not.toContain("Миколаев");
  });

  it("returns an empty list for a blank query", () => {
    expect(searchCities("   ")).toEqual([]);
  });
});

describe("findRouteByCities", () => {
  it("resolves Львів → Ганновер", () => {
    const route = findRouteByCities("lviv", "hannover");
    expect(route?.slug).toBe("lviv-hannover");
    expect(route?.origin.name).toBe("Львів");
    expect(route?.destination.name).toBe("Ганновер");
  });

  it("resolves only the ten explicitly selected candidate pages", () => {
    for (const { originCityId, destinationCityId, slug } of selectedCandidatePairs) {
      expect(findRouteByCities(originCityId, destinationCityId, { commercialOnly: true })?.slug).toBe(slug);
    }
    expect(listResolvedRoutes("commercial").filter((route) => route.serviceMode === "candidate_inquiry")).toHaveLength(10);
    expect(findRouteByCities("kalush", "schwerin", { commercialOnly: true })).toBeUndefined();
  });

  it("returns undefined when no corridor exists", () => {
    expect(findRouteByCities("hannover", "lviv")).toBeUndefined();
  });

  it("omits editorial corridors when commercialOnly is set", () => {
    expect(findRouteByCities("lviv", "hamburg")).toBeDefined();
    expect(findRouteByCities("lviv", "hamburg", { commercialOnly: true })).toBeUndefined();
  });
});

describe("isCandidateInquiryEligiblePair", () => {
  it("allows only pilot Ukrainian candidate cities paired with one of six German pilot cities", () => {
    const dolyna = cities.find((city) => city.id === "dolyna")!;
    const celle = cities.find((city) => city.id === "celle")!;
    const kalush = cities.find((city) => city.id === "kalush")!;
    const hamburg = cities.find((city) => city.id === "hamburg")!;
    expect(isCandidateInquiryEligiblePair(dolyna, celle)).toBe(true);
    expect(isCandidateInquiryEligiblePair(celle, dolyna)).toBe(true);
    expect(isCandidateInquiryEligiblePair(kalush, celle)).toBe(true);
    expect(isCandidateInquiryEligiblePair(dolyna, hamburg)).toBe(false);
    expect(isCandidateInquiryEligiblePair(celle, hamburg)).toBe(false);
  });

  it("recognizes all 168 bounded Ukrainian–German directions without publishing every pair", () => {
    for (const originId of pilotUkrainianCityIds) {
      const origin = cities.find((city) => city.id === originId)!;
      for (const destinationId of pilotGermanCityIds) {
        const destination = cities.find((city) => city.id === destinationId)!;
        expect(isCandidateInquiryEligiblePair(origin, destination), `${originId} → ${destinationId}`).toBe(true);
        expect(isCandidateInquiryEligiblePair(destination, origin), `${destinationId} → ${originId}`).toBe(true);
      }
    }
    expect(listResolvedRoutes("commercial").filter((route) => route.serviceMode === "candidate_inquiry")).toHaveLength(10);
  });
});
