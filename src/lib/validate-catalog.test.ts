import { describe, expect, it } from "vitest";

import { validateCatalog } from "./validate-catalog";

describe("validateCatalog", () => {
  it("accepts the checked-in M1 dataset", () => {
    expect(validateCatalog()).toEqual([]);
  });
});
