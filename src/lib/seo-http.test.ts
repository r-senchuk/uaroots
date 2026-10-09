import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd());
const artifact = readFileSync(join(root, "infra/cloudfront/seo-viewer-request.v1.js"), "utf8");
const handler = runInNewContext(`${artifact}\n;handler`);

type RequestOptions = NonNullable<Parameters<typeof request>[1]>;

function request(uri: string, options: {
  host?: string;
  method?: string;
  headers?: Record<string, { value: string }>;
  rawQueryString?: string;
  querystring?: Record<string, { value: string; multiValue?: { value: string }[] }>;
} = {}) {
  return {
    method: options.method ?? "GET",
    uri,
    querystring: options.querystring ?? {},
    headers: { host: { value: options.host ?? "uaroute.com" }, ...options.headers },
    ...(options.rawQueryString === undefined ? {} : { rawQueryString: () => options.rawQueryString }),
  };
}

const documents = [
  "/", "/routes/", "/about/", "/imprint/", "/privacy/",
  "/routes/lviv-hannover/", "/routes/lviv-celle/", "/routes/ivano-frankivsk-wolfsburg/",
  "/routes/dolyna-celle/", "/routes/celle-dolyna/", "/routes/dolyna-wolfsburg/",
  "/routes/wolfsburg-dolyna/", "/routes/dolyna-braunschweig/", "/routes/braunschweig-dolyna/",
  "/routes/celle-lviv/", "/routes/wolfsburg-ivano-frankivsk/", "/cities/lviv/",
  "/cities/ivano-frankivsk/", "/cities/celle/", "/routes/lviv-hamburg/", "/routes/lviv-berlin/",
];

describe("CloudFront SEO viewer request policy v1", () => {
  it("contains only the 19 public sitemap documents and two known editorial documents", () => {
    const block = artifact.match(/var SEO_DOCUMENTS = \{([\s\S]*?)\n\};/)?.[1] ?? "";
    const keys = [...block.matchAll(/^\s*"([^"]+)":/gm)].map(([, path]) => path);
    expect(keys).toEqual(documents);
  });

  it("rewrites each known HTML document to its static key on canonical host", () => {
    for (const path of documents) {
      const response = handler({ request: request(path) });
      const key = path === "/" ? "/index.html" : `${path}index.html`;
      expect(response.uri, path).toBe(key);
    }
  });

  it.each(["GET", "HEAD"]) ("serves an unknown nested/provider document as a generated 404 for %s", (method) => {
    for (const path of ["/random-unknown/", "/routes/a-never-exported-slug/", "/cities/stryi/", "/provider/unknown/", "/unknown/index.html", "/unknown.html"]) {
      const response = handler({ request: request(path, { method }) });
      expect(response.statusCode, path).toBe(404);
      expect(response.headers.location, path).toBeUndefined();
      expect(response.body, path).not.toContain("canonical");
      expect(response.headers["x-robots-tag"].value).toBe("noindex, follow");
    }
  });

  it("does not turn absent assets, Next files, Flight, or unknown RSC into HTML", () => {
    for (const path of ["/missing.webp", "/missing.js", "/robots.txt", "/sitemap.xml", "/_next/static/missing.js",
      "/routes/lviv-celle/index.txt", "/routes/not-exported/index.txt", "/__next._tree.txt"]) {
      const original = request(path);
      const response = handler({ request: original });
      expect(response).toBe(original);
      expect(response.uri).toBe(path);
    }
  });

  it("rewrites canonical document Flight requests to the matching index.txt without changing the query", () => {
    const flightOptions: RequestOptions[] = [
      { querystring: { rsc: { value: "1" } } },
      { querystring: { _rsc: { value: "abc123" } } },
      { headers: { rsc: { value: "1" } } },
    ];
    for (const options of flightOptions) {
      const original = request("/routes/lviv-celle/", options);
      const response = handler({ request: original });
      expect(response.uri).toBe("/routes/lviv-celle/index.txt");
      expect(response.querystring).toBe(original.querystring);
    }
    const celleFlight = request("/cities/celle/", { querystring: { _rsc: { value: "celle123" }, keep: { value: "yes" } } });
    const celleResponse = handler({ request: celleFlight });
    expect(celleResponse.uri).toBe("/cities/celle/index.txt");
    expect(celleResponse.querystring).toBe(celleFlight.querystring);
  });

  it("redirects the five legacy paths and their slash, index, GET, and HEAD variants exactly", () => {
    const map: Record<string, string> = {
      contact: "/about/", contacts: "/about/", carriers: "/routes/", packages: "/about/", gallery: "/",
    };
    for (const [slug, target] of Object.entries(map)) {
      for (const path of [`/${slug}`, `/${slug}/`, `/${slug}/index.html`]) {
        for (const method of ["GET", "HEAD"]) {
          const response = handler({ request: request(path, { method }) });
          expect(response.statusCode, `${method} ${path}`).toBe(308);
          expect(response.headers.location.value, `${method} ${path}`).toBe(`https://uaroute.com${target}`);
        }
      }
    }
  });

  it("canonicalizes only known documents and preserves duplicate, encoded, plus, and empty query values", () => {
    const querystring = {
      utm_source: { value: "seo_qa" },
      tag: { value: "a", multiValue: [{ value: "a" }, { value: "b" }] },
      encoded: { value: "%2F%26+" },
      blank: { value: "" },
    };
    for (const path of ["/routes", "/routes/index.html", "/cities/celle", "/contact"]) {
      for (const method of ["GET", "HEAD"]) {
        const response = handler({ request: request(path, { method, querystring }) });
        const base = path === "/contact" ? "https://uaroute.com/about/" : path.startsWith("/cities/") ? "https://uaroute.com/cities/celle/" : "https://uaroute.com/routes/";
        expect(response.headers.location.value).toBe(`${base}?utm_source=seo_qa&tag=a&tag=b&encoded=%2F%26+&blank=`);
      }
    }
    const rawQuery = "tag=b&tag=a&encoded=%2f%26+&flag&blank=";
    const rawResponse = handler({ request: request("/routes", { rawQueryString: rawQuery }) });
    expect(rawResponse.headers.location.value).toBe(`https://uaroute.com/routes/?${rawQuery}`);
    const emptyQuery = handler({ request: request("/routes", { rawQueryString: "" }) });
    expect(emptyQuery.headers.location.value).toBe("https://uaroute.com/routes/?");
    const syntheticQuery = handler({ request: request("/routes", { rawQueryString: "", querystring }) });
    expect(syntheticQuery.headers.location.value).toBe("https://uaroute.com/routes/?utm_source=seo_qa&tag=a&tag=b&encoded=%2F%26+&blank=");
    const unknown = handler({ request: request("/random-unknown", { querystring }) });
    expect(unknown.statusCode).toBe(404);
  });

  it("uses one canonical host for known www/host/path aliases and never reflects an untrusted Host", () => {
    const www = handler({ request: request("/routes/", { host: "www.uaroute.com" }) });
    expect(www.statusCode).toBe(308);
    expect(www.headers.location.value).toBe("https://uaroute.com/routes/");
    for (const host of ["attacker.example", "www.uaroute.com.evil", "uaroute.com.attacker.example"]) {
      const original = request("/contact/", { host });
      const response = handler({ request: original });
      expect(response).toBe(original);
      expect(response.headers.location).toBeUndefined();
    }
  });

  it("keeps non-GET/HEAD requests intact", () => {
    for (const method of ["POST", "OPTIONS", "PUT"]) {
      const original = request("/contact/", { method });
      expect(handler({ request: original })).toBe(original);
    }
  });
});
