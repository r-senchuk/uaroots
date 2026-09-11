import { describe, expect, it } from "vitest";

import { findRouteByCities, searchCities } from "./queries";

describe("searchCities", () => {
  it("matches Ukrainian names and Latin aliases", () => {
    const byName = searchCities("Льв");
    expect(byName.some((city) => city.id === "lviv")).toBe(true);

    const byAlias = searchCities("hanover");
    expect(byAlias.some((city) => city.id === "hannover")).toBe(true);
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

  it("returns undefined when no corridor exists", () => {
    expect(findRouteByCities("hannover", "lviv")).toBeUndefined();
  });
});
