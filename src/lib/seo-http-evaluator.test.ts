import { afterEach, describe, expect, it, vi } from "vitest";

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { currentExportAssets, evaluateOne, requestChain } from "../../scripts/seo-http.mjs";

afterEach(() => vi.unstubAllGlobals());

describe("read-only SEO HTTP evaluator", () => {
  it("discovers the current export's hashed script, stylesheet and font before network checks", () => {
    const directory = mkdtempSync(join(tmpdir(), "uaroute-http-assets-"));
    try {
      mkdirSync(join(directory, "_next/static/css"), { recursive: true });
      writeFileSync(join(directory, "index.html"), '<script src="/_next/static/chunks/app.js"></script><link href="/_next/static/css/app.css" rel="stylesheet">');
      writeFileSync(join(directory, "_next/static/css/app.css"), '@font-face{src:url(/_next/static/media/font.woff2)}');
      expect(currentExportAssets(directory)).toEqual({
        script: "/_next/static/chunks/app.js",
        css: "/_next/static/css/app.css",
        font: "/_next/static/media/font.woff2",
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it("fails when an allegedly missing object resolves to 200", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("home", { status: 200 })));
    const results: Array<{ state: string }> = [];
    await evaluateOne(results, {
      label: "missing image",
      url: new URL("https://uaroute.com/missing.webp"),
      expect: { allowedStatuses: [403, 404], maxRedirects: 0 },
    });
    expect(results.some(({ state }) => state === "fail")).toBe(true);
  });

  it("fails when a success response omits its expected content type", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 200 })));
    const results: Array<{ state: string }> = [];
    await evaluateOne(results, {
      label: "RSC payload",
      url: new URL("https://uaroute.com/routes/lviv-celle/index.txt"),
      expect: { finalStatus: 200, contentType: "text/plain" },
    });
    expect(results.some(({ state }) => state === "fail")).toBe(true);
  });

  it("accepts the Next Flight MIME type used by streamed and static-export payloads", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, {
      status: 200,
      headers: { "content-type": "text/x-component; charset=utf-8" },
    })));
    const results: Array<{ state: string }> = [];
    await evaluateOne(results, {
      label: "RSC payload",
      url: new URL("https://uaroute.com/routes/lviv-celle/index.txt"),
      expect: { finalStatus: 200, contentType: ["text/x-component", "text/plain"] },
    });
    expect(results.some(({ state }) => state === "fail")).toBe(false);
  });

  it("refuses to follow redirects outside the two site hosts", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, {
      status: 302,
      headers: { location: "https://attacker.example/collect" },
    })));
    await expect(requestChain("https://uaroute.com/contact/")).rejects.toThrow("left the configured site hosts");
  });
});
