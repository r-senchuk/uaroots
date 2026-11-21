import { describe, expect, it } from "vitest";
import { assertSafeInternalHref } from "@/components/PermanentRedirect";
import { serializeJsonLd } from "./json-ld";

describe("PermanentRedirect safety", () => {
  it("allows relative internal paths", () => {
    expect(assertSafeInternalHref("/")).toBe("/");
    expect(assertSafeInternalHref("/about/")).toBe("/about/");
  });

  it("rejects external URLs, protocol-relative URLs, javascript URLs, and CRLF", () => {
    for (const unsafe of [
      "https://evil.example/",
      "//evil.example/",
      "javascript:alert(1)",
      "/about/\r\nLocation: https://evil.example",
      "about/",
    ]) {
      expect(() => assertSafeInternalHref(unsafe)).toThrow(TypeError);
    }
  });

  it("escapes script-closing sequences when serialized for inline location.replace", () => {
    const serialized = serializeJsonLd("/about/</script><script>alert(1)</script>");
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toBe("/about/</script><script>alert(1)</script>");
  });
});
