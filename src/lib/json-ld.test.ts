import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("escapes closing script strings while preserving JSON values", () => {
    const value = { name: "</script><script>alert(1)</script>" };
    const serialized = serializeJsonLd(value);

    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(value);
  });

  it("escapes less-than characters in nested values", () => {
    const value = {
      nested: [{ text: "a < b" }, { text: "</script>" }],
    };

    expect(serializeJsonLd(value)).toBe(
      '{"nested":[{"text":"a \\u003c b"},{"text":"\\u003c/script>"}]}'
    );
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });

  it("keeps ordinary JSON unchanged", () => {
    const value = { "@type": "Organization", name: "Коваль", active: true };

    expect(serializeJsonLd(value)).toBe(JSON.stringify(value));
  });

  it("fails closed when the top-level value has no JSON representation", () => {
    expect(() => serializeJsonLd(undefined)).toThrow(TypeError);
  });
});
