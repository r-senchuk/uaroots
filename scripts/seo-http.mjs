import { dirname, resolve } from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mainDocuments = ["/", "/routes/", "/about/", "/imprint/", "/privacy/"];
const commercialSlugs = [
  "lviv-hannover", "lviv-celle", "ivano-frankivsk-wolfsburg", "dolyna-celle", "celle-dolyna",
  "dolyna-wolfsburg", "wolfsburg-dolyna", "dolyna-braunschweig", "braunschweig-dolyna",
  "celle-lviv", "wolfsburg-ivano-frankivsk",
];
const editorialSlugs = ["lviv-hamburg", "lviv-berlin"];
const citySlugs = ["lviv", "ivano-frankivsk"];
const legacy = [["contact", "/about/"], ["contacts", "/about/"], ["carriers", "/routes/"], ["packages", "/about/"], ["gallery", "/"]];
const maxBodyBytes = 512 * 1024;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readBounded(response) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < maxBodyBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value.subarray(0, maxBodyBytes - total);
    chunks.push(chunk);
    total += chunk.byteLength;
    if (chunk.byteLength !== value.byteLength) {
      await reader.cancel();
      break;
    }
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function requestChain(url, method = "GET", timeoutMs = 2500) {
  const chain = [];
  let current = new URL(url);
  const allowedHosts = new Set([current.hostname, "uaroute.com", "www.uaroute.com"]);
  for (let hop = 0; hop < 6; hop += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    let body = "";
    try {
      response = await fetch(current, {
        method,
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "UARoute-SEO-read-only-evaluator/1.0", accept: "text/html,*/*;q=0.1" },
      });
      if (method !== "HEAD") body = await readBounded(response);
    } finally {
      clearTimeout(timeout);
    }
    const location = response.headers.get("location");
    chain.push({
      url: current.href,
      status: response.status,
      location,
      contentType: response.headers.get("content-type"),
      body,
    });
    if (![301, 302, 303, 307, 308].includes(response.status) || !location) return chain;
    current = new URL(location, current);
    assert(allowedHosts.has(current.hostname), "redirect chain left the configured site hosts");
  }
  throw new Error("redirect chain exceeded six responses");
}

async function runPool(jobs, width) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(width, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const index = cursor;
      cursor += 1;
      await jobs[index]();
    }
  });
  await Promise.all(workers);
}

function canonicalOf(html) {
  return html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i)?.[1] ?? null;
}

export function currentExportAssets(exportDir = resolve(root, "out")) {
  const html = readFileSync(resolve(exportDir, "index.html"), "utf8");
  const script = html.match(/\bsrc=["'](\/_next\/static\/chunks\/[^"']+\.js)["']/i)?.[1];
  const css = html.match(/\bhref=["'](\/_next\/static\/css\/[^"']+\.css)["']/i)?.[1];
  assert(script && css, "current export must expose a JavaScript chunk and stylesheet");
  const cssText = readFileSync(resolve(exportDir, css.slice(1)), "utf8");
  const font = cssText.match(/url\(["']?(\/_next\/static\/media\/[^)"']+\.woff2)["']?\)/i)?.[1];
  assert(font, "current export stylesheet must reference a WOFF2 font");
  return { script, css, font };
}

function check(results, label, condition, detail, evidence) {
  results.push({ label, state: condition ? "pass" : "fail", detail: condition ? "" : detail, evidence });
}

