import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const options = process.argv.slice(2);
const checkOnly = options.includes("--check");
const exportArg = options.find((arg) => !arg.startsWith("--")) ?? "out";
const exportRoot = resolve(root, exportArg);
const functionPath = join(root, "infra/cloudfront/seo-viewer-request.v1.js");
const sitemapExpected = [
  "/", "/routes/", "/about/", "/imprint/", "/privacy/",
  "/routes/lviv-hannover/", "/routes/lviv-celle/", "/routes/ivano-frankivsk-wolfsburg/",
  "/routes/dolyna-celle/", "/routes/celle-dolyna/", "/routes/dolyna-wolfsburg/",
  "/routes/wolfsburg-dolyna/", "/routes/dolyna-braunschweig/", "/routes/braunschweig-dolyna/",
  "/routes/celle-lviv/", "/routes/wolfsburg-ivano-frankivsk/",
  "/cities/lviv/", "/cities/ivano-frankivsk/", "/cities/celle/",
];
const editorialDocuments = ["/routes/lviv-hamburg/", "/routes/lviv-berlin/"];
const legacyRedirects = {
  contact: "/about/",
  contacts: "/about/",
  carriers: "/routes/",
  packages: "/about/",
  gallery: "/",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonicalIn(html) {
  const matches = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag.match(/\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i)?.[1])
    .filter(Boolean);
  return matches;
}

function sitemapPaths() {
  const xml = readFileSync(join(exportRoot, "sitemap.xml"), "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(([, url]) => url.trim());
  const paths = urls.map((url) => {
    const parsed = new URL(url);
    assert(parsed.origin === "https://uaroute.com" && !parsed.search && !parsed.hash,
      `sitemap has an unexpected URL: ${url}`);
    return parsed.pathname;
  });
  assert(paths.length === 19, `expected the reviewed 19 sitemap URLs; found ${paths.length}`);
  assert(new Set(paths).size === paths.length, "sitemap contains duplicate document paths");
  assert([...paths].sort().join("\n") === [...sitemapExpected].sort().join("\n"),
    "sitemap paths differ from the reviewed commercial/export document set");
  return paths;
}

function exportKey(path) {
  return path === "/" ? "index.html" : `${path.slice(1)}index.html`;
}

function objectKey(path) {
  return `/${exportKey(path)}`;
}

function generate() {
  const sitemap = sitemapPaths();
  const documents = [...sitemap, ...editorialDocuments];
  for (const path of documents) {
    const key = exportKey(path);
    const html = readFileSync(join(exportRoot, key), "utf8");
    assert(canonicalIn(html).join() === `https://uaroute.com${path}`,
      `${path} must have one absolute self-canonical`);
    if (editorialDocuments.includes(path)) {
      assert(/<meta\b[^>]*name=["']robots["'][^>]*content=["']noindex\s*,\s*follow["']/i.test(html),
        `${path} must remain noindex, follow`);
    }
  }

  for (const [slug, destination] of Object.entries(legacyRedirects)) {
    const path = join(exportRoot, slug, "index.html");
    const html = readFileSync(path, "utf8");
    assert(html.includes(destination), `legacy export ${slug}/ must still target ${destination}`);
  }

  const notFound = readFileSync(join(exportRoot, "404.html"), "utf8");
  assert(/<h1\b[^>]*>[\s\S]*?(?:не знайдено|не знайдена)[\s\S]*?<\/h1>/i.test(notFound),
    "404.html must contain a useful Ukrainian not-found heading");
  assert(!/rel=["']canonical["'][^>]*href=["']https:\/\/uaroute\.com\/["']/i.test(notFound),
    "404.html must not canonicalize to the homepage");

  const entries = documents.map((path) => `  ${JSON.stringify(path)}: ${JSON.stringify(objectKey(path))}`).join(",\n");
  let source = readFileSync(functionPath, "utf8");
  const marker = /var SEO_DOCUMENTS = \{[\s\S]*?\n\};/;
  assert(marker.test(source), "viewer function has no SEO_DOCUMENTS block");
  source = source.replace(marker, `var SEO_DOCUMENTS = {\n${entries}\n};`);
  assert(Buffer.byteLength(source, "utf8") < 10 * 1024, "CloudFront Function exceeds its 10 KiB code quota");
  const current = readFileSync(functionPath, "utf8");
  if (checkOnly) assert(current === source, "CloudFront viewer function is stale; run npm run seo:generate");
  else writeFileSync(functionPath, source);
  const hash = createHash("sha256").update(source).digest("hex");
  console.log(`seo-http-generate${checkOnly ? " --check" : ""}: ${documents.length} HTML documents (19 indexed + 2 editorial), SHA-256 ${hash}`);
}

generate();