export async function evaluateOne(results, { label, url, method = "GET", expect, bodyCheck = undefined }) {
  try {
    const chain = await requestChain(url, method);
    const evidence = chain.map(({ url: requestUrl, status, location, contentType }) => ({
      url: requestUrl, status, location, contentType,
    }));
    const first = chain[0];
    const last = chain[chain.length - 1];
    const redirectCount = chain.length - 1;
    if (expect.redirectTo) {
      check(results, `${label} ${method} Location`, first.location === expect.redirectTo,
        `expected raw Location ${expect.redirectTo}; got ${first.location ?? "none"}`, evidence);
      check(results, `${label} ${method} permanent redirect`, [301, 308].includes(first.status),
        `expected 301/308; got ${first.status}`, evidence);
    }
    if (expect.maxRedirects !== undefined) {
      check(results, `${label} ${method} redirect count`, redirectCount <= expect.maxRedirects,
        `expected at most ${expect.maxRedirects}; got ${redirectCount}`, evidence);
    }
    if (expect.finalStatus !== undefined) {
      check(results, `${label} ${method} final status`, last.status === expect.finalStatus,
        `expected ${expect.finalStatus}; got ${last.status}`, evidence);
    }
    if (expect.firstStatuses) {
      check(results, `${label} ${method} first status`, expect.firstStatuses.includes(first.status),
        `expected first status in ${expect.firstStatuses.join("/")}; got ${first.status}`, evidence);
    }
    if (expect.finalUrl) {
      check(results, `${label} ${method} final URL`, last.url === expect.finalUrl,
        `expected final URL ${expect.finalUrl}; got ${last.url}`, evidence);
    }
    if (expect.notStatus !== undefined) {
      check(results, `${label} ${method} status not ${expect.notStatus}`, last.status !== expect.notStatus,
        `unexpected ${expect.notStatus} response`, evidence);
    }
    if (expect.allowedStatuses) {
      check(results, `${label} ${method} error status`, expect.allowedStatuses.includes(last.status),
        `expected an object-missing error (${expect.allowedStatuses.join("/")}); got ${last.status}`, evidence);
    }
    if (expect.contentType) {
      const expectedTypes = Array.isArray(expect.contentType) ? expect.contentType : [expect.contentType];
      const actualType = (last.contentType ?? "").toLowerCase();
      check(results, `${label} ${method} content type`, expectedTypes.some((type) => actualType.includes(type)),
        `expected ${expectedTypes.join(" or ")}; got ${last.contentType ?? "missing content-type"}`, evidence);
    }
    if (bodyCheck) bodyCheck(results, label, method, first, last, chain, evidence);
  } catch (error) {
    results.push({ label: `${label} ${method}`, state: "unknown", detail: `network/evaluator error: ${error.message}`,
      evidence: [{ url: String(url), status: null, location: null, contentType: null }] });
  }
}

export async function evaluate(origin = "https://uaroute.com") {
  const base = new URL(origin);
  assert(["http:", "https:"].includes(base.protocol), "origin must use HTTP or HTTPS");
  assert(base.pathname === "/" && !base.search && !base.hash, "origin must be an origin URL without path/query");
  const results = [];
  const jobs = [];
  const schedule = (options) => jobs.push(() => evaluateOne(results, options));
  const exportAssets = currentExportAssets();
  const urls = [...mainDocuments, ...commercialSlugs.map((slug) => `/routes/${slug}/`),
    ...citySlugs.map((slug) => `/cities/${slug}/`), ...editorialSlugs.map((slug) => `/routes/${slug}/`)];

  for (const path of urls) {
    const expectedCanonical = `https://uaroute.com${path}`;
    for (const method of ["GET", "HEAD"]) {
      schedule({
        label: `document ${path}`,
        url: new URL(path, base),
        method,
        expect: { finalStatus: 200, maxRedirects: 0, contentType: method === "GET" ? "text/html" : undefined },
        bodyCheck: method === "GET" ? (checks, label, _method, _first, last) => {
          check(checks, `${label} canonical`, canonicalOf(last.body) === expectedCanonical,
            `expected canonical ${expectedCanonical}; got ${canonicalOf(last.body) ?? "none"}`);
          if (editorialSlugs.some((slug) => label.includes(slug))) {
            check(checks, `${label} editorial noindex`, /<meta\b[^>]*name=["']robots["'][^>]*content=["']noindex\s*,\s*follow["']/i.test(last.body),
              "expected noindex, follow");
          }
        } : undefined,
      });
    }
  }

  for (const [slug, target] of legacy) {
    for (const path of [`/${slug}`, `/${slug}/`]) {
      const expected = `https://uaroute.com${target}`;
      for (const method of ["GET", "HEAD"]) {
        schedule({ label: `legacy ${path}`, url: new URL(path, base), method,
          expect: { redirectTo: expected, maxRedirects: 1, finalStatus: 200, finalUrl: expected } });
      }
    }
  }
  for (const [path, target] of [["/index.html", "/"], ["/routes/index.html", "/routes/"]]) {
    for (const method of ["GET", "HEAD"]) {
      const expected = `https://uaroute.com${target}`;
      schedule({ label: `known alias ${path}`, url: new URL(path, base), method,
        expect: { redirectTo: expected, maxRedirects: 1, finalStatus: 200, finalUrl: expected } });
    }
  }

  const syntheticQuery = "?utm_source=seo_qa&utm_medium=test&tag=a&tag=b&encoded=%2F%26+&blank=";
  for (const [path, target] of [["/routes", "/routes/"], ["/routes/index.html", "/routes/"], ["/contact", "/about/"]]) {
    const queryExpected = `https://uaroute.com${target}${syntheticQuery}`;
    schedule({ label: `query preservation ${path}`, url: new URL(path + syntheticQuery, base), method: "GET",
      expect: { redirectTo: queryExpected, maxRedirects: 1, finalStatus: 200, finalUrl: queryExpected } });
  }

  schedule({ label: "www canonical host", url: new URL("https://www.uaroute.com/routes/", base),
    expect: { redirectTo: "https://uaroute.com/routes/", maxRedirects: 1, finalStatus: 200,
      finalUrl: "https://uaroute.com/routes/" } });
  schedule({ label: "HTTP canonical protocol", url: new URL("http://uaroute.com/routes/", base),
    expect: { maxRedirects: 2, finalStatus: 200, firstStatuses: [301, 308], finalUrl: "https://uaroute.com/routes/" } });
  schedule({ label: "HTTP www legacy normalization", url: new URL("http://www.uaroute.com/contact/", base),
    expect: { maxRedirects: 2, finalStatus: 200, firstStatuses: [301, 308], finalUrl: "https://uaroute.com/about/" } });

  for (const path of ["/seo-http-missing-document-20261007/", "/routes/unknown-nested-slug/", "/provider/unknown/"]) {
    for (const method of ["GET", "HEAD"]) {
      schedule({ label: `unknown document ${path}`, url: new URL(path, base), method,
        expect: { finalStatus: 404, maxRedirects: 0 },
        bodyCheck: method === "GET" ? (checks, label, _method, _first, last, _chain, evidence) => {
          check(checks, `${label} no homepage canonical`, !canonicalOf(last.body) || canonicalOf(last.body) !== "https://uaroute.com/",
            "unknown page declared homepage canonical", evidence);
          check(checks, `${label} noindex`, /noindex/i.test(last.body), "unknown page is missing noindex", evidence);
        } : undefined,
      });
    }
  }
  for (const path of ["/seo-http-missing-image-20261007.webp", "/_next/seo-http-missing-asset.js", "/routes/unknown/index.txt"]) {
    schedule({ label: `missing static object ${path}`, url: new URL(path, base),
      expect: { maxRedirects: 0, allowedStatuses: [403, 404] } });
  }
  for (const [path, type] of [[exportAssets.script, ["application/javascript", "text/javascript"]],
    [exportAssets.css, "text/css"], [exportAssets.font, ["font/woff2", "application/font-woff"]],
    ["/arrival-560.webp", "image/webp"], ["/icon.svg", "image/svg+xml"],
    ["/routes/lviv-celle/index.txt", ["text/x-component", "text/plain"]]]) {
    schedule({ label: `static object ${path}`, url: new URL(path, base),
      expect: { finalStatus: 200, maxRedirects: 0, contentType: type } });
  }
  schedule({ label: "robots.txt", url: new URL("/robots.txt", base),
    expect: { finalStatus: 200, maxRedirects: 0, contentType: "text/plain" } });
  schedule({ label: "sitemap.xml", url: new URL("/sitemap.xml", base),
    expect: { finalStatus: 200, maxRedirects: 0, contentType: "application/xml" } });

  await runPool(jobs, 6);
  return results;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const args = process.argv.slice(2);
  let origin = "https://uaroute.com";
  let outputPath;
  let originSeen = false;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--output") {
      assert(args[i + 1] && !args[i + 1].startsWith("--"), "--output requires a file path");
      outputPath = resolve(args[i + 1]);
      i += 1;
    } else if (args[i].startsWith("--")) {
      throw new Error(`unknown option: ${args[i]}`);
    } else {
      assert(!originSeen, "provide at most one origin URL");
      origin = args[i];
      originSeen = true;
    }
  }
  const results = await evaluate(origin);
  const counts = results.reduce((acc, result) => ({ ...acc, [result.state]: acc[result.state] + 1 }), { pass: 0, fail: 0, unknown: 0 });
  console.log(`seo-http: ${counts.pass} pass, ${counts.fail} fail, ${counts.unknown} unknown (${origin})`);
  for (const result of results.filter(({ state }) => state !== "pass")) {
    console.log(`${result.state.toUpperCase()} ${result.label}: ${result.detail}`);
  }
  if (outputPath) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify({
      evaluatedAt: new Date().toISOString(),
      scope: "Public GET/HEAD only; synthetic query parameters; no cookies, credentials, or contact sends",
      origin,
      counts,
      results,
    }, null, 2)}\n`);
    console.log(`seo-http: wrote sanitized response evidence to ${outputPath}`);
  }
  if (counts.fail || counts.unknown) process.exitCode = 1;
}
